import { db } from "@/lib/db";
import { getGeoData } from "@/utils/geoLookup";

function detectSource(referrer) {
  if (!referrer) return { category: "direct", platform: "Direct" };

  const ref = referrer.toLowerCase();

  const social = {
    "facebook.com": "Facebook",
    "whatsapp.com": "WhatsApp",
    "youtube.com": "YouTube",
    "instagram.com": "Instagram",
    "tiktok.com": "TikTok",
    "wechat.com": "WeChat",
    "telegram.org": "Telegram",
    "snapchat.com": "Snapchat",
    "twitter.com": "X",
    "x.com": "X",
    "pinterest.com": "Pinterest",
    "reddit.com": "Reddit",
    "linkedin.com": "LinkedIn",
    "quora.com": "Quora",
    "discord.com": "Discord",
    "twitch.tv": "Twitch",
    "tumblr.com": "Tumblr",
    "threads.net": "Threads"
  };

  const search = {
    "google.": "Google",
    "bing.com": "Bing",
    "yahoo.com": "Yahoo",
    "yandex.": "Yandex",
    "duckduckgo.com": "DuckDuckGo"
  };

  for (const domain in social) {
    if (ref.includes(domain)) return { category: "social", platform: social[domain] };
  }

  for (const domain in search) {
    if (ref.includes(domain)) return { category: "organic", platform: search[domain] };
  }

  try {
    const host = new URL(referrer).hostname;
    return { category: "referral", platform: host };
  } catch {
    return { category: "referral", platform: "Unknown" };
  }
}

function detectDevice(userAgent) {
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(ua)) return "tablet";
  if (/mobi|android|touch/.test(ua)) return "mobile";
  return "desktop";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { url, referrer, userAgent } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  const geo = await getGeoData(ip);
  const source = detectSource(referrer);
  const device = detectDevice(userAgent);

  try {
    await db.query(
      "INSERT INTO traffic_logs (url, referrer, source_category, source_platform, user_agent, device_type, ip_address, country, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        url,
        referrer || "direct",
        source.category,
        source.platform,
        userAgent,
        device,
        ip,
        geo?.country || null,
        geo?.region || null
      ]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Track Error:", err.message);
    res.status(500).json({ success: false, message: "DB error" });
  }
}
