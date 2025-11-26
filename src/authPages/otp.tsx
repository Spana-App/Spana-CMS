import type React from "react";
import { useState, useRef, useEffect } from "react";
import "../Styles/otp.css";
import LoginImage from "../assets/modern-abstract-geometric-pattern-with-dark-tones-.jpg";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/authentication";

export default function OTPPage() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { verifyOTP, isLoading, error, clearError, pendingEmail, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Pre-populate email from login page
  useEffect(() => {
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  }, [pendingEmail]);

  // Clear error when OTP or email changes
  useEffect(() => {
    if (error) {
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, email]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, canResend]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, ""); // Only numbers
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const pastedArray = pastedData.split("").filter((char) => /\d/.test(char));

    if (pastedArray.length > 0) {
      const newOtp = [...otp];
      pastedArray.forEach((digit, i) => {
        if (i < 6) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);

      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedArray.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleResend = () => {
    setOtp(Array(6).fill(""));
    setTimer(60);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    // TODO: Add resend OTP API call if your backend supports it
    console.log("Resending OTP...");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length === 6 && email) {
      try {
        console.log("Verifying OTP code:", otpString, "for email:", email);
        await verifyOTP(email, otpString);
        // Navigation will happen automatically via useEffect when isAuthenticated becomes true
      } catch (err) {
        // Error is handled by the store
        console.error("OTP verification failed:", err);
      }
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");
  const isFormValid = isOtpComplete && email.trim() !== "";

  return (
    <div className="otp-container">
      {/* Left Column - OTP Form */}
      <div className="otp-form-column">
        <div className="otp-form-wrapper">
          <div className="otp-header">
            <h1 className="otp-title">Verify your account</h1>
            <p className="otp-subtitle">
              We've sent a 6-digit code to your email. Please enter it below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="otp-form">
            {error && (
              <div className="error-message" style={{ 
                color: '#ef4444', 
                fontSize: '0.875rem', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
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
            <div className="otp-input-group">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              className="verify-button"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div className="otp-footer">
            <p className="resend-text">
              Didn't receive the code?{" "}
              {canResend ? (
                <button
                  type="button"
                  className="resend-button"
                  onClick={handleResend}
                >
                  Resend OTP
                </button>
              ) : (
                <span className="timer-text">
                  Resend in {timer}s
                </span>
              )}
            </p>
            <a href="#" className="back-link" onClick={() => navigate("/")}>
              Back to login
            </a>
          </div>
        </div>
      </div>

      {/* Right Column - Full Image */}
      <div className="image-column">
        <div className="image-wrapper">
          <img
            src={LoginImage}
            alt="OTP background"
            className="otp-image"
          />
          <div className="image-overlay" />
          <div className="image-content"></div>
        </div>
      </div>
    </div>
  );
}

