const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");
const token = require("../utils/token");

exports.signup = async (req, res) => {
  const body = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) }).parse(req.body);
  const exists = await User.findOne({ email: body.email });
  if (exists) return res.status(400).json({ message: "Email already in use" });
  const hash = await bcrypt.hash(body.password, 10);
  const user = await User.create({ ...body, password: hash });
  res.status(201).json({ token: token(user._id), user: { id: user._id, name: user.name, email: user.email } });
};

exports.login = async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
  const user = await User.findOne({ email: body.email });
  if (!user || !(await bcrypt.compare(body.password, user.password))) return res.status(400).json({ message: "Invalid credentials" });
  res.json({ token: token(user._id), user: { id: user._id, name: user.name, email: user.email } });
};

exports.me = async (req, res) => res.json({ user: req.user });
