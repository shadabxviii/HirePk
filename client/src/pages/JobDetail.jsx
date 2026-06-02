import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Clock, Briefcase, Building2, Calendar, Eye, Send, FileText, CheckCircle, Sparkles, Bot, AlertTriangle } from "lucide-react";
import { getJobById } from "../services/jobService";
import { applyToJob } from "../services/applicationService";
import { analyzeJobMatchPercent, generateCoverLetterText } from "../services/aiService";
import { useAuthStore } from "../store/authStore";
import Button from "../components/atoms/Button";
import Badge from "../components/atoms/Badge";
import Spinner from "../components/atoms/Spinner";
import PublicLayout from "../components/templates/PublicLayout";

const JobDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Application Form States
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // AI Matching States
  const [isAnalyzingMatch, setIsAnalyzingMatch] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const data = await getJobById(id);
        setJob(data);
        setResumeUrl(user?.profile?.resumeUrl || "");
      } catch (err) {
        console.error("Error loading job details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id, user]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const finalResume = resumeUrl || user?.profile?.resumeUrl;
    if (!finalResume) {
      setErrorMsg("Please upload a resume or add it to your profile first.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await applyToJob({
        jobId: job._id,
        coverLetter,
        resumeUrl: finalResume
      });
      setHasApplied(true);
      setTimeout(() => {
        setShowApplyModal(false);
      }, 1550);
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyzeMatch = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to analyze job compatibility.");
      return;
    }

    if (!user?.profile?.resumeUrl && !user?.profile?.bio && (!user?.profile?.skills || user?.profile?.skills.length === 0)) {
      alert("Please add skills or resume in your Profile first so the AI can compare.");
      return;
    }

    setIsAnalyzingMatch(true);
    setMatchResult(null);

    try {
      const skillsStr = user.profile.skills ? user.profile.skills.join(", ") : "";
      const profileText = `
        Name: ${user.name}
        Headline: ${user.profile.headline || ""}
        Skills: ${skillsStr}
        Bio: ${user.profile.bio || ""}
      `;
      
      const analysis = await analyzeJobMatchPercent(
        profileText, 
        `Role: ${job.title}\nRequirements: ${job.skillsRequired?.join(", ")}\nDescription: ${job.description}`
      );
      setMatchResult(analysis);
    } catch (error) {
      console.error("Match analysis failed:", error);
      alert("AI matching analysis failed. Please try again.");
    } finally {
      setIsAnalyzingMatch(false);
    }
  };

  const handleAiWriteCoverLetter = async () => {
    setIsGeneratingCoverLetter(true);
    setErrorMsg("");
    try {
      const skillsStr = user.profile.skills ? user.profile.skills.join(", ") : "";
      const profileText = `
        Name: ${user.name}
        Headline: ${user.profile.headline || ""}
        Skills: ${skillsStr}
        Bio: ${user.profile.bio || ""}
      `;
      const response = await generateCoverLetterText(job.description, profileText);
      setCoverLetter(response.coverLetter);
    } catch (error) {
      console.error("AI Cover Letter generation failed:", error);
      setErrorMsg("Failed to generate Cover Letter via AI.");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Spinner size="lg" />
          <span className="text-slate-400 text-sm font-semibold">Loading job listing details...</span>
        </div>
      </PublicLayout>
    );
  }

  if (!job) {
    return (
      <PublicLayout>
        <div className="text-center py-20 text-slate-500 glass-panel border border-slate-100 rounded-2xl max-w-lg mx-auto">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Job Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">This listing may have been closed or removed.</p>
          <Link to="/jobs">
            <Button className="mt-6" variant="outline">Back to search</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Header Panel */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100/80 pb-6 mb-6">
              <div className="flex gap-4 items-center">
                {job.company?.logo ? (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center font-bold text-indigo-700 text-2xl">
                    {job.company?.name ? job.company.name.charAt(0) : "J"}
                  </div>
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
                    {job.title}
                  </h1>
                  <p className="text-indigo-600 text-xs font-semibold mt-1">
                    {job.company?.name} &bull; {job.company?.industry || "Tech Company"}
                  </p>
                </div>
              </div>

              {isAuthenticated && user?.role === "jobseeker" && (
                <Button 
                  onClick={() => setShowApplyModal(true)} 
                  disabled={hasApplied}
                  className="w-full md:w-auto px-6 py-2.5 rounded-xl font-semibold shadow-md gap-2"
                >
                  {hasApplied ? "Applied!" : "Apply to Job"} <Send className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100/50 px-3 py-1.5 rounded-xl">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{job.location?.city} {job.location?.area ? `(${job.location.area})` : ""}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100/50 px-3 py-1.5 rounded-xl">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="capitalize">{job.type}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100/50 px-3 py-1.5 rounded-xl">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{job.category}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100/50 px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Posted {new Date(job.createdAt).toLocaleDateString("en-PK")}</span>
              </div>
            </div>
          </div>

          {/* Description Panel */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-indigo-600 pl-3">
                Job Description
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill, idx) => (
                    <Badge key={idx} variant="default" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info/AI Tools Panel */}
        <div className="flex flex-col gap-6">
          {/* Quick Metrics */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-slate-800 text-base">Overview</h3>
            <div className="flex justify-between py-2.5 border-b border-slate-100 text-xs">
              <span className="text-slate-400 font-semibold">Salary Range</span>
              <span className="font-bold text-slate-700">
                {job.salary?.min ? `PKR ${job.salary.min.toLocaleString()} - ${job.salary.max?.toLocaleString()}` : "Negotiable"}
              </span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-slate-100 text-xs">
              <span className="text-slate-400 font-semibold">Experience Needed</span>
              <span className="font-bold text-slate-700 capitalize">{job.experienceLevel} Level</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-slate-100 text-xs">
              <span className="text-slate-400 font-semibold">Applicants</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                {job.applicantsCount} Applied
              </span>
            </div>
            <div className="flex justify-between py-2.5 text-xs items-center">
              <span className="text-slate-400 font-semibold">Views</span>
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <Eye className="w-4 h-4 text-slate-400" /> {job.views || 0}
              </span>
            </div>
          </div>

          {/* AI Match analyzer panel */}
          {isAuthenticated && user?.role === "jobseeker" && (
            <div className="glass-panel p-6 rounded-3xl border border-emerald-100 bg-emerald-50/10 shadow-sm flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-emerald-600/10 pointer-events-none">
                <Bot className="w-20 h-20" />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                  AI Match Score
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Compare your profile directly with job requirements</p>
              </div>

              {matchResult ? (
                <div className="flex flex-col gap-4 mt-2 animate-fade-in">
                  <div className="flex items-center gap-4 bg-white border border-emerald-100/50 p-4 rounded-2xl">
                    <div className="w-14 h-14 rounded-full border-4 border-indigo-600 flex items-center justify-center font-extrabold text-indigo-600 text-base shadow-sm">
                      {matchResult.matchPercentage}%
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Matching Rate</p>
                      <p className="text-[10px] text-slate-400 capitalize">Groq LLaMA Engine Analysis</p>
                    </div>
                  </div>

                  {matchResult.missingSkills && matchResult.missingSkills.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Missing Skills Gaps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.missingSkills.map((s, i) => (
                          <Badge key={i} variant="danger" className="text-[10px] px-2 py-0.5 rounded-lg">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Recruiter Feedback</p>
                    <p className="text-slate-600 text-xs leading-relaxed">{matchResult.criticalGapsExplanation}</p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleAnalyzeMatch}
                  isLoading={isAnalyzingMatch}
                  variant="secondary"
                  className="w-full mt-2 font-semibold shadow-md gap-2"
                >
                  Analyze Compatibility
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-100 max-w-lg w-full rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Apply for {job.title}</h3>
                <p className="text-xs text-slate-400">{job.company?.name}</p>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 bg-slate-50 rounded-xl"
              >
                ✕
              </button>
            </div>

            {hasApplied ? (
              <div className="text-center py-10 flex flex-col items-center justify-center gap-3 text-indigo-600">
                <CheckCircle className="w-16 h-16 animate-bounce" />
                <h4 className="font-bold text-lg text-slate-800">Application Submitted!</h4>
                <p className="text-xs text-slate-400">Employer will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="flex flex-col gap-4">
                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold px-4 py-2.5 rounded-xl text-center">
                    {errorMsg}
                  </div>
                )}

                {/* Resume Status check */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-indigo-600 w-8 h-8" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Profile Resume PDF</p>
                      <p className="text-[10px] text-slate-400">
                        {user?.profile?.resumeUrl ? "Saved PDF linked" : "No resume found. Add to profile first."}
                      </p>
                    </div>
                  </div>
                  {user?.profile?.resumeUrl ? (
                    <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-lg">Linked</span>
                  ) : (
                    <Link to="/dashboard" className="text-xs font-bold text-indigo-600 hover:underline">Upload</Link>
                  )}
                </div>

                {/* Cover letter section */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Letter</label>
                    <button
                      type="button"
                      disabled={isGeneratingCoverLetter}
                      onClick={handleAiWriteCoverLetter}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Bot className="w-3.5 h-3.5 text-emerald-500" />
                      {isGeneratingCoverLetter ? "Writing letter..." : "AI Auto-Generate"}
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Describe why you're a good fit for this role..."
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed placeholder:text-slate-400"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full mt-3 font-semibold"
                >
                  Submit Application
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default JobDetail;
export { JobDetail };
