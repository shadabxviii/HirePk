import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getJobs } from "../services/jobService";
import JobCard from "../components/molecules/JobCard";
import Button from "../components/atoms/Button";
import Spinner from "../components/atoms/Spinner";
import PublicLayout from "../components/templates/PublicLayout";

const CITIES = ["All", "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Faisalabad", "Multan"];
const CATEGORIES = ["All", "IT", "Finance", "Marketing", "Design", "HR", "Sales", "Engineering", "Other"];
const TYPES = ["All", "full-time", "part-time", "internship", "remote", "contract"];
const EXPERIENCES = ["All", "entry", "mid", "senior"];

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ totalJobs: 0, totalPages: 1, currentPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read URL search params
  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "All";
  const type = searchParams.get("type") || "All";
  const experienceLevel = searchParams.get("experienceLevel") || "All";
  const page = parseInt(searchParams.get("page") || "1");

  // FIX 1: Local state search input ke liye taake input lag-free rahe
  const [localSearch, setLocalSearch] = useState(search);

  // FIX 2: Agar URL manually clear ho ya change ho, toh local state sync rahe
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // FIX 3: Debounce logic — 500ms wait karega type rukne ka, phir URL update karega
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (localSearch) {
        newParams.set("search", localSearch);
      } else {
        newParams.delete("search");
      }
      newParams.set("page", "1"); // Search badalne par page 1 par reset ho

      // Sirf tabhi URL update ho jab actual mein data badla ho (infinite loop se bachne ke liye)
      if (searchParams.get("search") !== newParams.get("search") || newParams.get("page") === "1" && searchParams.get("page") !== "1") {
         setSearchParams(newParams);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [localSearch]);

  // Main API call mechanism (unaffected and clean)
  useEffect(() => {
    const fetchJobsData = async () => {
      setIsLoading(true);
      try {
        const params = { page, limit: 6 };
        if (search) params.search = search;
        if (city && city !== "All") params.city = city;
        if (category && category !== "All") params.category = category;
        if (type && type !== "All") params.type = type;
        if (experienceLevel && experienceLevel !== "All") params.experienceLevel = experienceLevel;

        const response = await getJobs(params);
        setJobs(response.jobs || []);
        setPagination(response.pagination || { totalJobs: 0, totalPages: 1, currentPage: 1 });
      } catch (err) {
        console.error("Failed to load jobs list:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobsData();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "All") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1"); // Reset pagination
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setLocalSearch(""); // Local search bhi clear karein
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const activeFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (city && city !== "All") count++;
    if (category && category !== "All") count++;
    if (type && type !== "All") count++;
    if (experienceLevel && experienceLevel !== "All") count++;
    return count;
  };

  const FiltersContent = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-base">Search Filters</h3>
        {activeFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-indigo-600 font-semibold hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* City selector */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">City</label>
        <select
          value={city}
          onChange={(e) => updateParam("city", e.target.value)}
          className="w-full bg-white border border-slate-200 text-slate-700 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>{c === "All" ? "All of Pakistan" : c}</option>
          ))}
        </select>
      </div>

      {/* Category selector */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="w-full bg-white border border-slate-200 text-slate-700 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Job Type selector */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Type</label>
        <div className="flex flex-col gap-2">
          {TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2.5 text-slate-600 text-sm cursor-pointer select-none">
              <input
                type="radio"
                name="jobType"
                checked={type === t}
                onChange={() => updateParam("type", t)}
                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className="capitalize">{t === "All" ? "All types" : t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experience</label>
        <select
          value={experienceLevel}
          onChange={(e) => updateParam("experienceLevel", e.target.value)}
          className="w-full bg-white border border-slate-200 text-slate-700 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
        >
          {EXPERIENCES.map((exp) => (
            <option key={exp} value={exp} className="capitalize">
              {exp === "All" ? "All Levels" : `${exp} level`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <PublicLayout>
      <div className="flex flex-col gap-4">
        {/* Title banner */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Search Vacancies</h1>
          <p className="text-xs text-slate-400 mt-1">Explore hyperlocal job opportunities and internships</p>
        </div>

        {/* Dynamic Search header */}
        <div className="w-full bg-white border border-slate-100 p-3 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center mt-2">
          <div className="flex items-center gap-2.5 px-3 w-full py-1">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              // FIX 4: Bind value with local state instead of raw url search param
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search job titles, keywords, skills..."
              className="w-full bg-transparent text-sm text-slate-700 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex w-full md:w-auto gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex-1 flex items-center justify-center gap-2 h-11"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilterCount() > 0 && `(${activeFilterCount()})`}
            </Button>
          </div>
        </div>

        {/* Workspace body grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start mt-4">
          {/* Left panel filters (Desktop only) */}
          <aside className="hidden md:block glass-panel p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-24">
            <FiltersContent />
          </aside>

          {/* Right panel listings */}
          <div className="md:col-span-3 flex flex-col gap-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Spinner size="lg" />
                <span className="text-slate-400 text-sm font-semibold">Loading job listings...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="glass-panel text-center py-20 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-400">
                <SlidersHorizontal className="w-12 h-12 text-slate-300" />
                <div>
                  <h3 className="font-bold text-slate-700 text-base">No matching jobs found</h3>
                  <p className="text-xs text-slate-400 mt-1">Try resetting your active search filters</p>
                </div>
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                {/* Result header */}
                <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider px-1">
                  <span>{pagination.totalJobs} jobs matching</span>
                  <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>

                {/* Pagination actions */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                      icon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Prev
                    </Button>
                    {[...Array(pagination.totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            page === pageNum
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === pagination.totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      icon={<ChevronRight className="w-4 h-4" />}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
          <div className="w-80 bg-white h-full p-6 shadow-2xl overflow-y-auto flex flex-col gap-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-lg">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <FiltersContent />

            <Button
              className="w-full mt-auto"
              onClick={() => setShowMobileFilters(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default Jobs;
export { Jobs };