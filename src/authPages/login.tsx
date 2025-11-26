import type React from "react"
import { useState, useEffect } from "react"
import "../Styles/login.css"
import LoginImage from "../assets/modern-abstract-geometric-pattern-with-dark-tones-.jpg"
import { useNavigate } from "react-router"
import { useAuthStore } from "../store/authentication"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password });
      // Navigate to OTP page on success
      navigate("/otp", {
        state: { successMessage: "You have successfully logged in." },
      });
      
    } catch (err) {
      // Error is handled by the store
      console.error("Login failed:", err);
    }
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

            {error && (
              <div className="error-message" style={{ 
                color: '#ef4444', 
                fontSize: '0.875rem', 
                marginTop: '-0.5rem',
                marginBottom: '0.5rem'
              }}>
                {error}
              </div>
            )}
            <button 
              type="submit" 
              className="login-button" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
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
