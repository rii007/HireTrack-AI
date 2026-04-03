const { z } = require("zod");
const Job = require("../models/Job");

const schema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["Applied", "Online Assessment", "Interview", "Offer", "Rejected"]).optional(),
  salary: z.coerce.number().optional(),
  postingUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  dateApplied: z.string().optional(),
  interviewDate: z.string().optional(),
});

exports.create = async (req, res) => {
  const body = schema.parse(req.body);
  const job = await Job.create({
    ...body,
    dateApplied: body.dateApplied ? new Date(body.dateApplied) : new Date(),
    user: req.user._id,
    lastStatusUpdateAt: new Date(),
  });
  res.status(201).json(job);
};

exports.list = async (req, res) => {
  const { search = "", status, location, page = 1, limit = 20, sortBy = "updatedAt", order = "desc" } = req.query;
  const q = {
    user: req.user._id,
    ...(status ? { status } : {}),
    ...(location ? { location: { $regex: location, $options: "i" } } : {}),
    ...(search ? { $or: [{ company: { $regex: search, $options: "i" } }, { role: { $regex: search, $options: "i" } }] } : {}),
  };
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Job.find(q).sort({ [sortBy]: order === "asc" ? 1 : -1 }).skip(skip).limit(Number(limit)),
    Job.countDocuments(q),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

exports.update = async (req, res) => {
  const body = schema.partial().parse(req.body);
  if (body.status) body.lastStatusUpdateAt = new Date();
  const item = await Job.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, body, { new: true });
  if (!item) return res.status(404).json({ message: "Job not found" });
  res.json(item);
};

exports.remove = async (req, res) => {
  const item = await Job.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) return res.status(404).json({ message: "Job not found" });
  res.json({ message: "Deleted" });
};

exports.duplicate = async (req, res) => {
  const item = await Job.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) return res.status(404).json({ message: "Job not found" });
  const clone = await Job.create({ ...item.toObject(), _id: undefined, createdAt: undefined, updatedAt: undefined, status: "Applied" });
  res.status(201).json(clone);
};

exports.upcomingInterviews = async (req, res) => {
  const now = new Date();
  const items = await Job.find({
    user: req.user._id,
    interviewDate: { $gte: now },
    status: "Interview",
  })
    .sort({ interviewDate: 1 })
    .limit(12)
    .select("company role interviewDate location status updatedAt");
  res.json({ items });
};
