import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Briefcase, 
  Building2, 
  Send, 
  Trash2, 
  Check, 
  X, 
  ShieldAlert, 
  BarChart3, 
  Clock,
  UserCheck,
  MapPin,
  FileText
} from "lucide-react";
import { 
  getAdminAnalytics, 
  getAdminUsers, 
  deleteAdminUser, 
  getAdminJobs, 
  updateAdminJobStatus, 
  deleteAdminJob,
  getAdminApplications
} from "../../services/adminService";
import Button from "../../components/atoms/Button";
import Badge from "../../components/atoms/Badge";
import Spinner from "../../components/atoms/Spinner";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("analytics");
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  // Action loading states
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const analyticRes = await getAdminAnalytics();
      setAnalytics(analyticRes);

      const userRes = await getAdminUsers();
      setUsers(Array.isArray(userRes) ? userRes : []);

      const jobRes = await getAdminJobs();
      setJobs(Array.isArray(jobRes) ? jobRes : []);

      const appRes = await getAdminApplications();
      setApplications(Array.isArray(appRes) ? appRes : []);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
      setErrorMsg("Failed to load administrative data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This will permanently delete their account and all their posted jobs/applications.`)) {
      return;
    }

    setIsActionLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await deleteAdminUser(userId);
      setSuccessMsg(`User "${userName}" was deleted successfully.`);
      // Reload lists
      const userRes = await getAdminUsers();
      setUsers(Array.isArray(userRes) ? userRes : []);
      const analyticRes = await getAdminAnalytics();
      setAnalytics(analyticRes);
      const jobRes = await getAdminJobs();
      setJobs(Array.isArray(jobRes) ? jobRes : []);
      const appRes = await getAdminApplications();
      setApplications(Array.isArray(appRes) ? appRes : []);
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete user.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateJobStatus = async (jobId, title, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "closed" : "active";
    if (!window.confirm(`Change status of "${title}" to "${nextStatus}"?`)) {
      return;
    }

    setIsActionLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await updateAdminJobStatus(jobId, nextStatus);
      setSuccessMsg(`Job listing "${title}" status updated to ${nextStatus}.`);
      const jobRes = await getAdminJobs();
      setJobs(Array.isArray(jobRes) ? jobRes : []);
      const analyticRes = await getAdminAnalytics();
      setAnalytics(analyticRes);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update job status.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to delete job "${title}"? This will delete the listing and all applications.`)) {
      return;
    }

    setIsActionLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await deleteAdminJob(jobId);
      setSuccessMsg(`Job listing "${title}" was deleted.`);
      const jobRes = await getAdminJobs();
      setJobs(Array.isArray(jobRes) ? jobRes : []);
      const analyticRes = await getAdminAnalytics();
      setAnalytics(analyticRes);
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete job.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size="lg" />
        <span className="text-slate-400 text-sm font-semibold">Loading Admin Console...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm bg-slate-900 text-white">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white text-xl">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Admin Moderation Console</h2>
            <p className="text-slate-400 text-xs mt-1 font-semibold">
              Super-Admin Workspace &bull; Site Analytics, Moderation, and Controls
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="px-4 py-1.5 text-xs font-extrabold uppercase">
          Authorized Admin
        </Badge>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-2.5 rounded-xl text-center">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold px-4 py-2.5 rounded-xl text-center">
          {errorMsg}
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Left tabs selector */}
        <div className="flex flex-col gap-2 bg-white/60 p-2 rounded-2xl border border-slate-100 shadow-sm">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
              activeTab === "analytics" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BarChart3 className="w-4.5 h-4.5" /> Analytics Overview
          </button>
          
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
              activeTab === "users" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Users className="w-4.5 h-4.5" /> Manage Users ({users.length})
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
              activeTab === "jobs" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Briefcase className="w-4.5 h-4.5" /> Manage Jobs ({jobs.length})
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
              activeTab === "applications" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Send className="w-4.5 h-4.5" /> Applications ({applications.length})
          </button>
        </div>

        {/* Right side workspaces */}
        <div className="md:col-span-3">
          {activeTab === "analytics" && analytics && (
            <div className="flex flex-col gap-6">
              {/* Analytics Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-28 bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-semibold">Total Users</span>
                    <Users className="w-5 h-5 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800">{analytics.totalUsers}</h3>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-28 bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-semibold">Total Jobs</span>
                    <Briefcase className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800">{analytics.totalJobs}</h3>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-28 bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-semibold">Applications</span>
                    <Send className="w-5 h-5 text-violet-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800">{analytics.totalApplications}</h3>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-28 bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-semibold">Companies</span>
                    <Building2 className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800">{analytics.totalCompanies}</h3>
                </div>
              </div>

              {/* Sub-breakdown charts list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col gap-4">
                  <h4 className="font-extrabold text-slate-700 text-sm border-b border-slate-50 pb-2">User Roles Breakdown</h4>
                  <div className="flex flex-col gap-3.5 mt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Job Seekers
                      </span>
                      <span className="font-bold text-slate-800">{analytics.roles?.seekerCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Employers
                      </span>
                      <span className="font-bold text-slate-800">{analytics.roles?.employerCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Admins
                      </span>
                      <span className="font-bold text-slate-800">{analytics.roles?.adminCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col gap-4">
                  <h4 className="font-extrabold text-slate-700 text-sm border-b border-slate-50 pb-2">Jobs Status Breakdown</h4>
                  <div className="flex flex-col gap-3.5 mt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Active listings
                      </span>
                      <span className="font-bold text-slate-800">{analytics.jobs?.activeJobs || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Closed listings
                      </span>
                      <span className="font-bold text-slate-800">{analytics.jobs?.closedJobs || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-800 text-base">Register Users</h3>
              {users.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">No users found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-slate-50 text-xs hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-700 flex items-center gap-2">
                            {u.avatar ? (
                              <img src={u.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-[10px] uppercase">
                                {u.name?.charAt(0)}
                              </div>
                            )}
                            {u.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                          <td className="py-3.5 px-4 capitalize">
                            <Badge variant={u.role === "admin" ? "danger" : u.role === "employer" ? "info" : "default"}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">{u.profile?.city || "Pakistan"}</td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString("en-PK")}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {u.role !== "admin" && (
                              <button
                                disabled={isActionLoading}
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete user account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "applications" && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-800 text-base">All Job Applications</h3>
              {applications.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">No applications found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-4">Applicant</th>
                        <th className="py-3 px-4">Job</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app._id} className="border-b border-slate-50 text-xs hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-700">{app.applicant?.name}</td>
                          <td className="py-3.5 px-4 text-slate-500">{app.job?.title}</td>
                          <td className="py-3.5 px-4 text-slate-400">{app.job?.location?.city || "—"}</td>
                          <td className="py-3.5 px-4 capitalize">
                            <Badge variant="outline">{app.status}</Badge>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(app.appliedAt).toLocaleDateString("en-PK")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-800 text-base">Manage Job Listings</h3>
              {jobs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">No job listings found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((j) => (
                        <tr key={j._id} className="border-b border-slate-50 text-xs hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-700">
                            <Link to={`/jobs/${j._id}`} className="hover:text-indigo-600 hover:underline">
                              {j.title}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{j.company?.name || "No Company"}</td>
                          <td className="py-3.5 px-4">{j.category}</td>
                          <td className="py-3.5 px-4 text-slate-400">{j.location?.city || "Pakistan"}</td>
                          <td className="py-3.5 px-4">
                            <Badge variant={j.status === "active" ? "secondary" : "outline"} className="capitalize">
                              {j.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right flex gap-1 justify-end">
                            <button
                              disabled={isActionLoading}
                              onClick={() => handleUpdateJobStatus(j._id, j.title, j.status)}
                              className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                                j.status === "active" 
                                  ? "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100" 
                                  : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                              }`}
                              title={j.status === "active" ? "Set Closed" : "Set Active"}
                            >
                              {j.status === "active" ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>
                            
                            <button
                              disabled={isActionLoading}
                              onClick={() => handleDeleteJob(j._id, j.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent cursor-pointer"
                              title="Delete job listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
export { AdminDashboard };
