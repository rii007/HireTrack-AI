const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    targetRoles: [String],
    skills: [String],
    preferredLocations: [String],
    headline: { type: String, trim: true, maxlength: 200 },
    bio: { type: String, maxlength: 4000 },
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String,
    yearsExperience: { type: Number, min: 0, max: 80 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
