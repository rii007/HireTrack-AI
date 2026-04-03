const multer = require("multer");
const mammoth = require("mammoth");
const { z } = require("zod");
const { askJson } = require("../services/aiService");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 6 * 1024 * 1024 } });
exports.upload = upload.single("resume");

const STOPWORDS = [
  "the", "is", "and", "with", "for", "a", "an", "to", "of", "in", "on", "by",
  "using", "improving", "various", "well", "such", "ability", "required",
  "strong", "good", "excellent", "knowledge", "skills", "experience"
];

const SKILLS = [
  "react", "node", "express", "mongodb", "sql", "javascript", "python",
  "c++", "java", "html", "css", "rest api", "api", "git", "github",
  "data structures", "algorithms", "oop", "dbms", "system design"
];

function normalizeText(text) {
  const words = (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .filter((word) => !STOPWORDS.includes(word));

  return words.join(" ");
}

function extractSkills(text) {
  const normalized = normalizeText(text);
  const deduped = SKILLS.filter((skill) => normalized.includes(skill));
  return deduped.filter((skill) => !STOPWORDS.includes(skill));
}

async function extractPdfText(buffer) {
  try {
    const pdfParseModule = await import("pdf-parse");
    const PDFParse = pdfParseModule.PDFParse;
    if (typeof PDFParse !== "function") {
      throw new Error("pdf-parse module did not expose PDFParse");
    }

    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    await parser.destroy();
    const text = (result && result.text) || "";
    console.log("PDF extraction completed. Characters extracted:", text.length);
    return text;
  } catch (error) {
    console.error("PDF text extraction failed:", error?.message || error);
    return "";
  }
}

async function extractText(file) {
  if (!file || !file.buffer) return "";
  const mime = file.mimetype || "";
  const name = file.originalname || "";

  if (mime.includes("pdf") || name.toLowerCase().endsWith(".pdf")) {
    return (await extractPdfText(file.buffer)).trim();
  }
  if (mime.includes("word") || mime.includes("officedocument") || name.toLowerCase().endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return (value || "").trim();
  }
  try {
    return file.buffer.toString("utf-8").trim();
  } catch {
    return "";
  }
}

// Extract text only, no AI processing
exports.extractResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF or DOCX file." });
    }
    const text = await extractText(req.file);
    console.log("Resume extraction result:", {
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      charCount: text.length,
    });
    if (!text || text.length < 40) {
      return res.status(400).json({
        message:
          "Could not extract enough text from this file. Try another PDF/DOCX, or paste your resume text directly.",
      });
    }
    return res.json({
      extractedText: text.slice(0, 15000),
      _meta: { sourceFile: req.file.originalname, charCount: text.length },
    });
  } catch (err) {
    return next(err);
  }
};

exports.analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF or DOCX file." });
    }
    const text = await extractText(req.file);
    if (!text || text.length < 40) {
      return res.status(400).json({
        message:
          "Could not extract enough text from this file. Try another PDF/DOCX, or paste your resume text in the Job match section below.",
      });
    }
    const data = await askJson(
      `Resume:\n${text.slice(0, 12000)}`,
      "You are an ATS and resume coach. Return strict JSON with keys: extractedSkills (array of strings), atsScore (number 0-100), missingKeywords (array), strengths (array), weakAreas (array), suggestions (array), summary (string)."
    );
    return res.json({
      ...data,
      extractedText: text.slice(0, 15000),
      _meta: { sourceFile: req.file.originalname, charCount: text.length },
    });
  } catch (err) {
    return next(err);
  }
};

exports.match = async (req, res, next) => {
  try {
    const body = z
      .object({
        resumeText: z.string().min(40, "Resume text must be at least 40 characters"),
        jobDescription: z.string().min(40, "Job description must be at least 40 characters"),
      })
      .parse(req.body);
    const resumeSkills = extractSkills(body.resumeText);
    const jdSkills = extractSkills(body.jobDescription);

    console.log("Resume:", body.resumeText);
    console.log("Job Description:", body.jobDescription);
    console.log("Resume Skills:", resumeSkills);
    console.log("JD Skills:", jdSkills);

    const matchedSkills = jdSkills.filter((skill) => resumeSkills.includes(skill));
    const missingSkills = jdSkills.filter((skill) => !resumeSkills.includes(skill));
    const matchScore = jdSkills.length ? Math.round((matchedSkills.length / jdSkills.length) * 100) : 0;
    const suggestions = missingSkills.map((skill) => `Add projects or experience related to ${skill}`);

    return res.json({
      matchScore,
      matchedSkills,
      missingSkills,
      suggestions,
      totalSkills: jdSkills.length,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      const issues = err.issues || err.errors;
      return res.status(400).json({ message: issues?.[0]?.message || "Invalid input" });
    }
    return next(err);
  }
};

exports.interviewPrep = async (req, res, next) => {
  try {
    const body = z.object({ roleOrCompany: z.string().min(2) }).parse(req.body);
    const data = await askJson(
      `Role / company focus: ${body.roleOrCompany}`,
      "Return strict JSON with: commonQuestions (array), behavioralQuestions (array), technicalQuestions (array), prepTips (array)."
    );
    return res.json(data);
  } catch (err) {
    return next(err);
  }
};
