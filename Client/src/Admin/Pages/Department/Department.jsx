import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiLayers,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import { api } from "../../../api";
import EmptyState from "../../../ui/EmptyState";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import { useConfirm } from "../../../ui/ConfirmDialog";
import { useToast } from "../../../ui/Toast";
import styles from "./Department.module.css";

const Department = () => {
  const [value, setValue] = useState("");
  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  const loadDepartments = useCallback(async () => {
    try {
      const res = await api.get("/department");
      const sorted = [...(res.data?.departmentData || [])].sort((a, b) =>
        (a.departmentName || "").localeCompare(b.departmentName || "")
      );
      setDepartments(sorted);
    } catch {
      toast.error("Couldn't load departments", "Please refresh the page and try again.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleSave = async (event) => {
    event?.preventDefault();
    if (saving) return;

    const name = value.trim();
    if (!name) {
      setError("Enter a department name to continue.");
      return;
    }
    if (name.length < 2) {
      setError("Use at least 2 characters.");
      return;
    }
    if (departments.some((d) => d.departmentName?.toLowerCase() === name.toLowerCase())) {
      setError("That department already exists.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/department", { departmentName: name });
      setValue("");
      setError("");
      toast.success("Department added", `${name} is now available when filing a complaint.`);
      await loadDepartments();
    } catch {
      toast.error("Couldn't add department", "Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: `Delete ${item.departmentName}?`,
      message:
        "Citizens will no longer be able to select this department. Existing complaints keep their department label but can no longer be filed under it.",
      confirmLabel: "Delete department",
    });
    if (!ok) return;

    setDeletingId(item._id);
    try {
      await api.delete(`/department/${item._id}`);
      setDepartments((prev) => prev.filter((d) => d._id !== item._id));
      toast.success("Department deleted", `${item.departmentName} has been removed.`);
    } catch {
      toast.error("Couldn't delete department", "Please try again in a moment.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter((d) => d.departmentName?.toLowerCase().includes(q));
  }, [departments, query]);

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Service catalogue"
        title="Departments"
        description="The civic teams that own complaint categories — from roads and drainage to street lighting and waste."
        meta={
          <span className="cc-badge cc-badge--teal">
            {departments.length} departments
          </span>
        }
      />

      <div className={styles.layout}>
        <section className={`cc-card ${styles.formCard}`}>
          <div className="cc-card-head">
            <div>
              <h3>Add a department</h3>
              <p className={styles.headSub}>
                Citizens choose a department when they file a report.
              </p>
            </div>
            <span className={styles.headIcon}>
              <FiLayers />
            </span>
          </div>

          <form className="cc-card-body" onSubmit={handleSave} noValidate>
            <div className="cc-field">
              <label className="cc-label" htmlFor="department-name">
                Department name
              </label>
              <div className="cc-input-wrap">
                <FiLayers />
                <input
                  id="department-name"
                  className={`cc-input ${error ? "is-invalid" : ""}`}
                  placeholder="e.g. Public Works"
                  maxLength={60}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
                    setError("");
                  }}
                />
              </div>
              {error ? (
                <span className="cc-error">
                  <FiAlertCircle /> {error}
                </span>
              ) : (
                <span className="cc-hint">Keep names short and citizen-friendly.</span>
              )}
            </div>

            <button type="submit" className="cc-btn cc-btn--primary cc-btn--block" disabled={saving}>
              {saving ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Adding…
                </>
              ) : (
                <>
                  <FiPlus /> Add department
                </>
              )}
            </button>
          </form>

          <div className={styles.formNote}>
            Departments appear in the complaint form immediately after they are added.
          </div>
        </section>

        <section className={`cc-card ${styles.tableCard}`}>
          <div className={styles.tableHead}>
            <div>
              <h3>Department directory</h3>
              <p className={styles.headSub}>
                {query
                  ? `${filtered.length} of ${departments.length} shown`
                  : `${departments.length} ${departments.length === 1 ? "department" : "departments"} available`}
              </p>
            </div>
            <div className="cc-search">
              <FiSearch />
              <input
                type="search"
                placeholder="Search departments"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search departments"
              />
            </div>
          </div>

          {loading ? (
            <PageLoader label="Loading departments" rows={2} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FiLayers}
              title={departments.length === 0 ? "No departments yet" : "No matching departments"}
              description={
                departments.length === 0
                  ? "Add your first department so citizens know where to route their reports."
                  : "Try a different search term."
              }
              action={
                departments.length > 0 ? (
                  <button
                    type="button"
                    className="cc-btn cc-btn--secondary"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                  </button>
                ) : null
              }
            />
          ) : (
            <div className={styles.tableScroll}>
              <table className={`cc-table ${styles.table}`}>
                <thead>
                  <tr>
                    <th style={{ width: 64 }}>No.</th>
                    <th>Department</th>
                    <th className="cc-td-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, index) => (
                    <tr key={d._id}>
                      <td>
                        <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                      </td>
                      <td>
                        <div className={styles.nameCell}>
                          <span className={styles.nameIcon}>
                            <FiLayers />
                          </span>
                          <strong>{d.departmentName}</strong>
                        </div>
                      </td>
                      <td className="cc-td-actions">
                        <button
                          type="button"
                          className="cc-btn cc-btn--sm cc-btn--danger"
                          onClick={() => handleDelete(d)}
                          disabled={deletingId === d._id}
                        >
                          <FiTrash2 /> {deletingId === d._id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Department;
