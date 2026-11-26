import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './Panchayath.module.css';

const Panchayath = () => {
  const [value, setValue] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [districts, setDistricts] = useState([]);
  const [panchayaths, setPanchayaths] = useState([]);
  const [errorName, setErrorName] = useState('');
  const [errorDist, setErrorDist] = useState('');
  
  // NEW: State to track if we are updating
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    try {
      const distRes = await axios.get('http://localhost:5000/district');
      setDistricts(distRes.data.districtData || []);
      const panRes = await axios.get('http://localhost:5000/panchayath');
      setPanchayaths(panRes.data.panchayathData || []);
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  const handleSave = async () => {
    let valid = true;
    if (!value.trim()) { setErrorName('Panchayath name is required'); valid = false; }
    if (!districtId) { setErrorDist('Please select a district'); valid = false; }
    if (!valid) return;

    try {
      if (editId) {
        // UPDATE PATH
        const res = await axios.put(`http://localhost:5000/panchayath/${editId}`, {
          panchayathName: value,
          districtId
        });
        alert(res.data.msg);
      } else {
        // CREATE PATH
        const res = await axios.post('http://localhost:5000/panchayath', {
          panchayathName: value,
          districtId
        });
        alert(res.data.msg);
      }
      
      resetForm();
      loadData();
    } catch (err) {
      console.error("Provisioning Error:", err);
    }
  };

  const handleEdit = (p) => {
    setEditId(p._id);
    setValue(p.panchayathName);
    setDistrictId(p.districtId?._id || '');
    setErrorName('');
    setErrorDist('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setValue('');
    setDistrictId('');
    setErrorName('');
    setErrorDist('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entity?')) return;
    try {
      await axios.delete(`http://localhost:5000/panchayath/${id}`);
      loadData();
    } catch (err) {
      console.error("Deletion Error:", err);
    }
  };

  const handleInputChange = (e) => {
    let input = e.target.value;
    input = input.charAt(0).toUpperCase() + input.slice(1);
    setValue(input);
    setErrorName('');
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <header className={style.header}>
          <span className={style.badge}>Administrative Console</span>
          <h2 className={style.title}>Panchayath Registry</h2>
          <p className={style.subtitle}>Orchestrate local governance entities and district associations.</p>
        </header>

        <section className={style.formCard}>
          <h3 className={style.sectionTitle}>
            {editId ? 'Modify Existing Entity' : 'Initialize New Entity'}
          </h3>
          <div className={style.formRow}>
            <div className={style.field}>
              <label>Parent District</label>
              <select 
                className={`${style.input} ${errorDist ? style.inputError : ''}`} 
                value={districtId} 
                onChange={(e) => { setDistrictId(e.target.value); setErrorDist(''); }}
              >
                <option value="">Choose District...</option>
                {districts.map(d => (
                  <option key={d._id} value={d._id}>{d.districtName}</option>
                ))}
              </select>
              {errorDist && <span className={style.error}>{errorDist}</span>}
            </div>

            <div className={style.field}>
              <label>Panchayath Nomenclature</label>
              <input 
                type="text" 
                className={`${style.input} ${errorName ? style.inputError : ''}`} 
                placeholder="Ex: Punnapra" 
                value={value} 
                onChange={handleInputChange} 
              />
              {errorName && <span className={style.error}>{errorName}</span>}
            </div>
            
            <div className={style.actionGroup}>
              <button className={style.primaryBtn} onClick={handleSave}>
                {editId ? 'Update Entity' : 'Register Entity'}
              </button>
              {editId && (
                <button className={style.cancelBtn} onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </section>

        <section className={style.tableCard}>
          <div className={style.tableHeader}>
            <h3 className={style.sectionTitle}>Active Records</h3>
            <span className={style.countBadge}>{panchayaths.length} Registered Units</span>
          </div>
          <div className={style.tableWrapper}>
            <table className={style.districtTable}>
              <thead>
                <tr>
                  <th style={{width: '80px'}}>ID</th>
                  <th>Region / District</th>
                  <th>Entity Name</th>
                  <th style={{textAlign: 'right'}}>Management</th>
                </tr>
              </thead>
              <tbody>
                {panchayaths.length > 0 ? (
                  panchayaths.map((p, index) => (
                    <tr key={p._id} className={editId === p._id ? style.activeRow : ''}>
                      <td>{(index + 1).toString().padStart(2, '0')}</td>
                      <td className={style.distLabel}>{p.districtId?.districtName || 'Unassigned'}</td>
                      <td className={style.panchName}>{p.panchayathName}</td>
                      <td style={{textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                        {/* UPDATE BUTTON */}
                        <button className={style.updateBtn} onClick={() => handleEdit(p)}>
                          Modify
                        </button>
                        <button className={style.deleteBtn} onClick={() => handleDelete(p._id)}>
                          Terminate
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={style.emptyState}>No local entities currently active.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Panchayath;