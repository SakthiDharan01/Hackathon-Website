"use client";
import Link from 'next/link';
import { Suspense, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './login.css';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const API_BASE = '/backend';

  useEffect(() => {
    // If a token arrives (e.g., after OAuth), stash it and move to dashboard
    const urlToken = searchParams.get('token');
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (urlToken) {
      localStorage.setItem('authToken', urlToken);
      router.replace('/dashboard');
      return;
    }

    if (storedToken) {
      router.replace('/dashboard');
    }
  }, [router, searchParams]);

  const handleGoogleLogin = useCallback(() => {
    // Replace the URL below with your deployed backend OAuth endpoint
    window.location.href = `${API_BASE}/auth/login`;
  }, [API_BASE]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    alert("Please use the 'Login with Google' button.");
  }, []);

  return (
    <div className="login-page">
      <video autoPlay muted loop playsInline className="bg-video">
        <source src="/assets/bg.mp4" type="video/mp4" />
      </video>

      <div className="login-container">
        <Link href="/" className="login-nav-back">
          ← Back to home
        </Link>

        <div className="login-header">
          <h2>Welcome Back!</h2>
          <p>Register here for AI-Wars Hackathon</p>
        </div>

        <form onSubmit={handleSubmit} id="loginForm">
          <div className="input-group">
            <label htmlFor="username">TEAM ID</label>
            <input id="username" type="text" name="username" required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" required />
          </div>

          <div className="remember-me">
            <label>
              <input type="checkbox" /> Remember me?
            </label>
          </div>

          <button type="submit" className="submit-btn">
            Sign In
          </button>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="input-group">
            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              Login with Google
            </button>
          </div>

          <div className="signup-link">
            <p>
              Don't have an account? <a href="#">Sign up</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
