fetch("https://analytics-chi-silk.vercel.app/api/track", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    screen: { width: screen.width, height: screen.height }
  })
});
