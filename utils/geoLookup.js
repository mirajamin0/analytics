export async function getGeoData(ip) {
  try {
    if (!ip || ip.startsWith("127.") || ip === "::1") {
      return { country: "Localhost", region: "Local" }; // fallback for local IPs
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) throw new Error("Geo API failed");

    const data = await response.json();
    return {
      country: data.country_name || "Unknown",
      region: data.region || "Unknown"
    };
  } catch (err) {
    console.error("GeoLookup Error:", err.message);
    return { country: "Unknown", region: "Unknown" };
  }
}
