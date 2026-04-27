import React, { useEffect, useState } from "react";
import axios from "axios";
import style from "./AdminReport.module.css";

const AdminReport = () => {
  const [data, setData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [panchayaths, setPanchayaths] = useState([]);
  const [wards, setWards] = useState([]);

  const [filters, setFilters] = useState({
    status: "",
    districtId: "",
    panchayathId: "",
    wardId: "",
  });

  useEffect(() => {
    loadReports();
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/district");
      setDistricts(res.data.districtData || []);
    } catch (err) {
      console.error("Error fetching districts", err);
    }
  };

  const loadReports = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/reports", {
        params: {
          status: filters.status,
          district: filters.districtId,
          panchayath: filters.panchayathId,
          ward: filters.wardId,
        },
      });
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    // Reset and Load Panchayaths if District changes
    if (name === "districtId") {
      setFilters((prev) => ({ ...prev, districtId: value, panchayathId: "", wardId: "" }));
      if (value) {
        const res = await axios.get(`http://localhost:5000/panchayathByDistrict/${value}`);
        setPanchayaths(res.data.panchayathData);
      } else {
        setPanchayaths([]);
      }
      setWards([]);
    }

    // Reset and Load Wards if Panchayath changes
    if (name === "panchayathId") {
      setFilters((prev) => ({ ...prev, panchayathId: value, wardId: "" }));
      if (value) {
        const res = await axios.get(`http://localhost:5000/wardByPanchayath/${value}`);
        setWards(res.data.wardData);
      } else {
        setWards([]);
      }
    }
  };

  const downloadCSV = () => {
    const headers = ["User", "District", "Panchayath", "Ward", "Department", "Status", "Title"];

    const rows = data.map((item) => [
      item.userId?.userName || "N/A",
      item.wardId?.panchayathId?.districtId?.districtName || "N/A",
      item.wardId?.panchayathId?.panchayathName || "N/A",
      item.wardId?.wardName || "N/A",
      item.departmentId?.departmentName || "N/A",
      item.complaintStatus,
      item.complaintTitle,
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + 
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `complaint_report_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <h2 className={style.title}>Location-wise Complaint Reports</h2>

        <div className={style.filterBox}>
          {/* Status */}
          <select name="status" onChange={handleChange} value={filters.status}>
            <option value="">All Status</option>
            <option>Submitted</option>
            <option>Verified</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>

          {/* District */}
          <select name="districtId" onChange={handleChange} value={filters.districtId}>
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d._id} value={d._id}>{d.districtName}</option>
            ))}
          </select>

          {/* Panchayath */}
          <select 
            name="panchayathId" 
            onChange={handleChange} 
            value={filters.panchayathId}
            disabled={!filters.districtId}
          >
            <option value="">Select Panchayath</option>
            {panchayaths.map((p) => (
              <option key={p._id} value={p._id}>{p.panchayathName}</option>
            ))}
          </select>

          {/* Ward */}
          <select 
            name="wardId" 
            onChange={handleChange} 
            value={filters.wardId}
            disabled={!filters.panchayathId}
          >
            <option value="">Select Ward</option>
            {wards.map((w) => (
              <option key={w._id} value={w._id}>{w.wardName}</option>
            ))}
          </select>

          <button className={style.applyBtn} onClick={loadReports}>Apply Filter</button>
          <button className={style.downloadBtn} onClick={downloadCSV}>Download CSV</button>
        </div>

        <div className={style.tableContainer}>
          <table className={style.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>District</th>
                <th>Panchayath</th>
                <th>Ward</th>
                <th>Department</th>
                <th>Status</th>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, i) => (
                  <tr key={i}>
                    <td>{item.userId?.userName}</td>
                    <td>{item.wardId?.panchayathId?.districtId?.districtName}</td>
                    <td>{item.wardId?.panchayathId?.panchayathName}</td>
                    <td>{item.wardId?.wardName}</td>
                    <td>{item.departmentId?.departmentName}</td>
                    <td>
                        <span className={`${style.statusBadge} ${style[item.complaintStatus.replace(/\s+/g, '')]}`}>
                            {item.complaintStatus}
                        </span>
                    </td>
                    <td>{item.complaintTitle}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" style={{textAlign:'center'}}>No complaints found for these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReport;