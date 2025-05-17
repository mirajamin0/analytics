import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body;

  const [rows] = await db.query("SELECT * FROM admins WHERE username = ?", [username]);
  const admin = rows[0];

  if (!admin) return res.status(401).json({ error: "Invalid username" });
  if (admin.password !== password) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({ success: true, token });
}
