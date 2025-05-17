import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing token" });
  }

  const [rows] = await db.query(
  "SELECT * FROM traffic_logs WHERE url LIKE ? ORDER BY timestamp DESC LIMIT 100",
  ['%your-website.com%']
);

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM traffic_logs ORDER BY timestamp DESC LIMIT 100");
    return res.status(200).json({ success: true, logs: rows });
  } catch (error) {
    console.error("DB Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch data" });
  }
}
