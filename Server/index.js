// -------------------- Imports --------------------
const express = require("express");
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// -------------------- App Setup --------------------
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// -------------------- Database Connection --------------------
mongoose
  .connect(
    "mongodb+srv://abhi:abhi@civicconnect.a947qly.mongodb.net/",
  )
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// -------------------- File Upload Setup --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./public/uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// -------------------- Schemas & Models --------------------

// Admin Data
const adminSchema = new mongoose.Schema(
  {
    adminName: { type: String, required: true, trim: true },
    adminEmail: { type: String, required: true, trim: true },
    adminPassword: { type: String, required: true, trim: true },
  },
  { collection: "admins", timestamps: true },
);
const Admin = mongoose.model("Admin", adminSchema);

// Location Hierarchy
const districtSchema = new mongoose.Schema(
  {
    districtName: { type: String, required: true, trim: true },
  },
  { collection: "districts", timestamps: true },
);
const District = mongoose.model("District", districtSchema);

const panchayathSchema = new mongoose.Schema(
  {
    panchayathName: { type: String, required: true, trim: true },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "District",
    },
  },
  { collection: "panchayaths", timestamps: true },
);
const Panchayath = mongoose.model("Panchayath", panchayathSchema);

const wardSchema = new mongoose.Schema(
  {
    wardName: { type: String, required: true, trim: true },
    wardNumber: { type: String, required: true, trim: true },
    panchayathId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Panchayath",
    },
  },
  { collection: "wards", timestamps: true },
);
const Ward = mongoose.model("Ward", wardSchema);

// Departments/Categories
const departmentSchema = new mongoose.Schema(
  {
    departmentName: { type: String, required: true, trim: true },
  },
  { collection: "departments", timestamps: true },
);
const Department = mongoose.model("Department", departmentSchema);

// Authority (One per panchayath)
const authoritySchema = new mongoose.Schema(
  {
    authorityName: { type: String, required: true, trim: true },
    authorityEmail: { type: String, required: true, trim: true },
    authorityPassword: { type: String, required: true, trim: true },
    authorityContact: { type: String, required: true, trim: true },
    panchayathId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Panchayath",
    },
  },
  { collection: "authorities", timestamps: true },
);
const Authority = mongoose.model("Authority", authoritySchema);

// User
const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, trim: true },
    userContact: { type: String, required: true, trim: true },
    userPassword: { type: String, required: true, trim: true },
    userAddress: { type: String, required: true, trim: true },
    userPhoto: { type: String, default: "" },
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Ward",
    },
  },
  { collection: "users", timestamps: true },
);
const User = mongoose.model("User", userSchema);

// Complaint
const complaintSchema = new mongoose.Schema(
  {
    complaintTitle: { type: String, required: true, trim: true },
    complaintContent: { type: String, required: true, trim: true },
    complaintPhotos: [{ type: String }],
    complaintStatus: {
      type: String,
      enum: [
        "Submitted",
        "Verified",
        "In Progress",
        "Resolved",
        "Closed",
        "Rejected",
      ],
      default: "Submitted",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Ward",
    },
    panchayathId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Panchayath",
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Department",
    },
  },
  { collection: "complaints", timestamps: true },
);
const Complaint = mongoose.model("Complaint", complaintSchema);

// Complaint Reply (Authority)
const complaintReplySchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Complaint",
    },
    authorityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Authority",
    },
    replyText: { type: String, required: true, trim: true },
    replyPhoto: { type: String, default: "" },
  },
  { collection: "complaint_replies", timestamps: true },
);
const ComplaintReply = mongoose.model("ComplaintReply", complaintReplySchema);

// Complaint Support
const complaintSupportSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Complaint",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { collection: "complaint_supports", timestamps: true },
);
const ComplaintSupport = mongoose.model(
  "ComplaintSupport",
  complaintSupportSchema,
);

// -------------------- ROUTES --------------------

app.get("/greetings", async (req, res) => {
  res.send({ msg: "Hello Civic Connect" });
});

// Unified Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check Admin
    const admin = await Admin.findOne({
      adminEmail: email,
      adminPassword: password,
    });
    if (admin) {
      return res.json({
        role: "admin",
        id: admin._id,
        name: admin.adminName,
        msg: "Login successful",
      });
    }

    // Check User
    const user = await User.findOne({
      userEmail: email,
      userPassword: password,
    });
    if (user) {
      return res.json({
        role: "user",
        id: user._id,
        name: user.userName,
        msg: "Login successful",
      });
    }


    // Check Authority
    const authority = await Authority.findOne({
      authorityEmail: email,
      authorityPassword: password,
    });
    if (authority) {
      return res.json({
        role: "authority",
        id: authority._id,
        name: authority.authorityName,
        msg: "Login successful",
      });
    }

    // None matched
    return res.status(401).json({ msg: "Invalid email or password" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    await Admin.create({
      adminName: name,
      adminEmail: email,
      adminPassword: password,
    });
    res.json({ msg: "Admin Created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Districts
app.post("/district", async (req, res) => {
  try {
    const { districtName } = req.body;
    await District.create({ districtName });
    res.json({ msg: "District inserted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/district", async (req, res) => {
  try {
    const districtData = await District.find();
    res.json({ districtData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/district/:id", async (req, res) => {
  try {
    const { districtName } = req.body;

    const updatedDistrict = await District.findByIdAndUpdate(
      req.params.id,
      { districtName },
      { new: true } // returns updated document
    );

    if (!updatedDistrict) {
      return res.status(404).json({ msg: "District not found" });
    }

    res.json({
      msg: "District updated successfully",
      district: updatedDistrict,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/district/:id", async (req, res) => {
  try {
    await District.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Panchayaths
app.post("/panchayath", async (req, res) => {
  try {
    const { panchayathName, districtId } = req.body;
    await Panchayath.create({ panchayathName, districtId });
    res.json({ msg: "Panchayath inserted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/panchayath", async (req, res) => {
  try {
    const panchayathData = await Panchayath.find().populate("districtId");
    res.json({ panchayathData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/panchayathByDistrict/:districtId", async (req, res) => {
  try {
    const panchayathData = await Panchayath.find({
      districtId: req.params.districtId,
    });
    res.json({ panchayathData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/panchayath/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { panchayathName, districtId } = req.body;

    const updatedPanchayath = await Panchayath.findByIdAndUpdate(
      id,
      {
        panchayathName,
        districtId,
      },
      {
        new: true,          // return updated document
        runValidators: true // validate before updating
      }
    );

    if (!updatedPanchayath) {
      return res.status(404).json({ msg: "Panchayath not found" });
    }

    res.json({
      msg: "Panchayath updated successfully",
      data: updatedPanchayath,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/panchayath/:id", async (req, res) => {
  try {
    await Panchayath.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Wards
app.post("/ward", async (req, res) => {
  try {
    const { wardName, wardNumber, panchayathId } = req.body;
    await Ward.create({ wardName, wardNumber, panchayathId });
    res.json({ msg: "Ward inserted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/ward", async (req, res) => {
  try {
    const wardData = await Ward.find().populate({
      path: "panchayathId",
      populate: { path: "districtId" },
    });
    res.json({ wardData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/wardByPanchayath/:panchayathId", async (req, res) => {
  try {
    const wardData = await Ward.find({ panchayathId: req.params.panchayathId });
    res.json({ wardData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/ward/:id", async (req, res) => {
  try {
    await Ward.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Departments
app.post("/department", async (req, res) => {
  try {
    const { departmentName } = req.body;
    await Department.create({ departmentName });
    res.json({ msg: "Department inserted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/department", async (req, res) => {
  try {
    const departmentData = await Department.find();
    res.json({ departmentData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/department/:id", async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authority
app.post("/authority", async (req, res) => {
  try {
    const { name, email, password, contact, panchayathId } = req.body;
    await Authority.create({
      authorityName: name,
      authorityEmail: email,
      authorityPassword: password,
      authorityContact: contact,
      panchayathId,
    });
    res.json({ msg: "Authority inserted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/authority", async (req, res) => {
  try {
    const authorityData = await Authority.find().populate("panchayathId");
    res.json({ authorityData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/authority/:id", async (req, res) => {
  const authority = await Authority.findById(req.params.id)
    .populate("panchayathId");
  res.json(authority);
});

app.delete("/authority/:id", async (req, res) => {
  try {
    await Authority.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Change Password
app.put("/userPassword/:id", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check old password
    if (user.userPassword !== oldPassword) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // update password
    user.userPassword = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// User Registration & Login
app.post("/userregistration", upload.single("photo"), async (req, res) => {
  try {
    const { fullName, email, password, contact, address, wardId } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : "";
    await User.create({
      userName: fullName,
      userEmail: email,
      userPassword: password,
      userContact: contact,
      userAddress: address,
      userPhoto: photo,
      wardId: wardId,
    });
    res.json({ msg: "Inserted Success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().populate({
      path: "wardId",
      populate: { path: "panchayathId", populate: { path: "districtId" } },
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("wardId", "wardName wardNumber");

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put("/user/:id", upload.single("photo"), async (req, res) => {
  try {
    const { fullName, email, contact, address, password } = req.body;

    let updateData = {
      userName: fullName,
      userEmail: email,
      userContact: contact,
      userAddress: address,
    };

    // update password only if provided
    if (password && password.trim() !== "") {
      updateData.userPassword = password;
    }

    // update photo if uploaded
    if (req.file) {
      updateData.userPhoto = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ msg: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complaints
app.post("/complaint", upload.array("photos", 5), async (req, res) => {
  try {
    const { title, content, userId, departmentId } = req.body;

    const user = await User.findById(userId).populate({
      path: "wardId",
      populate: {
        path: "panchayathId",
        populate: { path: "districtId" },
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // ✅ multiple photos
    const photos = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const complaint = await Complaint.create({
      complaintTitle: title,
      complaintContent: content,
      complaintPhotos: photos,

      userId: user._id,
      wardId: user.wardId._id,
      panchayathId: user.wardId.panchayathId._id,

      departmentId,
      complaintStatus: "Submitted",
    });

    res.json({ msg: "Complaint submitted", complaint });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/complaintByPanchayath/:panchayathId", async (req, res) => {
  try {
    const complaints = await Complaint.find({
      panchayathId: req.params.panchayathId,
    })
      .populate("userId", "userName userContact userPhoto")
      .populate("wardId", "wardName wardNumber")
      .populate("departmentId", "departmentName")
      .sort({ createdAt: -1 });

    // Add support count
    const complaintsWithSupport = await Promise.all(
      complaints.map(async (c) => {
        const supportCount = await ComplaintSupport.countDocuments({
          complaintId: c._id,
        });
        return { ...c.toObject(), supportCount };
      }),
    );

    res.json({ data: complaintsWithSupport });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/complaintByUser/:userId", async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.params.userId })
      .populate("departmentId", "departmentName")
      .populate("wardId", "wardName wardNumber")
      .sort({ createdAt: -1 });
    res.json({ data: complaints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/complaintByWard/:wardId", async (req, res) => {
  try {
    const complaints = await Complaint.find({ wardId: req.params.wardId })
      .populate("userId", "userName")
      .populate("departmentId", "departmentName")
      .sort({ createdAt: -1 });

    const complaintsWithSupport = await Promise.all(
      complaints.map(async (c) => {
        const supportCount = await ComplaintSupport.countDocuments({
          complaintId: c._id,
        });
        return { ...c.toObject(), supportCount };
      }),
    );

    res.json({ data: complaintsWithSupport });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/complaints", async (req, res) => {
  try {
    const data = await Complaint.find()
      .populate("userId", "userName")
      .populate("wardId", "wardName wardNumber")
      .populate("panchayathId", "panchayathName")
      .populate("departmentId", "departmentName")
      .sort({ createdAt: -1 });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/complaint/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await Complaint.findByIdAndUpdate(req.params.id, {
      complaintStatus: status,
    });
    res.json({ msg: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Support Complaint
app.post("/complaint/:id/support", async (req, res) => {
  try {
    const { userId } = req.body;
    const existing = await ComplaintSupport.findOne({
      complaintId: req.params.id,
      userId,
    });
    if (existing) {
      return res.status(400).json({ msg: "Already supported" });
    }
    await ComplaintSupport.create({ complaintId: req.params.id, userId });
    res.json({ msg: "Support added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get support counts for all complaints
app.get("/complaints/all-votes", async (req, res) => {
  try {
    const votes = await ComplaintSupport.aggregate([
      {
        $group: {
          _id: "$complaintId", // Group by the complaint
          totalVotes: { $sum: 1 } // Count each document
        }
      }
    ]);

    res.json({ data: votes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all complaints with full details
app.get("/allcomplaints", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "userName userEmail") // Get user info
      .populate("departmentId", "departmentName") // Get department name
      .populate({
        path: "wardId",
        select: "wardName wardNumber",
        populate: {
          path: "panchayathId",
          select: "panchayathName"
        }
      })
      .sort({ createdAt: -1 });

    res.json({ data: complaints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/complaint/:id/support/check/:userId", async (req, res) => {
  try {
    const supported = await ComplaintSupport.findOne({
      complaintId: req.params.id,
      userId: req.params.userId,
    });
    res.json({ supported: !!supported });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authority Reply
app.post("/complaint/:id/reply", upload.single("photo"), async (req, res) => {
  try {
    const { authorityId, text } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : "";
    const reply = await ComplaintReply.create({
      complaintId: req.params.id,
      authorityId,
      replyText: text,
      replyPhoto: photo,
    });
    // Ensure complaint status moves to In Progress or Resolved
    res.json({ msg: "Reply added", reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/complaint/:id/replies", async (req, res) => {
  try {
    const replies = await ComplaintReply.find({
      complaintId: req.params.id,
    }).populate("authorityId", "authorityName");
    res.json({ replies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authority Dashboard Stats
app.get("/authority/dashboard/:panchayathId", async (req, res) => {
  try {
    const { panchayathId } = req.params;

    const users = await User.countDocuments({
      wardId: { $exists: true }
    });

    const totalComplaints = await Complaint.countDocuments({ panchayathId });

    const resolved = await Complaint.countDocuments({
      panchayathId,
      complaintStatus: "Resolved"
    });

    const pending = await Complaint.countDocuments({
      panchayathId,
      complaintStatus: { $in: ["Submitted", "Verified", "In Progress"] }
    });

    res.json({
      users,
      totalComplaints,
      resolved,
      pending
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard Stats
app.get("/admin/dashboard", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const authorities = await Authority.countDocuments();
    const complaints = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({
      complaintStatus: "Resolved",
    });
    const pending = await Complaint.countDocuments({
      complaintStatus: { $in: ["Submitted", "Verified", "In Progress"] },
    });
    res.json({ users, authorities, complaints, resolved, pending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REPORT FILTER API
app.get("/admin/reports", async (req, res) => {
  try {
    const { district, panchayath, ward, department, status } = req.query;

    let filter = {};

    if (status) filter.complaintStatus = status;
    if (department) filter.departmentId = department;
    if (ward) filter.wardId = ward;
    if (panchayath) filter.panchayathId = panchayath;

    let complaints = await Complaint.find(filter)
      .populate({
        path: "wardId",
        populate: {
          path: "panchayathId",
          populate: { path: "districtId" },
        },
      })
      .populate("departmentId", "departmentName")
      .populate("userId", "userName");

    // filter district manually
    if (district) {
      complaints = complaints.filter(
        (c) => c.wardId?.panchayathId?.districtId?._id.toString() === district
      );
    }

    res.json({ data: complaints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/admin/reports", async (req, res) => {
  try {
    const { district, panchayath, ward, status } = req.query;
    let filter = {};

    // Build the filter object based on provided queries
    if (status) filter.complaintStatus = status;
    if (ward) filter.wardId = ward;
    if (panchayath) filter.panchayathId = panchayath;

    let complaints = await Complaint.find(filter)
      .populate({
        path: "wardId",
        populate: {
          path: "panchayathId",
          populate: { path: "districtId" },
        },
      })
      .populate("departmentId", "departmentName")
      .populate("userId", "userName");

    // Manual filter for District since it's nested deep in the schema
    if (district && !panchayath) {
      complaints = complaints.filter(
        (c) => c.wardId?.panchayathId?.districtId?._id.toString() === district
      );
    }

    res.json({ data: complaints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// -------------------- SERVER START --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
