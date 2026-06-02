import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Bot, AlertCircle, PlusCircle, Check } from "lucide-react";
import { createJob } from "../services/jobService";
import { writeJobDescriptionDraft } from "../services/aiService";
import Input from "../components/atoms/Input";
import Button from "../components/atoms/Button";
import PublicLayout from "../components/templates/PublicLayout";

const CATEGORIES = ["IT", "Finance", "Marketing", "Design", "HR", "Sales", "Engineering", "Other"];
const TYPES = ["full-time", "part-time", "internship", "remote", "contract"];
const EXPERIENCES = ["entry", "mid", "senior"];

const PostJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("IT");
  const [type, setType] = useState("full-time");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  // AI JD Generation state
  const [isGeneratingJd, setIsGeneratingJd] = useState(false);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !city) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await createJob({
        title,
        description,
        category,
        type,
        city,
        area,
        minSalary: minSalary ? Number(minSalary) : undefined,
        maxSalary: maxSalary ? Number(maxSalary) : undefined,
        experienceLevel,
        skillsRequired,
        deadline: deadline || undefined
      });
      
      alert("Job vacancy posted successfully!");
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "Failed to post job listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiWriteJd = async () => {
    if (!title) {
      alert("Please enter a Job Title first so the AI knows what to write.");
      return;
    }

    setIsGeneratingJd(true);
    setErrorMsg("");
    try {
      const response = await writeJobDescriptionDraft(
        title, 
        "Our Company", 
        skillsRequired || "Standard requirements for this role"
      );
      setDescription(response.jobDescription);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to draft Job Description using Groq AI.");
    } finally {
      setIsGeneratingJd(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto py-4">
        <div className="glass-panel p-6 md:p-8 border border-slate-100 rounded-3xl shadow-xl animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Post a Vacancy</h2>
              <p className="text-xs text-slate-400 mt-1">Advertise jobs & internships for candidates in Pakistan</p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold px-4 py-2.5 rounded-xl text-center mb-6">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePostSubmit} className="flex flex-col gap-5">
            <Input
              label="Job Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-sm p-3 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-sm p-3 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Karachi"
                required
              />
              <Input
                label="Area / Neighborhood"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Clifton, Gulberg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minimum Salary (PKR / month)"
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="e.g. 50000"
              />
              <Input
                label="Maximum Salary (PKR / month)"
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="e.g. 90000"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-sm p-3 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  {EXPERIENCES.map((exp) => (
                    <option key={exp} value={exp} className="capitalize">{exp} level</option>
                  ))}
                </select>
              </div>
              
              <Input
                label="Application Deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <Input
              label="Key Skills Required (comma separated)"
              value={skillsRequired}
              onChange={(e) => setSkillsRequired(e.target.value)}
              placeholder="e.g. React, JavaScript, CSS, REST APIs"
            />

            {/* Description Textarea & AI Writer */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Description *</label>
                <button
                  type="button"
                  disabled={isGeneratingJd}
                  onClick={handleAiWriteJd}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-500" />
                  {isGeneratingJd ? "AI Writing JD..." : "AI Auto-Write JD"}
                </button>
              </div>
              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe responsibilities, expectations, perks, and key deliverables..."
                className="w-full bg-white border border-slate-200 text-slate-800 text-sm p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
                required
              />
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="font-semibold w-full rounded-xl py-3 mt-3 gap-2"
            >
              Post Job Listing <PlusCircle className="w-4.5 h-4.5" />
            </Button>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PostJob;
export { PostJob };
