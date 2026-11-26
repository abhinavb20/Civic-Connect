import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiHash,
  FiHome,
  FiMapPin,
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
import styles from "./Ward.module.css";

const Ward = () => {
  const [value, setValue] = useState("");
  const [wardNumber, setWardNumber] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [panchayathId, setPanchayathId] = useState("");

  const [districts, setDistricts] = useState([]);
  const [panchayaths, setPanchayaths] = useState([]);
  const [wards, setWards] = useState([]);
  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  const loadWards = useCallback(async () => {
    try {
      const res = await api.get("/ward");
      setWards(res.data?.wardData || []);
    } catch {
      toast.error("Couldn't load wards", "Please refresh the page and try again.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadDistricts = useCallback(async () => {
    try {
      const res = await api.get("/district");
      setDistricts(res.data?.districtData || []);
    } catch {
      toast.error("Couldn't load districts", "Please refresh the page and try again.");
    }
  }, [toast]);

  useEffect(() => {
    loadDistricts();
    loadWards();
  }, [loadDistricts, loadWards]);

  const fetchPanchayaths = async (dId) => {
    setDistrictId(dId);
    setPanchayathId("");
    setErrors((prev) => ({ ...prev, district: "", panchayath: "" }));
    if (!dId) {
      setPanchayaths([]);
      return;
    }
    try {
      const res = await api.get(`/panchayathByDistrict/${dId}`);
      setPanchayaths(res.data?.panchayathData || []);
    } catch {
      setPanchayaths([]);
      toast.error("Couldn't load panchayaths", "Please choose the district again.");
    }
  };

  const resetForm = () => {
    setValue("");
    setWardNumber("");
    setDistrictId("");
    setPanchayathId("");
    setPanchayaths([]);
    setErrors({});
  };

  const handleSave = async (event) => {
    event?.preventDefault();
    if (saving) return;

    const nextErrors = {};
    if (!districtId) nextErrors.district = "Choose a district.";
    if (!panchayathId) nextErrors.panchayath = "Choose a panchayath.";
    if (!wardNumber.trim()) nextErrors.wardNumber = "Enter the ward number.";
    if (!value.trim()) nextErrors.wardName = "Enter the ward name.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await api.post("/ward", {
        wardName: value.trim(),
        wardNumber: wardNumber.trim(),
        panchayathId,
      });
      toast.success(
        "Ward added",
        `Ward ${wardNumber.trim()} · ${value.trim()} is now available to citizens.`
      );
      resetForm();
      await loadWards();
    } catch {
      toast.error("Couldn't add ward", "Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: `Delete ${item.wardName}?`,
      message:
        "Citizens registered in this ward and complaints already filed from it are not deleted, but new reports cannot be routed here.",
      confirmLabel: "Delete ward",
    });
    if (!ok) return;

    setDeletingId(item._id);
    try {
      await api.delete(`/ward/${item._id}`);
      setWards((prev) => prev.filter((w) => w._id !== item._id));
      toast.success("Ward deleted", `${item.wardName} has been removed.`);
    } catch {
      toast.error("Couldn't delete ward", "Please try again in a moment.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return wards.filter((w) => {
      const district = w.panchayathId?.districtId;
      const matchesQuery =
        !q ||
        w.wardName?.toLowerCase().includes(q) ||
        String(w.wardNumber || "").toLowerCase().includes(q) ||
        w.panchayathId?.panchayathName?.toLowerCase().includes(q) ||
        district?.districtName?.toLowerCase().includes(q);
      const matchesDistrict = !districtFilter || district?._id === districtFilter;
      return matchesQuery && matchesDistrict;
    });
  }, [wards, query, districtFilter]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        `${a.panchayathId?.panchayathName || ""}${String(a.wardNumber || "").padStart(4, "0")}`
          .localeCompare(
            `${b.panchayathId?.panchayathName || ""}${String(b.wardNumber || "").padStart(4, "0")}`
          )
      ),
    [filtered]
  );

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Location hierarchy"
        title="Wards"
        description="The most precise level of your civic map. Citizens register against a ward, and every complaint is routed from it."
        meta={
          <span className="cc-badge cc-badge--violet">
            {wards.length} wards · {districts.length} districts
          </span>
        }
      />

      <div className={styles.layout}>
        <section className={`cc-card ${styles.formCard}`}>
          <div className="cc-card-head">
            <div>
              <h3>Register a ward</h3>
              <p className={styles.headSub}>
                Pick the panchayath first — wards can't move between panchayaths later.
              </p>
            </div>
            <span className={styles.headIcon}>
              <FiHash />
            </span>
          </div>

          <form className="cc-card-body" onSubmit={handleSave} noValidate>
            <div className="cc-field">
              <label className="cc-label" htmlFor="ward-district">
                <span>
                  <FiMapPin /> District
                </span>
              </label>
              <select
                id="ward-district"
                className={`cc-select ${errors.district ? "is-invalid" : ""}`}
                value={districtId}
                onChange={(e) => fetchPanchayaths(e.target.value)}
              >
                <option value="">Choose a district</option>
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.districtName}
                  </option>
                ))}
              </select>
              {errors.district && (
                <span className="cc-error">
                  <FiAlertCircle /> {errors.district}
                </span>
              )}
            </div>

            <div className="cc-field">
              <label className="cc-label" htmlFor="ward-panchayath">
                <span>
                  <FiHome /> Panchayath
                </span>
              </label>
              <select
                id="ward-panchayath"
                className={`cc-select ${errors.panchayath ? "is-invalid" : ""}`}
                value={panchayathId}
                onChange={(e) => {
                  setPanchayathId(e.target.value);
                  setErrors((prev) => ({ ...prev, panchayath: "" }));
                }}
                disabled={!districtId}
                aria-describedby={!districtId ? "ward-panchayath-hint" : undefined}
              >
                <option value="">
                  {districtId ? "Choose a panchayath" : "Select a district first"}
                </option>
                {panchayaths.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.panchayathName}
                  </option>
                ))}
              </select>
              {errors.panchayath ? (
                <span className="cc-error">
                  <FiAlertCircle /> {errors.panchayath}
                </span>
              ) : (
                <span className="cc-hint" id="ward-panchayath-hint">
                  {districtId && panchayaths.length === 0
                    ? "No panchayaths in this district yet."
                    : "Ward routing follows this panchayath."}
                </span>
              )}
            </div>

            <div className={styles.pair}>
              <div className="cc-field">
                <label className="cc-label" htmlFor="ward-number">
                  Ward no.
                </label>
                <input
                  id="ward-number"
                  className={`cc-input ${errors.wardNumber ? "is-invalid" : ""}`}
                  placeholder="e.g. 04"
                  maxLength={10}
                  value={wardNumber}
                  onChange={(e) => {
                    setWardNumber(e.target.value);
                    setErrors((prev) => ({ ...prev, wardNumber: "" }));
                  }}
                />
                {errors.wardNumber && (
                  <span className="cc-error">
                    <FiAlertCircle /> {errors.wardNumber}
                  </span>
                )}
              </div>

              <div className="cc-field">
                <label className="cc-label" htmlFor="ward-name">
                  Ward name
                </label>
                <input
                  id="ward-name"
                  className={`cc-input ${errors.wardName ? "is-invalid" : ""}`}
                  placeholder="e.g. North Colony"
                  maxLength={60}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setErrors((prev) => ({ ...prev, wardName: "" }));
                  }}
                />
                {errors.wardName && (
                  <span className="cc-error">
                    <FiAlertCircle /> {errors.wardName}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="cc-btn cc-btn--primary cc-btn--block"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <FiPlus /> Add ward
                </>
              )}
            </button>
          </form>

          <div className={styles.formNote}>
            Tip: wards are sorted by panchayath and ward number in the directory.
          </div>
        </section>

        <section className={`cc-card ${styles.tableCard}`}>
          <div className={styles.tableHead}>
            <div>
              <h3>Ward directory</h3>
              <p className={styles.headSub}>
                {query || districtFilter
                  ? `${sorted.length} of ${wards.length} shown`
                  : `${wards.length} registered ${wards.length === 1 ? "ward" : "wards"}`}
              </p>
            </div>

            <div className={styles.tools}>
              <div className="cc-search">
                <FiSearch />
                <input
                  type="search"
                  placeholder="Search wards"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search wards"
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
            <PageLoader label="Loading wards" rows={2} />
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={FiHash}
              title={wards.length === 0 ? "No wards yet" : "No matching wards"}
              description={
                wards.length === 0
                  ? "Register your first ward so citizens can link their address to it."
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
                    <th style={{ width: 90 }}>Ward</th>
                    <th>Ward name</th>
                    <th>Panchayath</th>
                    <th>District</th>
                    <th className="cc-td-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((w) => {
                    const panchayath = w.panchayathId;
                    const district = panchayath?.districtId;
                    return (
                      <tr key={w._id}>
                        <td>
                          <span className={styles.wardNo}>#{w.wardNumber || "—"}</span>
                        </td>
                        <td>
                          <strong>{w.wardName}</strong>
                        </td>
                        <td>{panchayath?.panchayathName || "—"}</td>
                        <td>
                          <span className="cc-badge cc-badge--brand">
                            <FiMapPin /> {district?.districtName || "—"}
                          </span>
                        </td>
                        <td className="cc-td-actions">
                          <button
                            type="button"
                            className="cc-btn cc-btn--sm cc-btn--danger"
                            onClick={() => handleDelete(w)}
                            disabled={deletingId === w._id}
                          >
                            <FiTrash2 /> {deletingId === w._id ? "Deleting…" : "Delete"}
                          </button>
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
    </div>
  );
};

export default Ward;
