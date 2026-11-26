import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './Authority.module.css';

const AuthorityRegistration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [panchayathId, setPanchayathId] = useState('');

  const [districts, setDistricts] = useState([]);
  const [panchayaths, setPanchayaths] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [errors, setErrors] = useState({});

  const fetchDistricts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/district');
      setDistricts(res.data.districtData || []);
    } catch (err) { console.error(err); }
  };

  const fetchPanchayaths = async (dId) => {
    try {
      setDistrictId(dId);
      setPanchayathId('');
      if (!dId) { setPanchayaths([]); return; }
      const res = await axios.get(`http://localhost:5000/panchayathByDistrict/${dId}`);
      setPanchayaths(res.data.panchayathData || []);
    } catch (err) { console.error(err); }
  };

  const loadAuthorities = async () => {
    try {
      const res = await axios.get('http://localhost:5000/authority');
      setAuthorities(res.data.authorityData || []);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    let newErrors = {};
    if (!districtId) newErrors.district = 'Select district';
    if (!panchayathId) newErrors.panchayath = 'Select panchayath';
    if (!name.trim()) newErrors.name = 'Enter name';
    if (!email.trim()) newErrors.email = 'Enter email';
    if (!password.trim()) newErrors.password = 'Enter password';
    if (!contact.trim()) newErrors.contact = 'Enter contact';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await axios.post('http://localhost:5000/authority', {
        name, email, password, contact, panchayathId
      });
      alert(res.data.msg);
      setName(''); setEmail(''); setPassword(''); setContact('');
      setDistrictId(''); setPanchayathId(''); setPanchayaths([]); setErrors({});
      loadAuthorities();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently remove this authority?')) return;
    try {
      await axios.delete(`http://localhost:5000/authority/${id}`);
      loadAuthorities();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchDistricts();
    loadAuthorities();
  }, []);

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <div className={style.header}>
          <span className={style.badge}>Security & Governance</span>
          <h2 className={style.title}>Authority Registry</h2>
          <p className={style.subtitle}>Manage institutional access for regional administrators.</p>
        </div>

        <div className={style.formCard}>
          <h3 className={style.sectionTitle}>Identity Registration</h3>
          <div className={style.formGrid}>
            <div className={style.field}>
              <label>District Jurisdiction</label>
              <select className={`${style.input} ${errors.district ? style.inputError : ''}`} value={districtId} onChange={(e) => fetchPanchayaths(e.target.value)}>
                <option value="">Select District</option>
                {districts.map(d => <option key={d._id} value={d._id}>{d.districtName}</option>)}
              </select>
              {errors.district && <span className={style.error}>{errors.district}</span>}
            </div>

            <div className={style.field}>
              <label>Assigned Panchayath</label>
              <select className={`${style.input} ${errors.panchayath ? style.inputError : ''}`} value={panchayathId} onChange={(e) => { setPanchayathId(e.target.value); setErrors({...errors, panchayath: ''}) }} disabled={!districtId}>
                <option value="">Select Panchayath</option>
                {panchayaths.map(p => <option key={p._id} value={p._id}>{p.panchayathName}</option>)}
              </select>
              {errors.panchayath && <span className={style.error}>{errors.panchayath}</span>}
            </div>
            
            <div className={style.field}>
              <label>Full Name</label>
              <input type="text" className={`${style.input} ${errors.name ? style.inputError : ''}`} placeholder="Official name" value={name} onChange={(e) => {setName(e.target.value); setErrors({...errors, name: ''})}} />
              {errors.name && <span className={style.error}>{errors.name}</span>}
            </div>

            <div className={style.field}>
              <label>Professional Email</label>
              <input type="email" className={`${style.input} ${errors.email ? style.inputError : ''}`} placeholder="email@authority.gov" value={email} onChange={(e) => {setEmail(e.target.value); setErrors({...errors, email: ''})}} />
              {errors.email && <span className={style.error}>{errors.email}</span>}
            </div>

            <div className={style.field}>
              <label>Secure Password</label>
              <input type="password" className={`${style.input} ${errors.password ? style.inputError : ''}`} placeholder="••••••••" value={password} onChange={(e) => {setPassword(e.target.value); setErrors({...errors, password: ''})}} />
              {errors.password && <span className={style.error}>{errors.password}</span>}
            </div>

            <div className={style.field}>
              <label>Contact Number</label>
              <input type="text" className={`${style.input} ${errors.contact ? style.inputError : ''}`} placeholder="+91 XXXXX XXXXX" value={contact} onChange={(e) => {setContact(e.target.value); setErrors({...errors, contact: ''})}} />
              {errors.contact && <span className={style.error}>{errors.contact}</span>}
            </div>

            <div className={style.actionGroup}>
              <button className={style.primaryBtn} onClick={handleSave}>Confirm Registration</button>
            </div>
          </div>
        </div>

        <div className={style.tableCard}>
          <div className={style.tableHeader}>
            <h3 className={style.sectionTitle}>Registered Officials</h3>
            <span className={style.countBadge}>{authorities.length} Active Records</span>
          </div>
          <div className={style.tableWrapper}>
            <table className={style.districtTable}>
              <thead>
                <tr>
                  <th style={{width: '80px'}}>Sl No</th>
                  <th>Panchayath</th>
                  <th>Authority Name</th>
                  <th>Contact Details</th>
                  <th style={{textAlign: 'right'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {authorities.length > 0 ? (
                  authorities.map((a, index) => (
                    <tr key={a._id}>
                      <td className={style.districtName}>{index + 1}</td>
                      <td className={style.districtName}>{a.panchayathId?.panchayathName || '—'}</td>
                      <td className={style.districtName}>{a.authorityName}</td>
                      <td className={style.contactInfo}>
                        <div>{a.authorityEmail}</div>
                        <div style={{opacity: 0.6}}>{a.authorityContact}</div>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <button className={style.deleteBtn} onClick={() => handleDelete(a._id)}>Revoke Access</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className={style.emptyState}>No registered authorities found in directory.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityRegistration;