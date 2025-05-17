import { db } from "@/lib/db";

export default async function handler(req, res) {
  const domain = req.query.domain;
  if (!domain) return res.status(400).json({ success: false, message: "Missing domain" });

  try {
    const [rows] = await db.query(
      `SELECT DATE(timestamp) as date, COUNT(*) as count
       FROM traffic_logs
       WHERE timestamp >= NOW() - INTERVAL 30 DAY AND url LIKE ?
       GROUP BY DATE(timestamp)
       ORDER BY date ASC`,
      ["%" + domain + "%"]
    );

    const formatted = rows.map(row => ({
      date: row.date.toISOString().split('T')[0],
      count: row.count
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error("Daily Users Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch daily users" });
  }
}
