"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert("❌ " + (data.message || "Login failed"));
      }

      // ✅ store token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ redirect based on role
      if (data.user.role === "Admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/admin/dashboard"); // create this page later
      }
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToSignUp = () => {
    router.push("../signup");
  };

  return (
    <div className="position-relative">
      <div className="authentication-wrapper authentication-basic container-p-y p-4 p-sm-0">
        <div className=" py-6">
          <div className="card p-md-7 p-1">
            <div className="app-brand justify-content-center mt-5">
              <a
                href="/admin/dashboard"
                className="app-brand-link d-flex align-items-center justify-content-center text-center"
              >
                <div className="d-flex justify-content-center">
                  <img
                    src="/materialize/assets/img/favicon/faviconSidebar.png"
                    alt="Logo"
                    style={{ height: 50, width: "auto" }}
                  />
                  <img
                    src="/materialize/assets/img/favicon/name.png"
                    alt="Brand Name"
                    style={{ height: 40, width: "auto" }}
                    className="me-2 mt-1"
                  />
                </div>
              </a>
            </div>

            <div className="card-body mt-1">
              <h4 className="mb-1">Welcome to Indihand! 👋</h4>
              <p className="mb-5">
                Please sign-in to your account and start the adventure
              </p>

              <form id="formAuthentication" className="mb-5" onSubmit={handleLogin}>
                <div className="form-floating form-floating-outline mb-5">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter your email"
                    autoFocus
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="email">Email</label>
                </div>

                <div className="mb-5">
                  <div className="form-password-toggle">
                    <div className="input-group input-group-merge">
                      <div className="form-floating form-floating-outline">
                        <input
                          type="password"
                          id="password"
                          className="form-control"
                          placeholder="************"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <label htmlFor="password">Password</label>
                      </div>
                      <span className="input-group-text cursor-pointer">
                        <i className="ri-eye-off-line"></i>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-5 d-flex justify-content-between mt-5">
                  {/* <div className="form-check mt-2">
                    <input className="form-check-input" type="checkbox" id="remember-me" />
                    <label className="form-check-label" htmlFor="remember-me">
                      Remember Me
                    </label>
                  </div> */}

                  {/* <a href="/admin/reset-password" className="float-end mb-1 mt-2">
                    Forgot Password?
                  </a> */}
                </div>

                <div className="mb-5">
                  <button className="btn btn-orange d-grid w-100" type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>

              {/* <p className="text-center">
                <span>New on our platform?</span>{" "}
                <span
                  onClick={goToSignUp}
                  style={{ cursor: "pointer", color: "#ff7a00", fontWeight: 500 }}
                >
                  Create an account
                </span>
              </p> */}

              <div className="divider my-5">
                <div className="divider-text">or</div>
              </div>

              <div className="d-flex justify-content-center gap-2">
                <a href="#" className="btn btn-icon rounded-circle btn-text-facebook">
                  <i className="tf-icons ri-facebook-fill"></i>
                </a>
                <a href="#" className="btn btn-icon rounded-circle btn-text-twitter">
                  <i className="tf-icons ri-twitter-fill"></i>
                </a>
                <a href="#" className="btn btn-icon rounded-circle btn-text-github">
                  <i className="tf-icons ri-github-fill"></i>
                </a>
                <a href="#" className="btn btn-icon rounded-circle btn-text-google-plus">
                  <i className="tf-icons ri-google-fill"></i>
                </a>
              </div>
            </div>
          </div>
          {/* /Login Card */}
        </div>
      </div>
    </div>
  );
}
