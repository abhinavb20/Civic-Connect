import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './District.module.css';

const District = () => {
  const [value, setValue] = useState('');
  const [districts, setDistricts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const loadDistricts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/district');
      setDistricts(res.data.districtData || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const handleSave = async () => {
    const currentValue = editId ? editName : value;

    if (!currentValue.trim()) {
      setError('Please provide a district name');
      return;
    }

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/district/${editId}`, {
          districtName: editName,
        });
        cancelEdit();
      } else {
        await axios.post('http://localhost:5000/district', {
          districtName: value,
        });
        setValue('');
      }
      setError('');
      loadDistricts();
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('This action cannot be undone. Delete district?')) return;
    try {
      await axios.delete(`http://localhost:5000/district/${id}`);
      loadDistricts();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleInputChange = (e) => {
    let input = e.target.value;
    input = input.charAt(0).toUpperCase() + input.slice(1);
    editId ? setEditName(input) : setValue(input);
    setError('');
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setEditName(item.districtName);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
    setError('');
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <header className={style.header}>
          <span className={style.badge}>Administrative Oversight</span>
          <h2 className={style.title}>District Management</h2>
          <p className={style.subtitle}>Refining jurisdictional boundaries with precision.</p>
        </header>

        <section className={style.formCard}>
          <h3 className={style.sectionTitle}>
            {editId ? 'Update Record' : 'Add New Entry'}
          </h3>
          <div className={style.formRow}>
            <div className={style.field}>
              <label>District Nomenclature</label>
              <input
                type="text"
                className={`${style.input} ${error ? style.inputError : ''}`}
                placeholder="e.g. Manhattan"
                value={editId ? editName : value}
                onChange={handleInputChange}
              />
              {error && <span className={style.error}>{error}</span>}
            </div>
            <div className={style.actionGroup}>
              <button className={style.primaryBtn} onClick={handleSave}>
                {editId ? 'Update' : 'Save Record'}
              </button>
              {editId && (
                <button className={style.secondaryBtn} onClick={cancelEdit} style={{marginLeft: '10px'}}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </section>

        <section className={style.tableCard}>
          <div className={style.tableHeader}>
            <h3 className={style.sectionTitle}>Active Jurisdictions</h3>
            <span className={style.countBadge}>{districts.length} Units</span>
          </div>

          <div className={style.tableWrapper}>
            <table className={style.districtTable}>
              <thead>
                <tr>
                  <th style={{width: '80px'}}>No.</th>
                  <th>District Name</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {districts.length > 0 ? (
                  districts.map((d, index) => (
                    <tr key={d._id}>
                      <td>{(index + 1).toString().padStart(2, '0')}</td>
                      <td className={style.districtName}>{d.districtName}</td>
                      <td>
                        <div className={style.tableActions}>
                          <button className={style.editBtn} onClick={() => startEdit(d)}>
                            Edit
                          </button>
                          <button className={style.deleteBtn} onClick={() => handleDelete(d._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className={style.emptyState}>
                      No records found in the current directory.
                    </td>
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

export default District;