const Job = require("../models/Job");
exports.get = async (req, res) => {
  const user = req.user._id;
  const [total, interviews, offers, rejected] = await Promise.all([
    Job.countDocuments({ user }),
    Job.countDocuments({ user, status: "Interview" }),
    Job.countDocuments({ user, status: "Offer" }),
    Job.countDocuments({ user, status: "Rejected" }),
  ]);
  const byStatus = await Job.aggregate([{ $match: { user } }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
  const perMonth = await Job.aggregate([
    {
      $match: { user },
    },
    {
      $project: {
        monthSource: { $ifNull: ["$dateApplied", "$createdAt"] },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$monthSource" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const map = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  const funnelStages = ["Applied", "Online Assessment", "Interview", "Offer"];
  const funnel = funnelStages.map((name) => ({ name, value: map[name] || 0 }));
  res.json({
    metrics: {
      totalApplications: total,
      interviewsScheduled: interviews,
      offersReceived: offers,
      rejectionCount: rejected,
      successRate: total ? Math.round((offers / total) * 100) : 0,
    },
    byStatus,
    perMonth,
    funnel,
  });
};
