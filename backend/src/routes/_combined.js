const express = require("express");
const { protect } = require("../middleware/auth");
const jobs = require("../controllers/jobController");
const analytics = require("../controllers/analyticsController");
const profile = require("../controllers/profileController");
const ai = require("../controllers/aiController");

const jobRouter = express.Router();
jobRouter.use(protect);
jobRouter.get("/upcoming-interviews", jobs.upcomingInterviews);
jobRouter.route("/").post(jobs.create).get(jobs.list);
jobRouter.patch("/:id", jobs.update);
jobRouter.delete("/:id", jobs.remove);
jobRouter.post("/:id/duplicate", jobs.duplicate);
module.exports.jobRouter = jobRouter;

const analyticsRouter = express.Router();
analyticsRouter.get("/", protect, analytics.get);
module.exports.analyticsRouter = analyticsRouter;

const profileRouter = express.Router();
profileRouter.route("/").get(protect, profile.get).patch(protect, profile.update);
module.exports.profileRouter = profileRouter;

const aiRouter = express.Router();
aiRouter.use(protect);
aiRouter.post("/resume/extract", ai.upload, ai.extractResume);
aiRouter.post("/resume/analyze", ai.upload, ai.analyzeResume);
aiRouter.post("/resume/match", ai.match);
aiRouter.post("/interview-prep", ai.interviewPrep);
module.exports.aiRouter = aiRouter;
