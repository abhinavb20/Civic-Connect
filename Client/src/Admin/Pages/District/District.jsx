import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiEdit3,
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
import styles from "./District.module.css";

const titleCase = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1);

const District = () => {
  const [value, setValue] = useState("");
  const [districts, setDistricts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  const loadDistricts = useCallback(async () => {
    try {
      const res = await api.get("/district");
      setDistricts(res.data?.districtData || []);
    } catch {
      toast.error("Couldn't load districts", "Please refresh the page and try again.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDistricts();
  }, [loadDistricts]);

  const resetForm = () => {
    setEditId(null);
    setEditName("");
    setValue("");
    setError("");
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setEditName(item.districtName);
    setValue("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (event) => {
    event?.preventDefault();
    if (saving) return;

    const name = (editId ? editName : value).trim();
    if (!name) {
      setError("Enter a district name to continue.");
      return;
    }
    if (name.length < 2) {
      setError("Use at least 2 characters.");
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await api.put(`/district/${editId}`, { districtName: name });
        toast.success("District updated", `${name} has been renamed.`);
      } else {
        await api.post("/district", { districtName: name });
        toast.success("District added", `${name} is now part of the hierarchy.`);
      }
      resetForm();
      await loadDistricts();
    } catch {
      toast.error(
        editId ? "Couldn't update district" : "Couldn't add district",
        "Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: `Delete ${item.districtName}?`,
      message:
        "This removes the district from the location hierarchy. Panchayaths registered under it are not deleted automatically and may become unassigned.",
      confirmLabel: "Delete district",
    });
    if (!ok) return;

    setDeletingId(item._id);
    try {
      await api.delete(`/district/${item._id}`);
      setDistricts((prev) => prev.filter((d) => d._id !== item._id));
      toast.success("District deleted", `${item.districtName} has been removed.`);
    } catch {
      toast.error("Couldn't delete district", "Please try again in a moment.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return districts;
    return districts.filter((d) => d.districtName?.toLowerCase().includes(q));
  }, [districts, query]);

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Location hierarchy"
        title="Districts"
        description="The top level of your civic structure. Every panchayath, ward, and complaint ultimately routes through a district."
        meta={<span className="cc-badge cc-badge--brand">{districts.length} districts</span>}
      />

      <div className={styles.layout}>
        <section className={`cc-card ${styles.formCard}`}>
          <div className="cc-card-head">
            <div>
              <h3>{editId ? "Rename district" : "Add a district"}</h3>
              <p className={styles.headSub}>
                {editId
                  ? "Update the official district name."
                  : "Start by creating the district your panchayaths belong to."}
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
              <label className="cc-label" htmlFor="district-name">
                <span>
                  <FiMapPin /> District name
                </span>
              </label>
              <div className="cc-input-wrap">
                <FiMapPin />
                <input
                  id="district-name"
                  className={`cc-input ${error ? "is-invalid" : ""}`}
                  placeholder="e.g. Ernakulam"
                  maxLength={60}
                  value={editId ? editName : value}
                  onChange={(e) => {
                    const next = titleCase(e.target.value);
                    if (editId) setEditName(next);
                    else setValue(next);
                    setError("");
                  }}
                />
              </div>
              {error ? (
                <span className="cc-error">
                  <FiAlertCircle /> {error}
                </span>
              ) : (
                <span className="cc-hint">Use the official revenue district name.</span>
              )}
            </div>

            <div className={styles.formActions}>
              {editId && (
                <button type="button" className="cc-btn cc-btn--ghost" onClick={resetForm}>
                  Cancel
                </button>
              )}
              <button type="submit" className="cc-btn cc-btn--primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  <>
                    <FiPlus /> {editId ? "Save changes" : "Add district"}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className={styles.formNote}>
            Deleting a district never deletes its complaints. Reassign panchayaths first to keep
            reporting routes intact.
          </div>
        </section>

        <section className={`cc-card ${styles.tableCard}`}>
          <div className={styles.tableHead}>
            <div>
              <h3>District directory</h3>
              <p className={styles.headSub}>
                {query
                  ? `${filtered.length} of ${districts.length} shown`
                  : `${districts.length} active ${districts.length === 1 ? "district" : "districts"}`}
              </p>
            </div>
            <div className="cc-search">
              <FiSearch />
              <input
                type="search"
                placeholder="Search districts"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search districts"
              />
            </div>
          </div>

          {loading ? (
            <PageLoader label="Loading districts" rows={2} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FiMapPin}
              title={districts.length === 0 ? "No districts yet" : "No matching districts"}
              description={
                districts.length === 0
                  ? "Add your first district to start building the location hierarchy."
                  : "Try a different search term."
              }
              action={
                districts.length > 0 ? (
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
                    <th>District</th>
                    <th className="cc-td-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, index) => (
                    <tr key={d._id} className={editId === d._id ? styles.activeRow : ""}>
                      <td>
                        <span className={styles.index}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td>
                        <div className={styles.nameCell}>
                          <span className={styles.nameIcon}>
                            <FiMapPin />
                          </span>
                          <strong>{d.districtName}</strong>
                        </div>
                      </td>
                      <td className="cc-td-actions">
                        <button
                          type="button"
                          className="cc-btn cc-btn--sm cc-btn--secondary"
                          onClick={() => startEdit(d)}
                        >
                          <FiEdit3 /> Edit
                        </button>
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

export default District;
