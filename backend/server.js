const express = require('express');
const cors = require('cors');
// Dynamic import for node-fetch (CommonJS)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// DeepThought Role Simulation - Trinethra Module
app.post('/analyze', async (req, res) => {
    const { transcript } = req.body;

    // GUARDRAIL 1: Input Validation (Guideline #3)
    if (!transcript || transcript.trim().length < 50) {
        return res.status(400).json({ 
            error: "Transcript is too short. Please provide a detailed supervisor conversation for diagnostic mapping." 
        });
    }

    // SYSTEM PROMPT: Forces AI to use specific DT KPIs and Rubric logic
    const systemPrompt = `
    You are the Trinethra AI Module, a diagnostic tool for DeepThought psychology interns.
    Analyze the provided supervisor transcript based on the "Fellow" model.

    INSTRUCTIONS:
    1. EXTRACT EVIDENCE: Identify 3-5 specific quotes. Tag as sentiment: 'positive' or 'negative'.
    2. KPI MAPPING: Explicitly map findings to ONLY these 8 KPIs:
       - Lead Generation (Finding new customers)
       - Lead Conversion (Closing leads)
       - Upselling (Increasing order size)
       - Cross-selling (Additional products)
       - NPS (Customer satisfaction)
       - PAT (Profitability/Waste reduction)
       - TAT (Turnaround time/Speed)
       - Quality (Defect/Rejection rates)
    3. SCORING: Suggest a 1-10 score based on the behavioral rubric.
    4. GAP DETECTION: Reasoning about absence - what crucial info did the supervisor NOT mention?
    5. FOLLOW-UP: 3-5 tactical questions for the intern's next call to fill detected gaps.

    STRICT OUTPUT FORMAT: Return ONLY a valid JSON object. No conversational filler.
    {
      "evidence": [{"quote": "string", "sentiment": "positive|negative"}],
      "score": number,
      "justification": "string",
      "kpis": ["string"],
      "gaps": ["string"],
      "followUp": ["string"]
    }`;

    try {
        // Calling local Ollama API
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2', // Your 2.0 GB pulled model
                prompt: `${systemPrompt}\n\nTranscript: ${transcript}`,
                stream: false,
                format: 'json' // Challenge 2: Ensuring Structured Output Reliability
            })
        });

        if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);

        const data = await response.json();
        
        // GUARDRAIL 2: Parsing & Validation
        const finalAnalysis = JSON.parse(data.response);
        
        // Final response to Frontend
        res.json(finalAnalysis);

    } catch (error) {
        console.error("Trinethra Engine Error:", error);
        res.status(500).json({ 
            error: "The AI module failed to process. Ensure Ollama is running ('ollama serve') and llama3.2 is pulled." 
        });
    }
});

app.listen(PORT, () => {
    console.log('--- Trinethra Diagnostic Engine ---');
    console.log(`[${new Date().toISOString()}] INFO: Server initialized on port ${PORT}`);
    console.log(`[STATUS]: System operational. Ready for local inference.`);
});