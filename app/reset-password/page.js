"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      if (!token) {
        alert("❌ Token missing");
        router.push("/login");
        return;
      }
      if (!password.trim()) return alert("❌ Password required");
      if (password !== confirm) return alert("❌ Password not matched");

      setLoading(true);

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
      <div className="card p-4 mx-auto" style={{ maxWidth: 450 }}>
        <h4 className="mb-3">Reset Password</h4>

        <input
          type="password"
          className="form-control mb-2"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={loading}
        />

        <button
          className="btn btn-orange w-100"
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Password"}
        </button>
      </div>
    </div>
  );
}

// Prevent prerendering
export const dynamic = "force-dynamic";
