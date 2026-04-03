# API Integration Patterns - Resume Analyzer

## API Helper Functions (For Reference)

The component uses the `api` client from `lib/api.ts`. Below are the exact API calls being made:

```typescript
// ============================================
// 1. TEXT EXTRACTION (No AI Processing)
// ============================================

// Called on file upload
const onFile = async (file: File) => {
  const fd = new FormData();
  fd.append("resume", file);
  
  const response = await api.post("/ai/resume/extract", fd);
  // Response: { extractedText: string, _meta: { sourceFile, charCount } }
};

// ============================================
// 2. MATCH ANALYSIS (With Validation)
// ============================================

// Called only when "Analyze Match" button clicked
const handleAnalyzeMatch = async () => {
  // Step 1: VALIDATE INPUTS
  if (resumeText.trim().length < 40) {
    toast.error("Resume text must be at least 40 characters");
    return;
  }
  
  if (jobDescription.trim().length < 40) {
    toast.error("Job description must be at least 40 characters");
    return;
  }
  
  // Step 2: PREPARE PAYLOAD
  const payload = {
    resumeText: resumeText.trim(),
    jobDescription: jobDescription.trim()
  };
  
  // Step 3: CALL API
  const response = await api.post("/ai/resume/match", payload);
  
  // Step 4: HANDLE RESPONSE
  // Response structure:
  // {
  //   matchPercentage: number (0-100),
  //   missingSkills: string[],
  //   keywordGaps: string[],
  //   recommendations: string[]
  // }
};
```

---

## Backend API Endpoints

### 1. Text Extraction Endpoint
```
POST /api/ai/resume/extract

Headers:
  Authorization: Bearer {token}
  Content-Type: multipart/form-data

Body:
  resume: File (PDF or DOCX)

Response (200 OK):
{
  "extractedText": "...",
  "_meta": {
    "sourceFile": "resume.pdf",
    "charCount": 5234
  }
}

Errors:
  400: No file uploaded / File too small / Invalid file type
  401: Unauthorized
```

### 2. Match Analysis Endpoint
```
POST /api/ai/resume/match

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "resumeText": "...",
  "jobDescription": "..."
}

Response (200 OK):
{
  "matchPercentage": 75,
  "missingSkills": ["React", "TypeScript"],
  "keywordGaps": ["5+ years"],
  "recommendations": ["..." ]
}

Errors:
  400: Resume text < 40 chars / Job description < 40 chars / Invalid input
  401: Unauthorized
  500: AI API error
```

---

## State Management

```typescript
// Component State
const [resumeText, setResumeText] = useState("");           // Textarea content
const [jobDescription, setJobDescription] = useState("");   // Textarea content
const [match, setMatch] = useState<Record<string, unknown> | null>(null); // API Response
const [busy, setBusy] = useState<"extract" | "match" | null>(null);        // Loading state

// Computed State
const canAnalyze = resumeText.trim().length >= 40 && jobDescription.trim().length >= 40;
```

---

## Error Handling Pattern

```typescript
try {
  // API call
  const { data } = await api.post(endpoint, payload);
  
  // Success
  setMatch(data);
  toast.success("Success message");
  
} catch (e: any) {
  // Extract error message from multiple sources
  const msg = 
    e?.response?.data?.message ||  // Backend validation error
    e?.message ||                   // Network error
    "Default error message";
  
  // Log for debugging
  console.error("[ResumeAnalyzer] Error details:", msg, e?.response?.data);
  
  // Show to user
  toast.error(msg);
  
} finally {
  // Always clear loading state
  setBusy(null);
}
```

---

## Loading States

```typescript
// While extracting text
{busy === "extract" && <Loader2 className="animate-spin" />}

// While analyzing match
{busy === "match" && <Loader2 className="animate-spin" />}

// Button disabled while loading
disabled={busy === "match" || !canAnalyze}
```

---

## Console Logging Pattern

Every major operation logs to console with [ResumeAnalyzer] prefix:

```javascript
// File upload
console.log("[ResumeAnalyzer] Extracting text from file:", file.name);
console.log("[ResumeAnalyzer] Text extracted successfully:", data._meta);

// Match analysis
console.log("[ResumeAnalyzer] Analyze Match clicked");
console.log("[ResumeAnalyzer] Resume text length:", resumeText.length);
console.log("[ResumeAnalyzer] Job description length:", jobDescription.length);
console.log("[ResumeAnalyzer] Calling match API...");
console.log("[ResumeAnalyzer] Match API response:", data);

// Errors
console.warn("[ResumeAnalyzer] Validation failed:", errMsg);
console.error("[ResumeAnalyzer] File extraction error:", msg);
console.error("[ResumeAnalyzer] Match API error:", msg, e?.response?.data);
```

---

## Testing API Responses

### Mock Extract Response
```typescript
const mockExtractResponse = {
  extractedText: `
    John Doe
    Full Stack Developer
    
    Skills:
    - React, TypeScript, Node.js
    - PostgreSQL, MongoDB
    - AWS, Docker
    
    Experience:
    5+ years in software development...
  `,
  _meta: {
    sourceFile: "john_doe_resume.pdf",
    charCount: 2500
  }
};
```

### Mock Match Response
```typescript
const mockMatchResponse = {
  matchPercentage: 82,
  missingSkills: [
    "GraphQL",
    "Kubernetes",
    "Terraform"
  ],
  keywordGaps: [
    "10+ years experience",
    "Team lead experience"
  ],
  recommendations: [
    "Add GraphQL projects to portfolio",
    "Highlight any infrastructure work",
    "Consider taking a Kubernetes course"
  ]
};
```

---

## How to Test Locally

1. **Open Console** (F12 → Console tab)
2. **Upload Resume** - Watch logs in console
3. **Type Job Description** - No API calls should happen
4. **Click "Analyze Match"** - Watch API request/response in Network tab
5. **Check Results** - Verify all fields display

Console should show:
```
[ResumeAnalyzer] Extracting text from file: resume.pdf
[ResumeAnalyzer] Text extracted successfully: {sourceFile: "...", charCount: ...}
[ResumeAnalyzer] Analyze Match clicked
[ResumeAnalyzer] Resume text length: 1245
[ResumeAnalyzer] Job description length: 3421
[ResumeAnalyzer] Calling match API...
[ResumeAnalyzer] Match API response: {matchPercentage: 75, ...}
```

---

## Performance Optimization

✅ **Text Extraction**: Fast operation (ms)  
  - No AI processing  
  - Just file parsing  
  
✅ **Match Analysis**: Slower (sec)  
  - Calls AI API  
  - Only when user clicks button  
  - Can be debounced if needed  

---

## Future Enhancements

- [ ] Add debounce to prevent rapid submissions
- [ ] Cache previous match results
- [ ] Export results as PDF
- [ ] Save match history
- [ ] Compare multiple job descriptions
- [ ] Skill level recommendations (Beginner/Intermediate/Expert)

