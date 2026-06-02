import React, { useEffect, useState } from "react";
import { Bookmark, AlertTriangle } from "lucide-react";
import { getSavedJobs } from "../services/userService";
import JobCard from "../components/molecules/JobCard";
import Spinner from "../components/atoms/Spinner";
import PublicLayout from "../components/templates/PublicLayout";

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const response = await getSavedJobs();
      setJobs(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleBookmarkToggle = (jobId, isSaved) => {
    // If job was removed from bookmarks, filter it out from the display
    if (!isSaved) {
      setJobs(jobs.filter((j) => j._id !== jobId));
    }
  };

  return (
    <PublicLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-indigo-600" /> Saved Job Openings
          </h1>
          <p className="text-xs text-slate-400 mt-1">Keep track of vacancies you bookmarked</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="md" />
            <span className="text-slate-400 text-xs font-semibold">Loading bookmarked jobs...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-panel text-center py-16 text-slate-400 text-sm rounded-3xl border border-slate-100 max-w-lg mx-auto flex flex-col items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-slate-300" />
            <div>
              <h3 className="font-bold text-slate-700 text-sm">No bookmarked vacancies</h3>
              <p className="text-xs text-slate-400 mt-1">Bookmark jobs during search to track them here.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} onBookmarkToggle={handleBookmarkToggle} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default SavedJobs;
export { SavedJobs };
