"use client";
import React, { useState } from "react";

import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

  const router = useRouter();

const handleSignUp = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("❌ " + data.message);
      return;
    }

    // ✅ Save token
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    alert("✅ Signup successful");
    router.push("/admin/dashboard");
  } catch (err) {
    alert("❌ Something went wrong");
  } finally {
    setLoading(false);
  }
};

   const goToSignUp = () => {
    router.push("../login");
  };
  return (
    <div className="position-relative">
      <div className="authentication-wrapper authentication-basic container-p-y p-4 p-sm-0">
        <div className="authentication-inner py-6">
          {/* Register Card */}
          <div className="card p-md-7 p-1">
            {/* Logo */}
            <div className="app-brand justify-content-center mt-5">
              <a
                href="/admin/dashboard"
                className="app-brand-link d-flex align-items-center justify-content-center text-center"
              >
                <div className="d-flex justify-content-center">
                  {/* PNG Logo */}
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
            {/* /Logo */}

            <div className="card-body mt-1">
              <h4 className="mb-1">Adventure starts here 🚀</h4>
              <p className="mb-5">Create your account and start managing your app with ease!</p>

              <form className="mb-5" onSubmit={handleSignUp}>
              

                <div className="form-floating form-floating-outline mb-5">
                <input
  type="email"
  className="form-control"
  id="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

                  <label htmlFor="email">Email</label>
                </div>

                <div className="mb-5 form-password-toggle">
                  <div className="input-group input-group-merge">
                    <div className="form-floating form-floating-outline">
                      <input
  type="password"
  id="password"
  className="form-control"
  placeholder="************"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>

                      <label htmlFor="password">Password</label>
                    </div>
                    <span className="input-group-text cursor-pointer">
                      <i className="ri-eye-off-line"></i>
                    </span>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="form-check mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="terms-conditions"
                      name="terms"
                      required
                    />
                    <label className="form-check-label" htmlFor="terms-conditions">
                      I agree to <a href="javascript:void(0);">privacy policy & terms</a>
                    </label>
                  </div>
                </div>

             <button className="btn btn-orange d-grid w-100" type="submit" disabled={loading}>
  {loading ? "Creating..." : "Sign up"}
</button>

              </form>

              <p className="text-center">
                <span>Already have an account?</span>{" "}
                <a >
                  <span
                  onClick={goToSignUp}
                  style={{ cursor: "pointer", color: "#ff7a00", fontWeight: 500 }}
                >Sign in instead</span>
                </a>
              </p>

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
          {/* /Register Card */}
        </div>
      </div>
    </div>
  );
}
