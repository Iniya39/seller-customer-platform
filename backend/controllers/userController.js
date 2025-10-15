import User from "../models/userModel.js";

// Register new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const newUser = await User.create({ name, email, password, role: "seller" });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(404).json({ error: "Invalid credentials" });

    res.json({ token: "dummy-token", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
