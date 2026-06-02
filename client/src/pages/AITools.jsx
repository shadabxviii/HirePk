import React, { useState } from "react";
import { Bot, Sparkles, FileText, Send, UserCheck, BookOpen, Compass, Clipboard } from "lucide-react";
import { reviewResumeText, generateCoverLetterText, analyzeSkillsGapReport, generatePrepMaterials } from "../services/aiService";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import PublicLayout from "../components/templates/PublicLayout";

const TOOLS = [
  { id: "resume", name: "AI Resume Auditor", icon: <FileText className="w-5 h-5 text-indigo-500" />, desc: "Get structural ATS feedback for your CV." },
  { id: "cover", name: "AI Cover Letter Writer", icon: <Bot className="w-5 h-5 text-emerald-500" />, desc: "Generate professional letters for applications." },
  { id: "skills", name: "AI Skills Gap Analyzer", icon: <Compass className="w-5 h-5 text-violet-500" />, desc: "Check missing skills for target roles." },
  { id: "prep", name: "AI Interview Prep", icon: <UserCheck className="w-5 h-5 text-amber-500" />, desc: "Generate likely interview Q&A with tips." }
];

const AITools = () => {
  const [activeTool, setActiveTool] = useState("resume");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Form input states
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [jobRole, setJobRole] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToolSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult("");

    try {
      if (activeTool === "resume") {
        const response = await reviewResumeText(resumeText);
        setResult(response.feedback);
      } else if (activeTool === "cover") {
        const response = await generateCoverLetterText(jobDescription, resumeText || "General Candidate profile");
        setResult(response.coverLetter);
      } else if (activeTool === "skills") {
        const response = await analyzeSkillsGapReport(skillsText, targetIndustry);
        setResult(response.skillsGapReport);
      } else if (activeTool === "prep") {
        const response = await generatePrepMaterials(jobRole, jobDescription);
        setResult(response.prepMaterial);
      }
    } catch (err) {
      console.error(err);
      setResult(`Error generating response: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic renderer function to convert markdown text into clean styled html blocks
  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        return <h4 key={idx} className="text-sm font-bold text-slate-800 mt-4 mb-2">{trimmed.replace(/###/g, "").trim()}</h4>;
      }
      if (trimmed.startsWith("##")) {
        return <h3 key={idx} className="text-base font-bold text-slate-800 mt-5 mb-2.5 border-b border-slate-100 pb-1">{trimmed.replace(/##/g, "").trim()}</h3>;
      }
      if (trimmed.startsWith("#")) {
        return <h2 key={idx} className="text-lg font-bold text-indigo-700 mt-6 mb-3">{trimmed.replace(/#/g, "").trim()}</h2>;
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return <li key={idx} className="text-xs text-slate-600 ml-4 list-disc my-1 leading-relaxed">{trimmed.substring(1).trim()}</li>;
      }
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs text-slate-600 leading-relaxed mb-1.5">{line}</p>;
    });
  };

  return (
    <PublicLayout>
      <div className="flex flex-col gap-4">
        {/* Banner */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">
            <Bot className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              Groq AI Playground
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Automated recruitment tools powered by LLaMA 3 8B model</p>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-6 animate-fade-in">
          {/* Tool tab select list */}
          <div className="flex flex-col gap-3">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTool(t.id);
                  setResult("");
                }}
                className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer hover:shadow-sm ${
                  activeTool === t.id
                    ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                    : "border-slate-100 bg-white/60 hover:bg-slate-50"
                }`}
              >
                <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm flex-shrink-0">
                  {t.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{t.name}</h3>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Form & Result display column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <form onSubmit={handleToolSubmit} className="flex flex-col gap-4">
                {/* Dynamically render inputs based on selected tab */}
                {activeTool === "resume" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paste Resume CV text</label>
                    <textarea
                      rows={8}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste structural details of your resume (experience, education, skills)..."
                      className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400 leading-relaxed"
                      required
                    />
                  </div>
                )}

                {activeTool === "cover" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Description</label>
                      <textarea
                        rows={5}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste details of the target job listing..."
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Profile/Resume details (optional)</label>
                      <textarea
                        rows={4}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste highlights of your profile or leave blank for a general letter..."
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                      />
                    </div>
                  </>
                )}

                {activeTool === "skills" && (
                  <>
                    <Input
                      label="Your Current Skills"
                      type="text"
                      placeholder="e.g. React.js, Node.js, Git, HTML, Excel"
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      required
                    />
                    <Input
                      label="Target Industry / Role"
                      type="text"
                      placeholder="e.g. MERN Stack Developer, Digital Marketer"
                      value={targetIndustry}
                      onChange={(e) => setTargetIndustry(e.target.value)}
                      required
                    />
                  </>
                )}

                {activeTool === "prep" && (
                  <>
                    <Input
                      label="Target Job Role"
                      type="text"
                      placeholder="e.g. Graphic Designer, Frontend Intern"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      required
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Description details (optional)</label>
                      <textarea
                        rows={4}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste details to get more specific technical interview questions..."
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="font-semibold gap-2 self-start px-6 rounded-xl mt-2"
                >
                  Generate AI Analysis <Sparkles className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Results display panel */}
            {(isLoading || result) && (
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <Bot className="w-4.5 h-4.5 text-emerald-500" />
                    Groq Engine Output
                  </h3>
                  {result && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      icon={<Clipboard className="w-3.5 h-3.5" />}
                    >
                      {isCopied ? "Copied!" : "Copy text"}
                    </Button>
                  )}
                </div>

                <div className="min-h-[150px] flex flex-col">
                  {isLoading ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-3 py-10">
                      <Spinner size="md" />
                      <span className="text-slate-400 text-xs font-semibold animate-pulse">
                        Groq AI is processing your input details...
                      </span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl overflow-x-auto max-h-[500px] overflow-y-auto">
                      {renderMarkdown(result)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default AITools;
export { AITools };
