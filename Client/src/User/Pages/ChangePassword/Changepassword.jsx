import React, { useState } from 'react';
import axios from 'axios';
import { FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import style from './ChangePassword.module.css';

const ChangePassword = () => {
  const uid = sessionStorage.getItem('uid') || sessionStorage.getItem('userId');

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confPwd, setConfPwd] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [errors, setErrors] = useState({});

  const handleChange = async () => {
    let newErrors = {};

    if (!oldPwd.trim()) newErrors.oldPwd = 'Current password is required';
    if (!newPwd.trim()) {
      newErrors.newPwd = 'New password is required';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(newPwd)) {
      newErrors.newPwd = 'Requires uppercase, lowercase, and a number';
    }

    if (newPwd !== confPwd) newErrors.confPwd = 'Passwords do not match';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await axios.put(`http://localhost:5000/userPassword/${uid}`, {
        oldPassword: oldPwd,
        newPassword: newPwd,
      });

      alert(res.data.message);
      setOldPwd(''); setNewPwd(''); setConfPwd(''); setErrors({});
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (!uid) return null;

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <header className={style.header}>
          <span className={style.badge}>Security Protocol</span>
          <h2 className={style.title}>Update <span>Vault Access</span></h2>
          <p className={style.subtitle}>Ensure your account remains secure with a high-entropy password.</p>
        </header>

        <div className={style.formCard}>
          <div className={style.securityIcon}>
            <FiShield size={40} />
          </div>

          <div className={style.inputGroup}>
            {/* OLD PASSWORD */}
            <div className={style.field}>
              <label>Current Password</label>
              <div className={style.inputWrapper}>
                <FiLock className={style.prefixIcon} />
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  maxLength={20}
                />
                <button type="button" className={style.toggleBtn} onClick={() => setShowOld(!showOld)}>
                  {showOld ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.oldPwd && <span className={style.errorText}>{errors.oldPwd}</span>}
            </div>

            {/* NEW PASSWORD */}
            <div className={style.field}>
              <label>New Secure Password</label>
              <div className={style.inputWrapper}>
                <FiLock className={style.prefixIcon} />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  maxLength={20}

                />
                <button type="button" className={style.toggleBtn} onClick={() => setShowNew(!showNew)}>
                  {showNew ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.newPwd && <span className={style.errorText}>{errors.newPwd}</span>}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className={style.field}>
              <label>Confirm New Password</label>
              <div className={style.inputWrapper}>
                <FiLock className={style.prefixIcon} />
                <input
                  type={showConf ? 'text' : 'password'}
                  value={confPwd}
                  onChange={(e) => setConfPwd(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  maxLength={20}
                />
                <button type="button" className={style.toggleBtn} onClick={() => setShowConf(!showConf)}>
                  {showConf ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confPwd && <span className={style.errorText}>{errors.confPwd}</span>}
            </div>
          </div>

          <button className={style.primaryBtn} onClick={handleChange}>
            Update Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;