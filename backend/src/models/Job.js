const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true, index: true },
    role: { type: String, required: true, index: true },
    description: String,
    location: { type: String, index: true },
    status: {
      type: String,
      enum: ["Applied", "Online Assessment", "Interview", "Offer", "Rejected"],
      default: "Applied",
      index: true,
    },
    salary: Number,
    postingUrl: String,
    notes: String,
    dateApplied: { type: Date, default: Date.now, index: true },
    interviewDate: Date,
    lastStatusUpdateAt: Date,
  },
  { timestamps: true }
);
jobSchema.index({ user: 1, status: 1, dateApplied: -1 });
module.exports = mongoose.model("Job", jobSchema);
