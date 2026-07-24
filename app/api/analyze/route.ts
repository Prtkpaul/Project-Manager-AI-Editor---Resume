import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const PM_SYSTEM_PROMPT = `
You are an elite Senior Executive Recruiter specializing in Project Managers. 
Analyze the provided resume and respond strictly with a valid JSON object matching this schema EXACTLY:

{
  "pm_scores": {
    "overall_score": 85,
    "metric_density_score": 75,
    "methodology_alignment_score": 90,
    "action_verb_score": 80
  },
  "work_experience": [
    {
      "company": "Company Name",
      "title": "Role Title",
      "bullets": [
        {
          "original_text": "Original bullet text",
          "has_quantified_metric": false,
          "primary_weakness": "Lacks quantitative metrics",
          "rewrites": {
            "efficiency_focus": "Increased velocity by 25% through automated tracking.",
            "budget_or_scale_focus": "Managed $1.2M budget across 12 engineers.",
            "leadership_focus": "Spearheaded cross-functional alignment across 4 departments."
          }
        }
      ]
    }
  ],
  "missing_keywords": ["Agile", "Risk Mitigation", "Sprint Planning"],
  "top_recommendations": [
    "Quantify budget impact on recent project roles.",
    "Add certification details (e.g. PMP or CSM)."
  ]
}
`;

const openai = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function POST(req: Request) {
  try {
    const rawResumeData = await req.json();

    // Strip out heavy base64 strings so they aren't sent to the LLM
    const { originalPdfBase64, ...resumeData } = rawResumeData;

    const response = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: PM_SYSTEM_PROMPT },
        { 
          role: 'user', 
          content: `Analyze and score this Project Management resume JSON:\n${JSON.stringify(resumeData, null, 2)}` 
        }
      ],
      response_format: { type: 'json_object' }
    });

    const rawContent = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(rawContent);

    const normalizedResponse = {
      pm_scores: parsed.pm_scores || parsed.scores || {
        overall_score: 70,
        metric_density_score: 65,
        methodology_alignment_score: 75,
        action_verb_score: 70
      },
      work_experience: parsed.work_experience || parsed.experience || resumeData.work_experience || [],
      missing_keywords: parsed.missing_keywords || parsed.keywords || ["Agile", "Risk Register", "Sprint Planning"],
      top_recommendations: parsed.top_recommendations || parsed.recommendations || ["Add dollar figures to past budgets.", "Highlight team headcount scale."]
    };

    return NextResponse.json(normalizedResponse);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
