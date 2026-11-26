import React, { useEffect, useState } from 'react';
import style from './UserRegistration.module.css';
import axios from 'axios';
import { FiImage, FiUserCheck, FiMapPin, FiCamera } from 'react-icons/fi'; // Added icons for polish

const UserRegistration = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState(null); // Single file for profile

  const [districts, setDistricts] = useState([]);
  const [panchayaths, setPanchayaths] = useState([]);
  const [wards, setWards] = useState([]);

  const [districtId, setDistrictId] = useState('');
  const [panchayathId, setPanchayathId] = useState('');
  const [wardId, setWardId] = useState('');

  const [errors, setErrors] = useState({});

  const fetchDistricts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/district');
      setDistricts(res.data.districtData || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPanchayaths = async (dId) => {
    try {
      setDistrictId(dId);
      setPanchayathId('');
      setWardId('');
      setWards([]);
      const res = await axios.get(`http://localhost:5000/panchayathByDistrict/${dId}`);
      setPanchayaths(res.data.panchayathData || []);
      setErrors((prev) => ({ ...prev, district: '', panchayath: '', ward: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWards = async (pId) => {
    try {
      setPanchayathId(pId);
      setWardId('');
      const res = await axios.get(`http://localhost:5000/wardByPanchayath/${pId}`);
      setWards(res.data.wardData || []);
      setErrors((prev) => ({ ...prev, panchayath: '', ward: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    let newErrors = {};

    if (!fullName.trim()) newErrors.fullName = 'Enter your name';
    if (!email.trim()) {
      newErrors.email = 'Enter your email';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Enter valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Enter password';
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 characters';
    }

    if (!contact.trim()) newErrors.contact = 'Enter contact number';
    if (!address.trim()) newErrors.address = 'Enter address';
    if (!districtId) newErrors.district = 'Select district';
    if (!panchayathId) newErrors.panchayath = 'Select panchayath';
    if (!wardId) newErrors.ward = 'Select ward';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const fd = new FormData();
    fd.append('wardId', wardId);
    fd.append('fullName', fullName);
    fd.append('contact', contact);
    fd.append('email', email);
    fd.append('password', password);
    fd.append('address', address);
    if (photo) fd.append('photo', photo);

    try {
      await axios.post('http://localhost:5000/userregistration', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Citizen Registered Successfully');
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <div className={style.header}>
          <span className={style.badge}>Join the Community</span>
          <h2 className={style.title}>Citizen Registration</h2>
          <p className={style.subtitle}>
            Connect with your local authorities and help improve your ward.
          </p>
        </div>

        <div className={style.formCard}>
          <div className={style.section}>
            <h3 className={style.sectionTitle}><FiUserCheck /> Personal Details</h3>
            <div className={style.gridTwo}>
              <div className={style.field}>
                <label>Full Name</label>
                <input
                  className={`${style.input} ${errors.fullName ? style.inputError : ''}`}
                  placeholder="Name"
                  value={fullName}
                  maxLength={20}
                  pattern='A-Z,a-z,0-9'
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && <span className={style.error}>{errors.fullName}</span>}
              </div>
              <div className={style.field}>
                <label>Contact Number</label>
                <input
                  className={`${style.input} ${errors.contact ? style.inputError : ''}`}
                  placeholder="+91 0000 000000"
                  value={contact}
                  minLength={10}
                  maxLength={13}
                  pattern='0-9,+'
                  onChange={(e) => setContact(e.target.value)}
                />
                {errors.contact && <span className={style.error}>{errors.contact}</span>}
              </div>
            </div>

            <div className={style.gridTwo}>
              <div className={style.field}>
                <label>Email Address</label>
                <input
                  className={`${style.input} ${errors.email ? style.inputError : ''}`}
                  placeholder="name@example.com"
                  value={email}
                  maxLength={40}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <span className={style.error}>{errors.email}</span>}
              </div>
              <div className={style.field}>
                <label>Password</label>
                <input
                  type="password"
                  className={`${style.input} ${errors.password ? style.inputError : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <span className={style.error}>{errors.password}</span>}
              </div>
            </div>

            <div className={style.field}>
              <label>Residential Address</label>
              <textarea
                className={`${style.textarea} ${errors.address ? style.inputError : ''}`}
                placeholder="House name, Street, etc."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && <span className={style.error}>{errors.address}</span>}
            </div>
          </div>

          <div className={style.section}>
            <h3 className={style.sectionTitle}><FiMapPin /> Location</h3>
            <div className={style.gridThree}>
              <div className={style.field}>
                <label>District</label>
                <select
                  className={`${style.input} ${errors.district ? style.inputError : ''}`}
                  value={districtId}
                  onChange={(e) => fetchPanchayaths(e.target.value)}
                >
                  <option value="">Select</option>
                  {districts.map((d) => (
                    <option key={d._id} value={d._id}>{d.districtName}</option>
                  ))}
                </select>
              </div>

              <div className={style.field}>
                <label>Panchayath</label>
                <select
                  className={`${style.input} ${errors.panchayath ? style.inputError : ''}`}
                  value={panchayathId}
                  onChange={(e) => fetchWards(e.target.value)}
                  disabled={!districtId}
                >
                  <option value="">Select</option>
                  {panchayaths.map((p) => (
                    <option key={p._id} value={p._id}>{p.panchayathName}</option>
                  ))}
                </select>
              </div>

              <div className={style.field}>
                <label>Ward</label>
                <select
                  className={`${style.input} ${errors.ward ? style.inputError : ''}`}
                  value={wardId}
                  onChange={(e) => setWardId(e.target.value)}
                  disabled={!panchayathId}
                >
                  <option value="">Select</option>
                  {wards.map((w) => (
                    <option key={w._id} value={w._id}>{w.wardName} ({w.wardNumber})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={style.section}>
            <h3 className={style.sectionTitle}><FiCamera /> Identity</h3>
            <div className={style.field}>
              <label>Profile Photo</label>
              <div className={style.fileUploadContainer}>
                {/* NEW STYLED FILE UPLOAD */}
                <label className={style.fileLabel}>
                  <FiImage /> 
                  {photo ? `${photo.name}` : "Upload ID Proof / Photo"}
                  <input 
                    type="file" 
                    hidden 
                    onChange={(e) => setPhoto(e.target.files[0])} 
                  />
                </label>
              </div>
            </div>
          </div>

          <button type="button" className={style.submitBtn} onClick={handleSubmit}>
            Create Citizen Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;