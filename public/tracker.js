fetch("http://localhost:3000/api/track", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    screen: { width: screen.width, height: screen.height }
  })
});
