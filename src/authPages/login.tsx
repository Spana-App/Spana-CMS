import type React from "react"
import { useState } from "react"
import "../Styles/login.css"
import LoginImage from "../assets/modern-abstract-geometric-pattern-with-dark-tones-.jpg"
import { useNavigate } from "react-router"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login attempt with:", { email, password })
    // Add your login logic here
  }

  return (
    <div className="login-container">
      {/* Left Column - Login Form */}
      <div className="login-form-column">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <a href="#" className="forgot-link">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <button type="submit" className="login-button" onClick={() => navigate("/otp")}>
              Sign in
            </button>
          </form>

          {/* <div className="signup-text">
            Don't have an account?{" "}
            <a href="#" className="signup-link">
              Sign up
            </a>
          </div> */}
        </div>
      </div>

      {/* Right Column - Full Image */}
      <div className="image-column">
        <div className="image-wrapper">
          <img
            src={LoginImage}
            alt="Login background"
            className="login-image"
          />
          <div className="image-overlay" />
          <div className="image-content">
            {/* <blockquote className="testimonial">
              <p className="testimonial-text">
                "This platform has transformed the way we work. Simple, powerful, and elegant."
              </p>
              <footer className="testimonial-author">— Alson Radebe</footer>
            </blockquote> */}
          </div>
        </div>
      </div>
    </div>
  )
}
