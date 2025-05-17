import { db } from "@/lib/db";

export default async function handler(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT 
         SUBSTRING_INDEX(SUBSTRING_INDEX(url, '/', 3), '/', -1) AS domain 
       FROM traffic_logs 
       WHERE url IS NOT NULL AND url != ''`
    );

    const domains = rows.map(row => row.domain).filter(Boolean);

    res.status(200).json({ success: true, domains });
  } catch (err) {
    console.error("Domains API Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch domains" });
  }
}
