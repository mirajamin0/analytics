import { db } from "@/lib/db";

export default async function handler(req, res) {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const domain = req.query.domain;

  if (!domain) return res.status(400).json({ success: false, message: "Missing domain" });

  const filter = "%" + domain + "%";

  try {
    const [liveUsers] = await db.query(
      `SELECT MAX(url) AS url, ip_address, MAX(country) AS country, MAX(timestamp) AS last_seen 
       FROM traffic_logs 
       WHERE timestamp >= ? AND url LIKE ?
       GROUP BY ip_address 
       ORDER BY last_seen DESC`,
      [fiveMinutesAgo, filter]
    );

    const [usersToday] = await db.query(
      "SELECT COUNT(*) as count FROM traffic_logs WHERE DATE(timestamp) = CURDATE() AND url LIKE ?",
      [filter]
    );

    const [users30Days] = await db.query(
      "SELECT COUNT(*) as count FROM traffic_logs WHERE timestamp >= ? AND url LIKE ?",
      [thirtyDaysAgo, filter]
    );

    const [sourceBreakdown] = await db.query(
      `SELECT source_category, source_platform, COUNT(*) as count 
       FROM traffic_logs 
       WHERE url LIKE ?
       GROUP BY source_category, source_platform`,
      [filter]
    );

    const [deviceBreakdown] = await db.query(
      "SELECT device_type, COUNT(*) as count FROM traffic_logs WHERE url LIKE ? GROUP BY device_type",
      [filter]
    );

    const [countryStats] = await db.query(
      "SELECT country, region, COUNT(*) as count FROM traffic_logs WHERE url LIKE ? GROUP BY country, region",
      [filter]
    );

    res.status(200).json({
      success: true,
      liveUsers: liveUsers.map(row => ({
        url: row.url || 'N/A',
        ip_address: row.ip_address || 'Unknown',
        country: row.country || 'Unknown',
      })),
      usersToday: usersToday[0]?.count || 0,
      users30Days: users30Days[0]?.count || 0,
      sources: sourceBreakdown,
      devices: deviceBreakdown,
      locations: countryStats
    });
  } catch (err) {
    console.error("Dashboard summary error:", err.message);
    res.status(500).json({ success: false, message: "Failed to load summary" });
  }
}
