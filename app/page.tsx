'use client';

import { useState } from 'react';
import AIAuditPanel from '@/components/AIAuditPanel';
import PdfExporter from '@/components/PdfExporter';

const defaultResumeData = {
  name: "Prateek Paul",
  title: "Project Manager / Technical Product Manager",
  work_experience: [
    {
      company: "BrickRed Systems",
      title: "Project Manager",
      bullets: [
        "Managed cross-functional development teams delivering custom web applications under tight deadlines.",
        "Ran daily Agile standups and sprint planning sessions to keep project delivery on track."
      ]
    },
    {
      company: "Directful",
      title: "Product Manager Intern",
      bullets: [
        "Analyzed user metrics and feedback to prioritize key features for upcoming product releases.",
        "Collaborated with engineering to scope out feature requirements and manage Jira sprint backlogs."
      ]
    }
  ]
};

export default function Home() {
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [auditData, setAuditData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeData),
      });
      const data = await res.json();
      setAuditData(data);
    } catch (err) {
      console.error("Audit failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });
      const parsed = await res.json();
      if (parsed.work_experience) {
        setResumeData(parsed);
      }
    } catch (err) {
      console.error("PDF upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const applyRewrite = (expIndex: number, bulletIndex: number, newText: string) => {
    setResumeData((prevData) => {
      const updatedExperience = JSON.parse(JSON.stringify(prevData.work_experience));
      if (updatedExperience[expIndex] && updatedExperience[expIndex].bullets) {
        updatedExperience[expIndex].bullets[bulletIndex] = newText;
      }
      return {
        ...prevData,
        work_experience: updatedExperience,
      };
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header & Upload Bar */}
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">PM AI Resume Editor</h1>
            <p className="text-xs text-gray-500">Upload your PDF resume, refine with AI, and export clean PDF</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition">
              {isUploading ? 'Parsing PDF...' : 'Upload PDF Resume'}
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Live Editor */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Live Editor</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">Full Name</label>
                <input
                  type="text"
                  value={resumeData.name || ''}
                  onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
                  className="w-full p-2 text-xs border rounded-md"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Title</label>
                <input
                  type="text"
                  value={resumeData.title || ''}
                  onChange={(e) => setResumeData({...resumeData, title: e.target.value})}
                  className="w-full p-2 text-xs border rounded-md"
                />
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase">Work Experience</h3>
                {resumeData.work_experience?.map((exp: any, expIdx: number) => (
                  <div key={expIdx} className="p-3 bg-slate-50 border rounded-lg space-y-2">
                    <div className="font-bold text-xs text-gray-800">{exp.company} — {exp.title}</div>
                    
                    {exp.bullets?.map((bullet: string, bIdx: number) => (
                      <textarea
                        key={bIdx}
                        value={bullet}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResumeData((prev) => {
                            const updated = JSON.parse(JSON.stringify(prev.work_experience));
                            updated[expIdx].bullets[bIdx] = val;
                            return { ...prev, work_experience: updated };
                          });
                        }}
                        className="w-full p-2 text-xs border rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                        rows={2}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: AI Audit Panel */}
          <div>
            <AIAuditPanel
              auditData={auditData}
              isLoading={isLoading}
              onRunAudit={runAudit}
              onApplyRewrite={applyRewrite}
              resumeData={resumeData}
            />
          </div>

          {/* Column 3: PRTK Modern Dashboard Preview & Exporter */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <PdfExporter resumeData={resumeData} auditData={auditData} />
          </div>
        </div>
      </div>
    </main>
  );
}
