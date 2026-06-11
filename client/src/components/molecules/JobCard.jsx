import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Briefcase, Bookmark, BookmarkCheck } from "lucide-react";
import Badge from "../atoms/Badge";
import Button from "../atoms/Button";
import { saveOrUnsaveJob } from "../../services/jobService";
import { useAuthStore } from "../../store/authStore";

const JobCard = ({ job, onBookmarkToggle }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [isSaved, setIsSaved] = useState(user?.savedJobs?.includes(job._id) || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("Please sign in to bookmark job listings.");
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await saveOrUnsaveJob(job._id);
      setIsSaved(response.saved);
      if (onBookmarkToggle) onBookmarkToggle(job._id, response.saved);
    } catch (error) {
      console.error("Bookmark failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formattedSalary = () => {
    if (!job.salary || (!job.salary.min && !job.salary.max)) return "Negotiable";
    const minStr = job.salary.min ? job.salary.min.toLocaleString("en-PK") : "0";
    const maxStr = job.salary.max ? job.salary.max.toLocaleString("en-PK") : "Open";
    return `PKR ${minStr} - ${maxStr} / month`;
  };

  return (
    <div className="glass-panel hover-lift flex flex-col justify-between p-6 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 min-h-[220px]">
      <div>
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            {job.company?.logo ? (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center font-bold text-indigo-700 text-lg">
                {job.company?.name ? job.company.name.charAt(0) : "J"}
              </div>
            )}
            <div>
              <Link to={`/jobs/${job._id}`} className="hover:text-indigo-600 transition-colors">
                <h3 className="font-semibold text-slate-800 text-base md:text-lg line-clamp-1">
                  {job.title}
                </h3>
              </Link>
              <p className="text-slate-500 text-xs mt-0.5">{job.company?.name}</p>
            </div>
          </div>

          <button
            onClick={handleBookmark}
            disabled={isSaving}
            className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 hover:bg-indigo-50 rounded-xl"
          >
            {isSaved ? <BookmarkCheck className="text-indigo-600 w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4">
          <Badge variant="outline" icon={<MapPin className="w-3.5 h-3.5" />}>
            {job.location?.city}
            {job.location?.area ? `, ${job.location.area}` : ""}
          </Badge>
          <Badge variant="outline" icon={<Clock className="w-3.5 h-3.5" />}>
            {job.type}
          </Badge>
          <Badge variant="outline" icon={<Briefcase className="w-3.5 h-3.5" />}>
            {job.category}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100/80">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Estimated Salary
          </span>
          <span className="text-xs md:text-sm font-semibold text-slate-700">
            {formattedSalary()}
          </span>
        </div>

        <Link to={`/jobs/${job._id}`}>
          <Button size="sm" className="rounded-xl">
            View details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
export { JobCard };
