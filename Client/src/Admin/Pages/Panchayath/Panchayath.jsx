import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiEdit3,
  FiHome,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { api } from "../../../api";
import EmptyState from "../../../ui/EmptyState";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import { useConfirm } from "../../../ui/ConfirmDialog";
import { useToast } from "../../../ui/Toast";
import styles from "./Panchayath.module.css";

const Panchayath = () => {
  const [value, setValue] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [panchayaths, setPanchayaths] = useState([]);
  const [editId, setEditId] = useState(null);
  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [errorName, setErrorName] = useState("");
  const [errorDist, setErrorDist] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  const loadData = useCallback(async () => {
    try {
      const [distRes, panRes] = await Promise.all([
        api.get("/district"),
        api.get("/panchayath"),
      ]);
      setDistricts(distRes.data?.districtData || []);
      setPanchayaths(panRes.data?.panchayathData || []);
    } catch {
      toast.error("Couldn't load panchayaths", "Please refresh the page and try again.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setEditId(null);
    setValue("");
    setDistrictId("");
    setErrorName("");
    setErrorDist("");
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setValue(item.panchayathName || "");
    setDistrictId(item.districtId?._id || "");
    setErrorName("");
    setErrorDist("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (event) => {
    event?.preventDefault();
    if (saving) return;

    let valid = true;
    if (!value.trim()) {
      setErrorName("Enter a panchayath name.");
      valid = false;
    }
    if (!districtId) {
      setErrorDist("Choose the parent district.");
      valid = false;
    }
    if (!valid) return;

    setSaving(true);
    try {
      if (editId) {
        await api.put(`/panchayath/${editId}`, {
          panchayathName: value.trim(),
          districtId,
        });
        toast.success("Panchayath updated", `${value.trim()} has been saved.`);
      } else {
        await api.post("/panchayath", {
          panchayathName: value.trim(),
          districtId,
        });
        toast.success("Panchayath added", `${value.trim()} is ready for ward assignment.`);
      }
      resetForm();
      await loadData();
    } catch {
      toast.error(
        editId ? "Couldn't update panchayath" : "Couldn't add panchayath",
        "Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: `Delete ${item.panchayathName}?`,
      message:
        "Wards registered under this panchayath are not deleted automatically. Their routing may break until they are reassigned.",
      confirmLabel: "Delete panchayath",
    });
    if (!ok) return;

    setDeletingId(item._id);
    try {
      await api.delete(`/panchayath/${item._id}`);
      setPanchayaths((prev) => prev.filter((p) => p._id !== item._id));
      toast.success("Panchayath deleted", `${item.panchayathName} has been removed.`);
    } catch {
      toast.error("Couldn't delete panchayath", "Please try again in a moment.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return panchayaths.filter((p) => {
      const matchesQuery =
        !q ||
        p.panchayathName?.toLowerCase().includes(q) ||
        p.districtId?.districtName?.toLowerCase().includes(q);
      const matchesDistrict = !districtFilter || p.districtId?._id === districtFilter;
      return matchesQuery && matchesDistrict;
    });
  }, [panchayaths, query, districtFilter]);

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Location hierarchy"
        title="Panchayaths"
        description="Local governance units inside each district. Authorities are assigned at this level, so wards always belong to exactly one panchayath."
        meta={
          <span className="cc-badge cc-badge--brand">
            {panchayaths.length} panchayaths · {districts.length} districts
          </span>
        }
      />

      <div className={styles.layout}>
        <section className={`cc-card ${styles.formCard}`}>
          <div className="cc-card-head">
            <div>
              <h3>{editId ? "Edit panchayath" : "Add a panchayath"}</h3>
              <p className={styles.headSub}>
                {editId
                  ? "Move a panchayath to another district or rename it."
                  : "Register a local body under an existing district."}
              </p>
            </div>
            {editId && (
              <button
                type="button"
                className="cc-icon-btn"
                onClick={resetForm}
                aria-label="Cancel editing"
              >
                <FiX />
              </button>
            )}
          </div>

          <form className="cc-card-body" onSubmit={handleSave} noValidate>
            <div className="cc-field">
              <label className="cc-label" htmlFor="panchayath-district">
                <span>
                  <FiMapPin /> Parent district
                </span>
              </label>
              <select
                id="panchayath-district"
                className={`cc-select ${errorDist ? "is-invalid" : ""}`}
                value={districtId}
                onChange={(e) => {
                  setDistrictId(e.target.value);
                  setErrorDist("");
                }}
              >
                <option value="">Choose a district</option>
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.districtName}
                  </option>
                ))}
              </select>
              {errorDist ? (
                <span className="cc-error">
                  <FiAlertCircle /> {errorDist}
                </span>
              ) : (
                <span className="cc-hint">
                  {districts.length === 0
                    ? "Add a district first to create panchayaths."
                    : "Panchayaths inherit their district's reporting tree."}
                </span>
              )}
            </div>

            <div className="cc-field">
              <label className="cc-label" htmlFor="panchayath-name">
                <span>
                  <FiHome /> Panchayath name
                </span>
              </label>
              <div className="cc-input-wrap">
                <FiHome />
                <input
                  id="panchayath-name"
                  className={`cc-input ${errorName ? "is-invalid" : ""}`}
                  placeholder="e.g. Punnapra"
                  maxLength={60}
                  value={value}
                  onChange={(e) => {
                    const next = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
                    setValue(next);
                    setErrorName("");
                  }}
                />
              </div>
              {errorName ? (
                <span className="cc-error">
                  <FiAlertCircle /> {errorName}
                </span>
              ) : (
                <span className="cc-hint">Use the official local body name.</span>
              )}
            </div>

            <div className={styles.formActions}>
              {editId && (
                <button type="button" className="cc-btn cc-btn--ghost" onClick={resetForm}>
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="cc-btn cc-btn--primary"
                disabled={saving || districts.length === 0}
              >
                {saving ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  <>
                    <FiPlus /> {editId ? "Save changes" : "Add panchayath"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className={`cc-card ${styles.tableCard}`}>
          <div className={styles.tableHead}>
            <div>
              <h3>Panchayath registry</h3>
              <p className={styles.headSub}>
                {query || districtFilter
                  ? `${filtered.length} of ${panchayaths.length} shown`
                  : `${panchayaths.length} registered ${panchayaths.length === 1 ? "unit" : "units"}`}
              </p>
            </div>

            <div className={styles.tools}>
              <div className="cc-search">
                <FiSearch />
                <input
                  type="search"
                  placeholder="Search panchayaths"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search panchayaths"
                />
              </div>
              <select
                className={`cc-select ${styles.filterSelect}`}
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                aria-label="Filter by district"
              >
                <option value="">All districts</option>
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.districtName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <PageLoader label="Loading panchayaths" rows={2} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FiHome}
              title={panchayaths.length === 0 ? "No panchayaths yet" : "No matching panchayaths"}
              description={
                panchayaths.length === 0
                  ? "Register your first panchayath to start assigning wards and authorities."
                  : "Try clearing the search or district filter."
              }
              action={
                query || districtFilter ? (
                  <button
                    type="button"
                    className="cc-btn cc-btn--secondary"
                    onClick={() => {
                      setQuery("");
                      setDistrictFilter("");
                    }}
                  >
                    Clear filters
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
                    <th>Panchayath</th>
                    <th>District</th>
                    <th className="cc-td-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, index) => (
                    <tr key={p._id} className={editId === p._id ? styles.activeRow : ""}>
                      <td>
                        <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                      </td>
                      <td>
                        <div className={styles.nameCell}>
                          <span className={styles.nameIcon}>
                            <FiHome />
                          </span>
                          <strong>{p.panchayathName}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="cc-badge cc-badge--brand">
                          <FiMapPin /> {p.districtId?.districtName || "Unassigned"}
                        </span>
                      </td>
                      <td className="cc-td-actions">
                        <button
                          type="button"
                          className="cc-btn cc-btn--sm cc-btn--secondary"
                          onClick={() => handleEdit(p)}
                        >
                          <FiEdit3 /> Edit
                        </button>
                        <button
                          type="button"
                          className="cc-btn cc-btn--sm cc-btn--danger"
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p._id}
                        >
                          <FiTrash2 /> {deletingId === p._id ? "Deleting…" : "Delete"}
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

export default Panchayath;
