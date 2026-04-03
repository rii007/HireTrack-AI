const { z } = require("zod");
const User = require("../models/User");
exports.get = async (req, res) => res.json(req.user);
exports.update = async (req, res) => {
  const optionalUrl = z.union([z.string().url(), z.literal("")]).optional();
  const body = z
    .object({
      name: z.string().min(2).optional(),
      headline: z.string().max(200).optional().or(z.literal("")),
      bio: z.string().max(4000).optional().or(z.literal("")),
      targetRoles: z.array(z.string()).optional(),
      skills: z.array(z.string()).optional(),
      preferredLocations: z.array(z.string()).optional(),
      linkedinUrl: optionalUrl,
      githubUrl: optionalUrl,
      portfolioUrl: optionalUrl,
      yearsExperience: z.coerce.number().min(0).max(80).optional().nullable(),
    })
    .parse(req.body);
  const user = await User.findByIdAndUpdate(req.user._id, body, { new: true }).select("-password");
  res.json(user);
};
