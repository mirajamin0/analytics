import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

export default function DashboardSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');

  useEffect(() => {
    fetch("/api/domains")
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setDomains(json.domains);
          setSelectedDomain(json.domains[0] || '');
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedDomain) return;
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    fetch(`/api/dashboard-summary?domain=${selectedDomain}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res);
        setLoading(false);
      });

    fetch(`/api/daily-users?domain=${selectedDomain}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setDailyData(json.data);
      });
  }, [selectedDomain]);

  if (loading || !data) return <div className="p-6">Loading summary...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold mb-4">Analytics Overview</h1>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-1">Select Website:</label>
        <select
          value={selectedDomain}
          onChange={e => setSelectedDomain(e.target.value)}
          className="p-2 border rounded w-full max-w-xs"
        >
          {domains.map((domain, idx) => (
            <option key={idx} value={domain}>{domain}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card color="green" title="Live Users" value={data.liveUsers.length} />
        <Card color="blue" title="Users Today" value={data.usersToday} />
        <Card color="orange" title="Users Last 30 Days" value={data.users30Days} />
        <Card color="red" title="Tracked Sources" value={data.sources.length} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Live Users (Last 5 minutes)</h2>
        <ul className="bg-white rounded shadow divide-y">
          {data.liveUsers.map((user, idx) => (
            <li key={idx} className="px-4 py-2 flex flex-col md:flex-row justify-between gap-2 text-sm">
              <span>🌐 <strong>URL:</strong> {user.url || 'N/A'}</span>
              <span>📍 <strong>IP:</strong> {user.ip_address || 'Unknown'}</span>
              <span>🌍 <strong>Country:</strong> {user.country || 'Unknown'}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <SourceBreakdown sources={data.sources} />
        <DeviceBreakdown devices={data.devices} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <PieSection title="Sources Pie Chart" data={data.sources} dataKey="source_platform" countKey="count" />
        <PieSection title="Device Type Chart" data={data.devices} dataKey="device_type" countKey="count" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Daily Users (Last 30 Days)</h2>
        <div className="bg-white rounded shadow p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#00C49F" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Top Locations</h2>
        <ul className="bg-white rounded shadow divide-y">
          {data.locations.map((loc, idx) => (
            <li key={idx} className="px-4 py-2 flex justify-between">
              <span>{loc.country}, {loc.region}</span>
              <span className="font-bold">{loc.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Card({ color, title, value }) {
  const colors = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <div className={`p-4 rounded-xl shadow ${colors[color]} space-y-1`}>
      <div className="text-sm uppercase font-semibold">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function SourceBreakdown({ sources }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Traffic Sources</h2>
      <ul className="bg-white rounded shadow divide-y">
        {sources.map((s, idx) => (
          <li key={idx} className="px-4 py-2 flex justify-between">
            <span>{s.source_category} - {s.source_platform}</span>
            <span className="font-bold">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeviceBreakdown({ devices }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Device Types</h2>
      <ul className="bg-white rounded shadow divide-y">
        {devices.map((d, idx) => (
          <li key={idx} className="px-4 py-2 flex justify-between">
            <span>{d.device_type}</span>
            <span className="font-bold">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PieSection({ title, data, dataKey, countKey }) {
  const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#FF6384"];
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={countKey}
            nameKey={dataKey}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
