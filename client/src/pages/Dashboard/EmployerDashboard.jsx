import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, PlusCircle, Briefcase, Users, User, FileText, Check, X, Sparkles, Bot, Phone, MapPin, Upload } from "lucide-react";
import { getMyListings } from "../../services/jobService";
import { getApplicantsForJob, updateApplicationStatus } from "../../services/applicationService";
import { getMyCompany, updateMyCompany } from "../../services/companyService";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import Badge from "../../components/atoms/Badge";
import Spinner from "../../components/atoms/Spinner";

const EmployerDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("listings");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [listings, setListings] = useState([]);
  const [company, setCompany] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [isApplicantsLoading, setIsApplicantsLoading] = useState(false);

  // Company profile form
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("1-10");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const listData = await getMyListings();
      setListings(listData.data || []);
      
      const compData = await getMyCompany();
      if (compData.data) {
        setCompany(compData.data);
        setCompanyName(compData.data.name || "");
        setWebsite(compData.data.website || "");
        setIndustry(compData.data.industry || "");
        setSize(compData.data.size || "1-10");
        setCity(compData.data.city || "");
        setArea(compData.data.area || "");
        setDescription(compData.data.description || "");
      }
    } catch (err) {
      console.warn("Failed to load employer dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompanyUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingCompany(true);
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("name", companyName);
    formData.append("website", website);
    formData.append("industry", industry);
    formData.append("size", size);
    formData.append("city", city);
    formData.append("area", area);
    formData.append("description", description);
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    try {
      const response = await updateMyCompany(formData);
      setCompany(response.data);
      setSuccessMsg("Company profile updated successfully!");
    } catch (err) {
      alert("Failed to update company: " + err.message);
    } finally {
      setIsUpdatingCompany(false);
    }
  };

  const handleViewApplicants = async (jobId, jobTitle) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setActiveTab("applicants");
    setIsApplicantsLoading(true);
    try {
      const response = await getApplicantsForJob(jobId);
      setApplicants(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplicantsLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      // Refresh lists
      const response = await getApplicantsForJob(selectedJobId);
      setApplicants(response.data || []);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Group applicants by recruitment stage columns
  const getPipelineColumnData = (stage) => {
    if (stage === "applied") {
      return applicants.filter((a) => ["pending", "viewed"].includes(a.status));
    }
    if (stage === "shortlisted") {
      return applicants.filter((a) => ["shortlisted", "interviewing"].includes(a.status));
    }
    if (stage === "hired") {
      return applicants.filter((a) => ["hired", "rejected"].includes(a.status));
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size="lg" />
        <span className="text-slate-400 text-sm font-semibold">Loading employer dashboard...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Welcome details */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex gap-4 items-center">
          {company?.logo ? (
            <img src={company.logo} alt="logo" className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm" />
          ) : (
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center font-bold text-indigo-700 text-xl">
              <Building2 className="w-6 h-6" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{companyName || `${user.name}'s Company`}</h2>
            <p className="text-slate-400 text-xs mt-1 font-semibold">
              Employer Workspace &bull; {city || "Pakistan"}
            </p>
          </div>
        </div>

        <Link to="/post-job">
          <Button size="sm" icon={<PlusCircle className="w-4 h-4" />}>
            Post new Job
          </Button>
        </Link>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-2.5 rounded-xl text-center animate-fade-in">
          {successMsg}
        </div>
      )}

      {/* Tab controls and Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Left pane Tab selector */}
        <div className="flex flex-col gap-2 bg-white/60 p-2 rounded-2xl border border-slate-100">
          <button
            onClick={() => {
              setActiveTab("listings");
              setSelectedJobId(null);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
              activeTab === "listings" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Briefcase className="w-4.5 h-4.5" /> Job Listings ({listings.length})
          </button>
          
          {selectedJobId && (
            <button
              onClick={() => setActiveTab("applicants")}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                activeTab === "applicants" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <Users className="w-4.5 h-4.5" /> Pipeline Board
              </span>
              <Badge variant="warning" className="text-[10px] scale-90">Active</Badge>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab("company");
              setSelectedJobId(null);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
              activeTab === "company" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Building2 className="w-4.5 h-4.5" /> Company Profile
          </button>
        </div>

        {/* Right side Workspaces */}
        <div className="md:col-span-3">
          {activeTab === "listings" && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-800 text-base">Your Active Job Listings</h3>
              {listings.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  You haven't posted any jobs yet. Click "Post new Job" to start.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {listings.map((job) => (
                    <div key={job._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{job.title}</h4>
                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                          {job.type} &bull; {job.location?.city} &bull; Category: {job.category}
                        </p>
                        <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-semibold">
                          <span>{job.views || 0} Views</span>
                          <span>{job.applicantsCount || 0} Applicants</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewApplicants(job._id, job.title)}
                          icon={<Users className="w-4 h-4" />}
                        >
                          View applicants
                        </Button>
                        <Link to={`/jobs/${job._id}`}>
                          <Button size="sm" variant="ghost">View job</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "applicants" && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-2xl">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm md:text-base">
                    Applicants for: {selectedJobTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Drag-and-drop workflow status pipeline</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("listings")}>
                  Back to list
                </Button>
              </div>

              {isApplicantsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Spinner size="md" />
                  <span className="text-slate-400 text-xs font-semibold">Loading applicant details...</span>
                </div>
              ) : applicants.length === 0 ? (
                <div className="glass-panel text-center py-16 text-slate-400 text-sm rounded-3xl border border-slate-100">
                  No applications received for this job listing.
                </div>
              ) : (
                /* Recruitment Kanban columns layout */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Applied */}
                  <div className="flex flex-col gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 min-h-[300px]">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Applied</span>
                      <Badge variant="outline" className="scale-75">{getPipelineColumnData("applied").length}</Badge>
                    </div>

                    <div className="flex flex-col gap-3">
                      {getPipelineColumnData("applied").map((app) => (
                        <div key={app._id} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-700 text-sm">
                              {app.applicant?.name?.charAt(0)}
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-slate-800 truncate max-w-[120px]">{app.applicant?.name}</h5>
                              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{app.applicant?.email}</p>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 line-clamp-2">
                            {app.coverLetter || "No cover letter provided."}
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                            {app.resumeUrl ? (
                              <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" /> CV PDF
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-400">No CV</span>
                            )}
                            
                            <div className="flex gap-1.5">
                              <button onClick={() => handleUpdateStatus(app._id, "shortlisted")} className="p-1 bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors rounded-lg cursor-pointer">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleUpdateStatus(app._id, "rejected")} className="p-1 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors rounded-lg cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Shortlisted/Interview */}
                  <div className="flex flex-col gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 min-h-[300px]">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Shortlisted / Interviewing</span>
                      <Badge variant="outline" className="scale-75">{getPipelineColumnData("shortlisted").length}</Badge>
                    </div>

                    <div className="flex flex-col gap-3">
                      {getPipelineColumnData("shortlisted").map((app) => (
                        <div key={app._id} className="bg-white border border-indigo-100/50 p-4 rounded-xl shadow-sm flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-700 text-sm">
                                {app.applicant?.name?.charAt(0)}
                              </div>
                              <div>
                                <h5 className="font-bold text-xs text-slate-800 truncate max-w-[120px]">{app.applicant?.name}</h5>
                                <Badge variant="info" className="text-[9px] scale-90 py-0 px-1 capitalize mt-0.5">{app.status}</Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                            {app.resumeUrl && (
                              <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" /> CV
                              </a>
                            )}
                            {app.audioPitchUrl && (
                              <a href={app.audioPitchUrl} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> Voice
                              </a>
                            )}
                            
                            <div className="flex gap-1.5">
                              {app.status === "shortlisted" && (
                                <button onClick={() => handleUpdateStatus(app._id, "interviewing")} className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-lg font-bold hover:bg-indigo-100 cursor-pointer">
                                  Call Interview
                                </button>
                              )}
                              <button onClick={() => handleUpdateStatus(app._id, "hired")} className="p-1 bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors rounded-lg cursor-pointer">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Hired/Rejected */}
                  <div className="flex flex-col gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 min-h-[300px]">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Hired / Rejected</span>
                      <Badge variant="outline" className="scale-75">{getPipelineColumnData("hired").length}</Badge>
                    </div>

                    <div className="flex flex-col gap-3">
                      {getPipelineColumnData("hired").map((app) => (
                        <div key={app._id} className={`p-4 rounded-xl shadow-sm border flex flex-col gap-3 ${
                          app.status === "hired" ? "bg-emerald-50/20 border-emerald-200" : "bg-rose-50/20 border-rose-200"
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                              app.status === "hired" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
                            }`}>
                              {app.applicant?.name?.charAt(0)}
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-slate-800">{app.applicant?.name}</h5>
                              <span className={`text-[9px] font-bold uppercase tracking-wide block ${
                                app.status === "hired" ? "text-emerald-600" : "text-rose-500"
                              }`}>{app.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "company" && (
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-base mb-6">Company Settings</h3>
              
              <form onSubmit={handleCompanyUpdateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logo file upload */}
                <div className="md:col-span-2 flex flex-col gap-3 border-b border-slate-100 pb-5 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Logo Image</span>
                  <div className="flex items-center gap-4">
                    {company?.logo ? (
                      <img src={company.logo} alt="logo" className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold">L</div>
                    )}
                    <label className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl cursor-pointer text-xs font-semibold text-slate-600 transition-colors">
                      <Upload className="w-4 h-4 text-slate-400" />
                      Select Logo Image
                      <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="hidden" />
                    </label>
                    {logoFile && <span className="text-xs text-indigo-600 font-bold italic">{logoFile.name}</span>}
                  </div>
                </div>

                <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                <Input label="Company Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. https://company.com" />
                <Input label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Technology, Finance" />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 text-sm p-3 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>

                <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                <Input label="Area (Neighborhood)" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Clifton, Gulberg" />
                
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your company, perks, values, and offerings..."
                    className="w-full bg-white border border-slate-200 text-slate-800 text-sm p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <Button type="submit" isLoading={isUpdatingCompany} className="md:col-span-2 font-semibold w-full mt-2">
                  Save Company Details
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
export { EmployerDashboard };
