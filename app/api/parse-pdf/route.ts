import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdfData = await pdfParse(buffer);
    
    // Convert original PDF buffer to base64 so frontend can pass it to pdf-lib
    const pdfBase64 = buffer.toString('base64');

    const prompt = `
    Extract resume details from this text and return strictly a valid JSON object matching this schema:
    {
      "name": "Full Name",
      "title": "Professional Title",
      "work_experience": [
        {
          "company": "Company Name",
          "title": "Role Title",
          "bullets": ["Bullet 1", "Bullet 2"]
        }
      ]
    }

    Resume Text:
    ${pdfData.text}
    `;

    const response = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const structuredData = JSON.parse(response.choices[0].message.content || '{}');
    
    // Attach original PDF base64 string
    return NextResponse.json({
      ...structuredData,
      originalPdfBase64: pdfBase64
    });

  } catch (error: any) {
    console.error('PDF Parsing Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
