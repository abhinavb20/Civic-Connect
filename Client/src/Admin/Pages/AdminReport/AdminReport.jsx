import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiFilter,
  FiMapPin,
  FiRotateCcw,
  FiSearch,
  FiTrendingUp,
} from "react-icons/fi";
import { api } from "../../../api";
import EmptyState from "../../../ui/EmptyState";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import StatusPill from "../../../ui/StatusPill";
import { useToast } from "../../../ui/Toast";
import styles from "./AdminReport.module.css";

const STATUS_OPTIONS = ["Submitted", "Verified", "In Progress", "Resolved", "Closed", "Rejected"];
const OPEN_STATUSES = ["Submitted", "Verified", "In Progress"];
const EMPTY_FILTERS = { status: "", districtId: "", panchayathId: "", wardId: "" };

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const AdminReport = () => {
  const [data, setData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [panchayaths, setPanchayaths] = useState([]);
  const [wards, setWards] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const toast = useToast();

  const loadReports = useCallback(
    async (active = EMPTY_FILTERS) => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/reports", {
          params: {
            status: active.status,
            district: active.districtId,
            panchayath: active.panchayathId,
            ward: active.wardId,
          },
        });
        setData(res.data?.data || []);
      } catch {
        setError("We couldn't load reports for these filters. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadReports();
    api
      .get("/district")
      .then((res) => setDistricts(res.data?.districtData || []))
      .catch(() => toast.error("Couldn't load districts", "Filters may be incomplete."));
  }, [loadReports, toast]);

  const fetchPanchayaths = async (districtId) => {
    if (!districtId) {
      setPanchayaths([]);
      return;
    }
    try {
      const res = await api.get(`/panchayathByDistrict/${districtId}`);
      setPanchayaths(res.data?.panchayathData || []);
    } catch {
      setPanchayaths([]);
      toast.error("Couldn't load panchayaths", "Please choose the district again.");
    }
  };

  const fetchWards = async (panchayathId) => {
    if (!panchayathId) {
      setWards([]);
      return;
    }
    try {
      const res = await api.get(`/wardByPanchayath/${panchayathId}`);
      setWards(res.data?.wardData || []);
    } catch {
      setWards([]);
      toast.error("Couldn't load wards", "Please choose the panchayath again.");
    }
  };

  const handleChange = (name, value) => {
    if (name === "districtId") {
      setFilters((prev) => ({ ...prev, districtId: value, panchayathId: "", wardId: "" }));
      setWards([]);
      fetchPanchayaths(value);
      return;
    }
    if (name === "panchayathId") {
      setFilters((prev) => ({ ...prev, panchayathId: value, wardId: "" }));
      fetchWards(value);
      return;
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = (event) => {
    event?.preventDefault();
    loadReports(filters);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setPanchayaths([]);
    setWards([]);
    loadReports(EMPTY_FILTERS);
  };

  const activeFilters = useMemo(() => {
    const chips = [];
    if (filters.status) chips.push({ key: "status", label: filters.status });
    if (filters.districtId) {
      chips.push({
        key: "districtId",
        label: districts.find((d) => d._id === filters.districtId)?.districtName || "District",
      });
    }
    if (filters.panchayathId) {
      chips.push({
        key: "panchayathId",
        label:
          panchayaths.find((p) => p._id === filters.panchayathId)?.panchayathName || "Panchayath",
      });
    }
    if (filters.wardId) {
      chips.push({
        key: "wardId",
        label: wards.find((w) => w._id === filters.wardId)?.wardName || "Ward",
      });
    }
    return chips;
  }, [filters, districts, panchayaths, wards]);

  const summary = useMemo(() => {
    const total = data.length;
    const resolved = data.filter((c) => c.complaintStatus === "Resolved").length;
    const open = data.filter((c) => OPEN_STATUSES.includes(c.complaintStatus)).length;
    const areas = new Set();
    data.forEach((c) => {
      const name = c.wardId?.panchayathId?.panchayathName;
      if (name) areas.add(name);
    });
    return {
      total,
      resolved,
      open,
      areas: areas.size,
      rate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    };
  }, [data]);

  const downloadCSV = () => {
    if (data.length === 0) {
      toast.info("Nothing to export", "Adjust the filters to include at least one complaint.");
      return;
    }

    setExporting(true);
    try {
      const headers = [
        "Complaint ID",
        "Citizen",
        "District",
        "Panchayath",
        "Ward",
        "Ward number",
        "Department",
        "Status",
        "Title",
        "Description",
        "Filed on",
      ];

      const rows = data.map((item) => [
        item._id,
        item.userId?.userName || "N/A",
        item.wardId?.panchayathId?.districtId?.districtName || "N/A",
        item.wardId?.panchayathId?.panchayathName || "N/A",
        item.wardId?.wardName || "N/A",
        item.wardId?.wardNumber || "N/A",
        item.departmentId?.departmentName || "General",
        item.complaintStatus || "Submitted",
        item.complaintTitle || "",
        item.complaintContent || "",
        formatDate(item.createdAt),
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map(csvCell).join(","))
        .join("\r\n");

      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `civic-connect-complaints-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Report exported", `${data.length} complaints saved as CSV.`);
    } catch {
      toast.error("Export failed", "Please try again in a moment.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Reports & exports"
        title="Location-wise complaint reports"
        description="Filter complaints by status and jurisdiction, review the results, and export a spreadsheet for offline analysis."
        actions={
          <button
            type="button"
            className="cc-btn cc-btn--primary"
            onClick={downloadCSV}
            disabled={exporting || loading || data.length === 0}
          >
            <FiDownload /> {exporting ? "Exporting…" : "Download CSV"}
          </button>
        }
      />

      <form className={`cc-card ${styles.filterCard}`} onSubmit={handleApply}>
        <div className={styles.filterHead}>
          <div>
            <h3>
              <FiFilter /> Filters
            </h3>
            <p className={styles.headSub}>
              Narrow by status, district, panchayath, or ward. District filters apply across the
              whole tree.
            </p>
          </div>
          {activeFilters.length > 0 && (
            <div className={styles.activeChips}>
              {activeFilters.map((chip) => (
                <span key={chip.key} className="cc-badge cc-badge--brand">
                  {chip.label}
                </span>
              ))}
              <button type="button" className={styles.clearAll} onClick={handleReset}>
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className={styles.filterGrid}>
          <div className="cc-field">
            <label className="cc-label" htmlFor="report-status">
              Status
            </label>
            <select
              id="report-status"
              className="cc-select"
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="cc-field">
            <label className="cc-label" htmlFor="report-district">
              District
            </label>
            <select
              id="report-district"
              className="cc-select"
              value={filters.districtId}
              onChange={(e) => handleChange("districtId", e.target.value)}
            >
              <option value="">All districts</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.districtName}
                </option>
              ))}
            </select>
          </div>

          <div className="cc-field">
            <label className="cc-label" htmlFor="report-panchayath">
              Panchayath
            </label>
            <select
              id="report-panchayath"
              className="cc-select"
              value={filters.panchayathId}
              onChange={(e) => handleChange("panchayathId", e.target.value)}
              disabled={!filters.districtId}
            >
              <option value="">
                {filters.districtId ? "All panchayaths" : "Select a district first"}
              </option>
              {panchayaths.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.panchayathName}
                </option>
              ))}
            </select>
          </div>

          <div className="cc-field">
            <label className="cc-label" htmlFor="report-ward">
              Ward
            </label>
            <select
              id="report-ward"
              className="cc-select"
              value={filters.wardId}
              onChange={(e) => handleChange("wardId", e.target.value)}
              disabled={!filters.panchayathId}
            >
              <option value="">
                {filters.panchayathId ? "All wards" : "Select a panchayath first"}
              </option>
              {wards.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.wardName}
                  {w.wardNumber ? ` (#${w.wardNumber})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterActions}>
            <button type="button" className="cc-btn cc-btn--ghost" onClick={handleReset}>
              <FiRotateCcw /> Reset
            </button>
            <button type="submit" className="cc-btn cc-btn--primary">
              <FiSearch /> Apply filters
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="cc-note cc-note--rose" style={{ marginBottom: 20 }} role="alert">
          <FiAlertCircle /> {error}
        </div>
      )}

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryIcon}>
            <FiFileText />
          </span>
          <div>
            <strong>{summary.total}</strong>
            <span>Complaints in view</span>
          </div>
        </div>
        <div className={styles.summaryItem}>
          <span className={`${styles.summaryIcon} ${styles.amber}`}>
            <FiClock />
          </span>
          <div>
            <strong>{summary.open}</strong>
            <span>Still open</span>
          </div>
        </div>
        <div className={styles.summaryItem}>
          <span className={`${styles.summaryIcon} ${styles.green}`}>
            <FiCheckCircle />
          </span>
          <div>
            <strong>{summary.resolved}</strong>
            <span>Resolved</span>
          </div>
        </div>
        <div className={styles.summaryItem}>
          <span className={`${styles.summaryIcon} ${styles.teal}`}>
            <FiTrendingUp />
          </span>
          <div>
            <strong>{summary.rate}%</strong>
            <span>Resolution rate</span>
          </div>
        </div>
      </div>

      <section className={`cc-card ${styles.tableCard}`}>
        <div className={styles.tableHead}>
          <div>
            <h3>Complaint rows</h3>
            <p className={styles.headSub}>
              {loading
                ? "Applying filters…"
                : `${summary.total} ${summary.total === 1 ? "result" : "results"} across ${summary.areas} ${
                    summary.areas === 1 ? "panchayath" : "panchayaths"
                  }`}
            </p>
          </div>
          <span className="cc-badge cc-badge--brand">
            <FiMapPin /> {summary.areas} areas
          </span>
        </div>

        {loading ? (
          <PageLoader label="Loading report rows" rows={3} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={FiFileText}
            title="No complaints match these filters"
            description="Try widening the status or location filters, or reset to see every complaint."
            action={
              <button type="button" className="cc-btn cc-btn--secondary" onClick={handleReset}>
                <FiRotateCcw /> Reset filters
              </button>
            }
          />
        ) : (
          <div className={styles.tableScroll}>
            <table className={`cc-table ${styles.table}`}>
              <thead>
                <tr>
                  <th>Citizen</th>
                  <th>Jurisdiction</th>
                  <th>Department</th>
                  <th>Complaint</th>
                  <th>Status</th>
                  <th>Filed</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const district = item.wardId?.panchayathId?.districtId?.districtName;
                  const panchayath = item.wardId?.panchayathId?.panchayathName;
                  const ward = item.wardId?.wardName;
                  const wardNumber = item.wardId?.wardNumber;
                  return (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.userId?.userName || "Anonymous"}</strong>
                      </td>
                      <td>
                        <div className={styles.jurisdiction}>
                          <span className="cc-badge cc-badge--brand">
                            <FiMapPin /> {district || "Unassigned"}
                          </span>
                          <span>
                            {panchayath || "—"}
                            {ward ? ` · ${ward}` : ""}
                            {wardNumber ? ` (#${wardNumber})` : ""}
                          </span>
                        </div>
                      </td>
                      <td>{item.departmentId?.departmentName || "General"}</td>
                      <td className={styles.titleCell}>
                        <strong>{item.complaintTitle}</strong>
                        <span>{item.complaintContent}</span>
                      </td>
                      <td>
                        <StatusPill status={item.complaintStatus || "Submitted"} />
                      </td>
                      <td>
                        <span className={styles.date}>
                          <FiCalendar /> {formatDate(item.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminReport;
