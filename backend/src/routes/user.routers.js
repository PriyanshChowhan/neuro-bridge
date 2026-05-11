import express from "express";
import { User } from "../models/user.js";

const router = express.Router();

/* --------- CLEAN EMAIL HELPER --------- */
function cleanEmail(email) {
  if (!email) return "";
  return email.trim().toLowerCase();
}

/* --------- GET ALL USERS --------- */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* --------- CREATE USER (for testing) --------- */
router.post("/", async (req, res) => {
  try {
    let { username, emailId, password } = req.body;

    // CLEAN EMAIL BEFORE SAVING
    emailId = cleanEmail(emailId);

    const user = await User.create({ username, emailId, password });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* --------- LOGIN (email + password) --------- */
router.post("/login", async (req, res) => {
  try {
    let { emailId, password } = req.body || {};
    emailId = cleanEmail(emailId);

    if (!emailId || !password) {
      return res.status(400).json({ success: false, error: "emailId and password are required" });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const ok = await user.isPasswordCorrect(password);
    if (!ok) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    return res.json({ success: true, data: { _id: user._id, username: user.username, emailId: user.emailId } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* --------- UPDATE USER PROFILE --------- */
router.put("/me", async (req, res) => {
  try {
    const { userId, username, emailId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID required" });
    }

    const update = {};
    if (username !== undefined) update.username = username;
    if (emailId !== undefined) update.emailId = cleanEmail(emailId);

    const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/* --------- GET LOGGED-IN USER --------- */
router.get("/me", async (req, res) => {
  try {
    let { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("USER /me ERROR:", err);
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
});

export default router;
