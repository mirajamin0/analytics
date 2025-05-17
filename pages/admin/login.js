import { useState } from "react";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const router = useRouter();

const handleSubmit = async (e) => {
  e.preventDefault();

  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  console.log("Login response:", data); // 👈 ADD THIS

  if (data.success && data.token) {
    localStorage.setItem("admin_token", data.token);
    router.push("/dashboard");
  } else {
    alert(data.error || "Login failed");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-6 text-center">Admin Login</h1>

        <input
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring"
          placeholder="Username"
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring"
          type="password"
          placeholder="Password"
          onChange={(e) => setPass(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
