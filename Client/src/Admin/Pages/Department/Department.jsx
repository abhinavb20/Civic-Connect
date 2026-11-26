import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './Department.module.css'
const Department = () => {
  const [value, setValue] = useState('');
  const [departments, setDepartments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const loadDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/department');
      const sorted = (res.data.departmentData || []).sort((a, b) =>
        (a.departmentName || '').localeCompare(b.departmentName || '')
      );
      setDepartments(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    const currentValue = editId ? editName : value;
    if (!currentValue.trim()) {
      setError('Enter department name');
      return;
    }
    try {
      if (editId) {
      
      } else {
        const res = await axios.post('http://localhost:5000/department', {
          departmentName: value,
        });
        alert(res.data.msg);
        setValue('');
      }
      setError('');
      loadDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this department?');
    if (!confirmDelete) return;
    try {
      await axios.delete(`http://localhost:5000/department/${id}`);
      loadDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    let input = e.target.value;
    input = input.charAt(0).toUpperCase() + input.slice(1);
    setValue(input);
    setError('');
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <div className={style.header}>
          <span className={style.badge}>Civic Connect Admin</span>
          <h2 className={style.title}>Department Management</h2>
          <p className={style.subtitle}>Manage complaint categories and civic departments.</p>
        </div>

        <div className={style.formCard}>
          <h3 className={style.sectionTitle}>Add New Department</h3>
          <div className={style.formRow}>
            <div className={style.field}>
              <label>Department Name</label>
              <input
                type="text"
                className={`${style.input} ${error ? style.inputError : ''}`}
                placeholder="Enter department"
                value={value}
                onChange={handleInputChange}
              />
              {error && <span className={style.error}>{error}</span>}
            </div>
            <div className={style.actionGroup}>
              <button className={style.primaryBtn} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>

        <div className={style.tableCard}>
          <div className={style.tableHeader}>
            <h3 className={style.sectionTitle}>Department List</h3>
            <span className={style.countBadge}>{departments.length} Departments</span>
          </div>
          <div className={style.tableWrapper}>
            <table className={style.districtTable}>
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Department Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.length > 0 ? (
                  departments.map((d, index) => (
                    <tr key={d._id}><td className={style.districtName}>{index + 1}</td><td className={style.districtName}>{d.departmentName}</td>
                      <td>
                        <div className={style.tableActions}>
                          <button className={style.deleteBtn} onClick={() => handleDelete(d._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className={style.emptyState}>No departments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Department;
