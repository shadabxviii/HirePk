import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, FileText, Bookmark, Send, Sparkles, Phone, MapPin, Upload, Briefcase, Plus, CheckCircle, Volume2 } from "lucide-react";
import { getProfile, updateProfile, uploadResumeFile, uploadAudioPitchFile, getSavedJobs } from "../../services/userService";
import { getMyApplications } from "../../services/applicationService";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import Badge from "../../components/atoms/Badge";
import Spinner from "../../components/atoms/Spinner";

const SeekerDashboard = () => {
  const { user, updateProfileState } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);

  // Lists
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  // Profile Form States
  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.profile?.headline || "");
  const [bio, setBio] = useState(user?.profile?.bio || "");
  const [city, setCity] = useState(user?.profile?.city || "");
  const [area, setArea] = useState(user?.profile?.area || "");
  const [phone, setPhone] = useState(user?.profile?.phone || "");
  const [skills, setSkills] = useState(user?.profile?.skills?.join(", ") || "");
  const [linkedin, setLinkedin] = useState(user?.profile?.socials?.linkedin || "");
  const [github, setGithub] = useState(user?.profile?.socials?.github || "");

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingPitch, setIsUploadingPitch] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const profile = await getProfile();
        updateProfileState(profile);

        const apps = await getMyApplications();
        setApplications(Array.isArray(apps) ? apps : []);

        const bookmarks = await getSavedJobs();
        setSavedJobs(Array.isArray(bookmarks) ? bookmarks : []);
      } catch (err) {
        console.error("Dashboard data load failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setSuccessMsg("");
    try {
      const response = await updateProfile({
        name,
        headline,
        bio,
        city,
        area,
        phone,
        skills,
        linkedin,
        github
      });
      updateProfileState(response);
      setSuccessMsg("Profile details updated successfully!");
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingResume(true);
    setSuccessMsg("");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await uploadResumeFile(formData);
      // Fetch latest profile to sync
      const profile = await getProfile();
      updateProfileState(profile);
      if (response?.skillsExtracted?.length) {
        setSkills(response.skillsExtracted.join(", "));
      }
      setSuccessMsg(
        response?.parseSource === "ai"
          ? "Resume uploaded and AI-parsed successfully! Skills auto-filled."
          : "Resume uploaded successfully!"
      );
    } catch (err) {
      alert("Resume upload failed: " + err.message);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handlePitchUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPitch(true);
    setSuccessMsg("");
    const formData = new FormData();
    formData.append("pitch", file);

    try {
      const response = await uploadAudioPitchFile(formData);
      const profile = await getProfile();
      updateProfileState(profile);
      setSuccessMsg("Audio pitch uploaded successfully!");
    } catch (err) {
      alert("Audio pitch upload failed: " + err.message);
    } finally {
      setIsUploadingPitch(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      pending: "warning",
      viewed: "info",
      shortlisted: "secondary",
      interviewing: "default",
      rejected: "danger",
      hired: "secondary"
    };
    return variants[status] || "outline";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size="lg" />
        <span className="text-slate-400 text-sm font-semibold">Loading seeker dashboard...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Dynamic welcome header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex gap-4 items-center">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm" />
          ) : (
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center font-bold text-indigo-700 text-2xl">
              {user?.name?.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{user?.name}</h2>
            <p className="text-slate-400 text-xs mt-1 capitalize">
              {user?.profile?.headline || "Job Seeker"} &bull; {user?.profile?.city || "Pakistan"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {user?.profile?.resumeUrl && (
            <a href={user.profile.resumeUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" icon={<FileText className="w-4 h-4" />}>
                View Resume
              </Button>
            </a>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-2.5 rounded-xl text-center">
          {successMsg}
        </div>
      )}

      {/* Tab navigation & Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Left Side Tab Controls */}
        <div className="flex flex-col gap-2 bg-white/60 p-2 rounded-2xl border border-slate-100">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
              activeTab === "profile" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User className="w-4.5 h-4.5" /> Profile Settings
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
              activeTab === "applications" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Send className="w-4.5 h-4.5" /> Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
              activeTab === "saved" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Bookmark className="w-4.5 h-4.5" /> Bookmarked Jobs ({savedJobs.length})
          </button>
        </div>

        {/* Right side workspaces */}
        <div className="md:col-span-3">
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">
              {/* Document upload card */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PDF Resume upload */}
                <div className="flex flex-col gap-3">
                  <h4 className="font-extrabold text-slate-800 text-sm">Resume Document (PDF)</h4>
                  <p className="text-[11px] text-slate-400">Upload your PDF resume to easily apply to local listings.</p>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <label className="flex items-center gap-2 border border-dashed border-slate-300 hover:bg-slate-50 p-2.5 rounded-xl cursor-pointer text-xs font-semibold text-slate-600 transition-colors">
                      <Upload className="w-4 h-4 text-slate-400" />
                      {isUploadingResume ? "Uploading..." : "Select PDF File"}
                      <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" disabled={isUploadingResume} />
                    </label>
                    {user?.profile?.resumeUrl && (
                      <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-lg">Uploaded</span>
                    )}
                  </div>
                </div>

                {/* Audio pitch upload */}
                <div className="flex flex-col gap-3">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                    <Volume2 className="w-4.5 h-4.5 text-indigo-600" /> 1-Min Audio Pitch
                  </h4>
                  <p className="text-[11px] text-slate-400">Record a short introduction to stand out to employers.</p>
                  
                  <div className="flex flex-col gap-2 mt-1">
                    <label className="flex items-center gap-2 border border-dashed border-slate-300 hover:bg-slate-50 p-2.5 rounded-xl cursor-pointer text-xs font-semibold text-slate-600 transition-colors w-fit">
                      <Upload className="w-4 h-4 text-slate-400" />
                      {isUploadingPitch ? "Uploading..." : "Select Audio File"}
                      <input type="file" accept="audio/*" onChange={handlePitchUpload} className="hidden" disabled={isUploadingPitch} />
                    </label>
                    {user?.profile?.audioPitchUrl && (
                      <audio src={user.profile.audioPitchUrl} controls className="w-full max-w-[240px] h-8 mt-1.5 rounded-lg border border-slate-200" />
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details Edit Form */}
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-base mb-6">Profile Settings</h3>
                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input label="Professional Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. MERN stack learner" />
                  
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bio description</label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write a brief professional summary..."
                      className="w-full bg-white border border-slate-200 text-slate-800 text-sm p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                  <Input label="Area / Sector" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Gulshan, Phase 6" />
                  <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input label="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Node, Git, CSS" />
                  <Input label="LinkedIn profile" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
                  <Input label="GitHub profile" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." />

                  <Button type="submit" isLoading={isUpdatingProfile} className="md:col-span-2 font-semibold w-full mt-2">
                    Save Changes
                  </Button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "applications" && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-800 text-base">Job Applications</h3>
              {applications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  You haven't submitted any job applications yet.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {applications.map((app) => (
                    <div key={app._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{app.job?.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{app.job?.company?.name} &bull; {app.job?.location?.city}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">Applied {new Date(app.appliedAt).toLocaleDateString("en-PK")}</span>
                      </div>
                      <Badge variant={getStatusBadgeVariant(app.status)} className="capitalize text-xs px-3 py-1">
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-800 text-base">Saved/Bookmarked Jobs</h3>
              {savedJobs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  You haven't bookmarked any jobs.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedJobs.map((job) => (
                    <div key={job._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between min-h-[140px]">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{job.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{job.company?.name}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{job.location?.city}</p>
                      </div>
                      <Link to={`/jobs/${job._id}`} className="self-end mt-2">
                        <Button size="sm" variant="outline">View Listing</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;
export { SeekerDashboard };
