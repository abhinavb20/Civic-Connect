import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import style from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleLogin = async () => {
    let newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Enter your email';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Enter your password';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await axios.post('http://localhost:5000/login', { email, password });

      const { role, id, name, msg } = res.data;
      alert(msg);

      if (role === 'admin') {
        sessionStorage.setItem('adminId', id);
        sessionStorage.setItem('adminName', name);
        navigate('/admin/');
      } else if (role === 'user') {
        sessionStorage.setItem('userId', id);
        sessionStorage.setItem('userName', name);
        navigate('/user/');
      } else if (role === 'authority') {
        sessionStorage.setItem('authorityId', id);
        sessionStorage.setItem('authorityName', name);
        navigate('/authority/');
      } else {
        alert('Invalid role received');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        {/* Left Branding Panel */}
        <div className={style.leftPanel}>
          <div className={style.brandContent}>
            <span className={style.badge}>Welcome Back</span>
            <h1 className={style.title}>Secure Access to <span>Civic Connect</span></h1>
            <p className={style.subtitle}>
              Log in to your specialized dashboard to manage reports, track progress, 
              and contribute to a better community.
            </p>

            <div className={style.featureList}>
              <div className={style.featureCard}>
                <span className={style.featureIcon}>📢</span>
                <div>
                  <h4>Real-time Tracking</h4>
                  <p>Monitor complaint status instantly.</p>
                </div>
              </div>
              <div className={style.featureCard}>
                <span className={style.featureIcon}>✅</span>
                <div>
                  <h4>Verified Resolutions</h4>
                  <p>Official closures for civic issues.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className={style.formPanel}>
          <div className={style.formHeader}>
            <h2>Sign In</h2>
            <p>Please enter your credentials to continue.</p>
          </div>

          <div className={style.field}>
            <label>Email Address</label>
            <input
              className={`${style.input} ${errors.email ? style.inputError : ''}`}
              type="email"
              placeholder="name@example.com"
              value={email}
              maxLength={50}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
            />
            {errors.email && <span className={style.errorText}>{errors.email}</span>}
          </div>

          <div className={style.field}>
            <label>Password</label>
            <div className={style.passwordWrapper}>
              <input
                className={`${style.input} ${errors.password ? style.inputError : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                minLength={6}
                maxLength={20}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: '' });
                }}
              />
              <button
                type="button"
                className={style.toggleBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className={style.errorText}>{errors.password}</span>}
          </div>

          <button type="button" className={style.loginBtn} onClick={handleLogin}>
            Sign In to Account
          </button>

          <p className={style.footerText}>
            Don’t have an account? <Link to="/userregistration">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;