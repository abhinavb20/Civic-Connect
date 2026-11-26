import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCamera, FiSave, FiUser, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import style from "./EditProfile.module.css";

const EditProfile = () => {
  const uid = sessionStorage.getItem("uid") || sessionStorage.getItem("userId");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!uid) return;
    axios
      .get(`http://localhost:5000/user/${uid}`)
      .then((res) => {
        const u = res.data.user;
        setFullName(u.userName || "");
        setEmail(u.userEmail || "");
        setContact(u.userContact || "");
        setAddress(u.userAddress || "");
        setPreview(u.userPhoto ? `http://localhost:5000${u.userPhoto}` : "");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load profile data.");
      });
  }, [uid]);

  const handleSave = async () => {
    let newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!contact.trim()) newErrors.contact = "Contact is required";
    if (!address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("contact", contact);
      formData.append("address", address);
      if (photo) formData.append("photo", photo);

      await axios.put(`http://localhost:5000/user/${uid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      sessionStorage.setItem("userName", fullName);
      alert("Account credentials updated successfully.");
    } catch (err) {
      alert("Update failed. Please check your connection.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  if (!uid) return null;

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <header className={style.header}>
          <span className={style.badge}>Security & Identity</span>
          <h2 className={style.title}>Edit <span>Credentials</span></h2>
          <p className={style.subtitle}>Update your verified citizen information and profile visualization.</p>
        </header>

        <div className={style.formCard}>
          <div className={style.photoUploadSection}>
            <div className={style.previewWrapper}>
              {preview ? (
                <img src={preview} alt="Profile Preview" className={style.avatar} />
              ) : (
                <div className={style.placeholderAvatar}><FiUser size={40} /></div>
              )}
              <label className={style.cameraBtn}>
                <FiCamera />
                <input type="file" hidden onChange={handleImageChange} />
              </label>
            </div>
            <p className={style.photoHint}>Click the camera to upload a professional photo.</p>
          </div>

          <div className={style.inputGrid}>
            <div className={style.field}>
              <label><FiUser className={style.fieldIcon} /> Full Name</label>
              <input
                type="text"
                className={errors.fullName ? style.inputError : style.input}
                value={fullName}
                minLength={2}
                maxLength={30}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && <span className={style.errorMessage}>{errors.fullName}</span>}
            </div>

            <div className={style.field}>
              <label><FiMail className={style.fieldIcon} /> Official Email</label>
              <input
                type="email"
                className={errors.email ? style.inputError : style.input}
                value={email}
              
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <span className={style.errorMessage}>{errors.email}</span>}
            </div>

            <div className={style.field}>
              <label><FiPhone className={style.fieldIcon} /> Contact Number</label>
              <input
                type="text"
                className={errors.contact ? style.inputError : style.input}
                value={contact}
                maxLength={10}
                minLength={10}  
                onChange={(e) => setContact(e.target.value)}
              />
              {errors.contact && <span className={style.errorMessage}>{errors.contact}</span>}
            </div>

            <div className={`${style.field} ${style.fullWidth}`}>
              <label><FiMapPin className={style.fieldIcon} /> Residential Address</label>
              <textarea
                rows="3"
                className={errors.address ? style.inputError : style.textarea}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && <span className={style.errorMessage}>{errors.address}</span>}
            </div>
          </div>

          <div className={style.formActions}>
            <button className={style.primaryBtn} onClick={handleSave}>
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;