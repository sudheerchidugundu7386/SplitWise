const User = require("../models/User");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "30d",
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide all required fields." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    // Validate email via Abstract API
    let isEmailVerified = false;
    if (process.env.ABSTRACT_API_KEY) {
      try {
        const response = await axios.get(
          `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${email}`
        );
        // "DELIVERABLE" or "UNDELIVERABLE" etc.
        if (response.data.deliverability === "DELIVERABLE") {
          isEmailVerified = true;
        } else if (response.data.deliverability === "UNDELIVERABLE") {
          return res.status(400).json({ error: "Provided email address is invalid or undeliverable." });
        }
      } catch (apiError) {
        console.error("Abstract API error:", apiError.message);
        // Proceed without failing if API is down or key is invalid
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password." });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: "Invalid email or password." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const groups = await Group.find({
      $or: [
        { createdBy: user._id },
        { "members.email": { $regex: new RegExp(`^${user.email}$`, "i") } }
      ]
    });

    const trips = [];

    for (const group of groups) {
      let memberName = "";
      const memberMatch = group.members.find(m => m.email && m.email.toLowerCase() === user.email.toLowerCase());
      if (memberMatch) {
        memberName = memberMatch.name;
      } else if (group.createdBy.toString() === user._id.toString()) {
        memberName = group.members.length > 0 ? group.members[0].name : user.name;
      }

      const expenses = await Expense.find({ groupId: group.groupId });
      let netBalance = 0;

      expenses.forEach((expense) => {
        if (expense.paidBy === memberName) {
          netBalance += expense.amount;
        }
        const split = expense.splits.find(s => s.member === memberName);
        if (split) {
          netBalance -= split.amount;
        }
      });

      trips.push({
        groupId: group.groupId,
        name: group.name,
        netBalance: Math.round(netBalance * 100) / 100,
        isSettled: group.isSettled
      });
    }

    res.json({
      user,
      trips
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
