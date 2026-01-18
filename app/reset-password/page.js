"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Get token from URL query string AFTER hydration
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const t = query.get("token");
    if (!t) {
      alert("❌ Token missing");
      router.push("/login");
    } else {
      setToken(t);
    }
  }, [router]);

  const handleReset = async () => {
    if (!token) return;
    if (!password.trim()) return alert("❌ Password required");
    if (password !== confirm) return alert("❌ Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Password updated successfully");
      router.push("/login");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xxl pt-6 mt-6">
      <div className="card p-4 mx-auto shadow-sm" style={{ maxWidth: 450 }}>
        <h4 className="mb-4 text-center">Reset Password</h4>

        <input
          type="password"
          className="form-control mb-3"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          className="form-control mb-4"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={loading}
        />

        <button
          className="btn btn-orange w-100"
          onClick={handleReset}
          disabled={loading || !token}
        >
          {loading ? "Saving..." : "Save Password"}
        </button>
      </div>
    </div>
  );
}
