import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './Ward.module.css';

const Ward = () => {
  const [value, setValue] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [panchayathId, setPanchayathId] = useState('');

  const [districts, setDistricts] = useState([]);
  const [panchayaths, setPanchayaths] = useState([]);
  const [wards, setWards] = useState([]);
  const [errors, setErrors] = useState({});

  const loadWards = async () => {
    try {
      const res = await axios.get('http://localhost:5000/ward');
      setWards(res.data.wardData || []);
    } catch (err) { console.error(err); }
  };

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
      setErrors({ ...errors, district: '' });
      if (!dId) { setPanchayaths([]); return; }
      const res = await axios.get(`http://localhost:5000/panchayathByDistrict/${dId}`);
      setPanchayaths(res.data.panchayathData || []);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    let newErrors = {};
    if (!districtId) newErrors.district = 'Required';
    if (!panchayathId) newErrors.panchayath = 'Required';
    if (!wardNumber.trim()) newErrors.wardNumber = 'Required';
    if (!value.trim()) newErrors.wardName = 'Required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await axios.post('http://localhost:5000/ward', {
        wardName: value,
        wardNumber,
        panchayathId
      });
      alert(res.data.msg);
      setValue(''); setWardNumber(''); setDistrictId(''); setPanchayathId('');
      setPanchayaths([]); setErrors({}); loadWards();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently remove this ward?')) return;
    try {
      await axios.delete(`http://localhost:5000/ward/${id}`);
      loadWards();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchDistricts();
    loadWards();
  }, []);

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <header className={style.header}>
          <span className={style.badge}>Territorial Management</span>
          <h2 className={style.title}>Ward Directory</h2>
          <p className={style.subtitle}>Detailed granular oversight of local electoral wards.</p>
        </header>

        <section className={style.formCard}>
          <h3 className={style.sectionTitle}>Registration Form</h3>
          <div className={style.formGrid}>
            <div className={style.field}>
              <label>District</label>
              <select 
                className={`${style.input} ${errors.district ? style.inputError : ''}`} 
                value={districtId} 
                onChange={(e) => fetchPanchayaths(e.target.value)}
              >
                <option value="">Select District</option>
                {districts.map(d => <option key={d._id} value={d._id}>{d.districtName}</option>)}
              </select>
              {errors.district && <span className={style.error}>{errors.district}</span>}
            </div>

            <div className={style.field}>
              <label>Panchayath</label>
              <select 
                className={`${style.input} ${errors.panchayath ? style.inputError : ''}`} 
                value={panchayathId} 
                onChange={(e) => { setPanchayathId(e.target.value); setErrors({...errors, panchayath: ''}) }} 
                disabled={!districtId}
              >
                <option value="">Select Panchayath</option>
                {panchayaths.map(p => <option key={p._id} value={p._id}>{p.panchayathName}</option>)}
              </select>
              {errors.panchayath && <span className={style.error}>{errors.panchayath}</span>}
            </div>

            <div className={style.field}>
              <label>Ward No.</label>
              <input 
                type="text" 
                className={`${style.input} ${errors.wardNumber ? style.inputError : ''}`} 
                placeholder="e.g. 01" 
                value={wardNumber} 
                onChange={(e) => {setWardNumber(e.target.value); setErrors({...errors, wardNumber: ''})}} 
              />
              {errors.wardNumber && <span className={style.error}>{errors.wardNumber}</span>}
            </div>

            <div className={style.field}>
              <label>Ward Name</label>
              <input 
                type="text" 
                className={`${style.input} ${errors.wardName ? style.inputError : ''}`} 
                placeholder="Name of ward" 
                value={value} 
                onChange={(e) => {setValue(e.target.value); setErrors({...errors, wardName: ''})}} 
              />
              {errors.wardName && <span className={style.error}>{errors.wardName}</span>}
            </div>

            <button className={style.primaryBtn} onClick={handleSave}>Save Ward</button>
          </div>
        </section>

        <section className={style.tableCard}>
          <div className={style.tableHeader}>
            <h3 className={style.sectionTitle}>Census of Wards</h3>
            <span className={style.countBadge}>{wards.length} Entries</span>
          </div>
          <div className={style.tableWrapper}>
            <table className={style.districtTable}>
              <thead>
                <tr>
                  <th style={{width: '60px'}}>Sl</th>
                  <th>District</th>
                  <th>Panchayath</th>
                  <th style={{width: '100px'}}>No.</th>
                  <th>Ward Name</th>
                  <th style={{textAlign: 'right'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {wards.length > 0 ? (
                  wards.map((w, index) => (
                    <tr className={style.districtName} key={w._id}>
                      <td>{index + 1}</td>
                      <td className={style.districtName}>{w.panchayathId?.districtId?.districtName || '—'}</td>
                      <td className={style.districtName}>{w.panchayathId?.panchayathName || '—'}</td>
                      <td><span className={style.wardNo}>{w.wardNumber}</span></td>
                      <td className={style.districtName}>{w.wardName}</td>
                      <td style={{textAlign: 'right'}}>
                        <button className={style.deleteBtn} onClick={() => handleDelete(w._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className={style.emptyState}>No ward data synchronized.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Ward;