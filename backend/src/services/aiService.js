const { GoogleGenAI } = require("@google/genai");

/**
 * 1. DEFINE THE DATA SCHEMA
 * Forces Gemini to return the exact JSON keys your React dashboard needs.
 */
const ANALYSIS_SCHEMA = {
  type: "OBJECT",
  properties: {
    atsScore: { type: "NUMBER", description: "Score from 0-100" },
    extractedSkills: { type: "ARRAY", items: { type: "STRING" } },
    missingKeywords: { type: "ARRAY", items: { type: "STRING" } },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    weakAreas: { type: "ARRAY", items: { type: "STRING" } },
    suggestions: { type: "ARRAY", items: { type: "STRING" } },
    summary: { type: "STRING", description: "Professional 2-sentence overview" }
  },
  required: ["atsScore", "extractedSkills", "summary", "missingKeywords"]
};

/**
 * 2. INITIALIZE CLIENT
 */
function getGeminiClient() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ API Key missing. Set GOOGLE_API_KEY in your .env file.");
    return null;
  }
  // Initialize the unified GenAI client
  return new GoogleGenAI({ apiKey });
}

/**
 * 3. CORE AI SERVICE logic
 */
exports.askJson = async (userContent, systemInstructions) => {
  const geminiClient = getGeminiClient();
  if (!geminiClient) return { error: "Configuration Error" };

  const prompt = `${systemInstructions}\n\nRESUME CONTENT:\n${userContent}`;

  try {
    /** * COMPATIBILITY FIX: Handles both 'client.generateContent' and 
     * 'client.models.generateContent' to resolve the "is not a function" error.
     */
    const callMethod = geminiClient.models?.generateContent 
      ? geminiClient.models.generateContent.bind(geminiClient.models)
      : geminiClient.generateContent.bind(geminiClient);

    const preferredModels = [
      process.env.GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-3.1-pro-preview",
      "gemini-2.5-pro",
      "gemini-2.0-flash"
    ].filter(Boolean);

    let response;
    let lastError;

    for (const candidate of preferredModels) {
      console.info(`⏳ Trying Gemini model: ${candidate}`);
      try {
        response = await callMethod({
          model: candidate,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            temperature: 0.1,
            maxOutputTokens: 2000,
            response_mime_type: "application/json",
            response_json_schema: ANALYSIS_SCHEMA,
          },
        });

        if (response) {
          console.info(`✅ Gemini model succeeded: ${candidate}`);
          break;
        }
      } catch (error) {
        lastError = error;
        const msg = error?.message || "";
        console.warn(`⚠️ Model ${candidate} failed:`, msg);

        
        if (/NOT_FOUND|404|UNAVAILABLE|503/.test(msg)) {
          const delayMs = 1200;
          console.info(`⏱️ Waiting ${delayMs}ms before trying next model fallback...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        
        throw error;
      }
    }

    if (!response) {
      throw lastError || new Error("No response from Gemini model candidates");
    }

    const text = response?.text || response?.candidates?.[0]?.content || "";
    if (!text) {
      throw new Error("Gemini response did not include text.");
    }

    const normalized = text.toString().trim();

    // Handle markdown fenced JSON:
    // ```json
    // {...}
    // ```
    let jsonPayload = normalized;
    const fencedMatch = normalized.match(/```(?:json)?\n([\s\S]*?)\n```/i);
    if (fencedMatch && fencedMatch[1]) {
      jsonPayload = fencedMatch[1].trim();
    } else {
      jsonPayload = jsonPayload.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    }

    // If not strict JSON, try to auto-correct common cases.
    const bracketStart = jsonPayload.indexOf("{");
    const bracketEnd = jsonPayload.lastIndexOf("}");
    if (bracketStart >= 0 && bracketEnd > bracketStart) {
      jsonPayload = jsonPayload.slice(bracketStart, bracketEnd + 1);
    }

    try {
      return JSON.parse(jsonPayload);
    } catch (parseErr) {
      console.warn("⚠️ JSON parse failed, attempting field extraction fallback.", parseErr.message);
      console.debug("Raw response text:", normalized);

      // Best-effort field extraction from text
      const extracted = {
        atsScore: 0,
        extractedSkills: [],
        missingKeywords: [],
        strengths: [],
        weakAreas: [],
        suggestions: [],
        summary: ""
      };

      // Try to extract atsScore
      const scoreMatch = normalized.match(/"atsScore"\s*:\s*(\d+)/i) || normalized.match(/ats[_\s]*score[:\s]+(\d+)/i);
      if (scoreMatch) extracted.atsScore = parseInt(scoreMatch[1], 10);

      // Try to extract summary
      const summaryMatch = normalized.match(/"summary"\s*:\s*"([^"]+)"/i) || normalized.match(/summary[:\s]+([^.,\n]+)/i);
      if (summaryMatch) extracted.summary = summaryMatch[1].trim();

      // Try to extract skills
      const skillsMatch = normalized.match(/"extractedSkills"\s*:\s*\[(.*?)\]/is);
      if (skillsMatch) {
        try {
          const parsed = JSON.parse("[" + skillsMatch[1] + "]");
          extracted.extractedSkills = parsed.filter(s => typeof s === "string");
        } catch {
          // fallback: split by comma
          const items = skillsMatch[1].split(/[,;]/).map(s => s.replace(/["\s]/g, "").trim()).filter(Boolean);
          extracted.extractedSkills = items.slice(0, 10);
        }
      }

      // Try to extract missing keywords
      const keywordsMatch = normalized.match(/"missingKeywords"\s*:\s*\[(.*?)\]/is);
      if (keywordsMatch) {
        try {
          const parsed = JSON.parse("[" + keywordsMatch[1] + "]");
          extracted.missingKeywords = parsed.filter(s => typeof s === "string");
        } catch {
          const items = keywordsMatch[1].split(/[,;]/).map(s => s.replace(/["\s]/g, "").trim()).filter(Boolean);
          extracted.missingKeywords = items.slice(0, 10);
        }
      }

      // Provide smart fallback message
      if (!extracted.summary) {
        extracted.summary = extracted.atsScore > 0 
          ? `Resume analysis resulted in a score of ${extracted.atsScore}/100.`
          : "Resume analysis completed. Please review the extracted details.";
      }

      if (extracted.extractedSkills.length === 0 && extracted.atsScore === 0) {
        // Nothing extracted, full fallback
        extracted.suggestions = ["Try uploading your resume again.", "Ensure the file is a valid PDF or DOCX."];
      } else {
        extracted.suggestions = ["Review the analysis above.", "Use the Job Match tool to compare with roles."];
      }

      return extracted;
    }

  } catch (err) {
    console.error("🚨 Gemini Service Error:", err.message);
    
    // Fallback object to prevent frontend crashes
    return {
      note: `Service Error: ${err.message}`,
      atsScore: 0,
      extractedSkills: [],
      missingKeywords: [],
      summary: "AI analysis is currently unavailable. Please check your API key status.",
      suggestions: ["Ensure the 'Generative Language API' is enabled in Google Cloud Console."]
    };
  }
};