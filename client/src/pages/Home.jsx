import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Sparkles, Bot, Briefcase, ChevronRight, GraduationCap, Building2 } from "lucide-react";
import { getJobs } from "../services/jobService";
import JobCard from "../components/molecules/JobCard";
import Button from "../components/atoms/Button";
import PublicLayout from "../components/templates/PublicLayout";

const CATEGORIES = [
  { name: "IT", icon: <Bot className="w-5 h-5 text-indigo-500" />, desc: "Software, QA, Support" },
  { name: "Design", icon: <Sparkles className="w-5 h-5 text-emerald-500" />, desc: "UI/UX, Graphic Design" },
  { name: "Marketing", icon: <ChevronRight className="w-5 h-5 text-violet-500" />, desc: "SEO, Social Media" },
  { name: "Finance", icon: <Briefcase className="w-5 h-5 text-amber-500" />, desc: "Audit, Bookkeeping" }
];

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await getJobs({ limit: 3 });
        setFeaturedJobs(response.jobs || []);
      } catch (err) {
        console.error("Failed to load featured jobs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (cityQuery) params.set("city", cityQuery);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 max-w-4xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full text-indigo-700 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          Pakistan's 1st Hyperlocal AI Job Board
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 leading-tight tracking-tight">
          Find Local Jobs & Internships{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent block md:inline">
            Powered by AI
          </span>
        </h1>
        
        <p className="text-slate-500 text-base md:text-lg mt-6 max-w-2xl">
          Apne shehar aur neighborhood me jobs dhundhein. Direct AI cover letters aur resume reviews ke sath apply karein.
        </p>

        {/* Hero Search Box */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="w-full max-w-3xl mt-10 p-2 bg-white border border-slate-100 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 items-center"
        >
          <div className="flex items-center gap-2.5 px-3 w-full border-b md:border-b-0 md:border-r border-slate-100 py-3">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Job title, skills or keyword..."
              className="w-full bg-transparent text-sm text-slate-700 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2.5 px-3 w-full py-3">
            <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="City (e.g. Lahore, Karachi...)"
              className="w-full bg-transparent text-sm text-slate-700 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <Button type="submit" className="w-full md:w-auto h-12 px-8 rounded-xl font-semibold">
            Search
          </Button>
        </form>
      </section>

      {/* Categories Grid */}
      <section className="py-12 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              to={`/jobs?category=${cat.name}`}
              className="glass-panel hover-lift p-6 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center gap-3 group"
            >
              <div className="p-3 bg-slate-50 border border-slate-100/50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </div>
              <h3 className="font-semibold text-slate-800 text-sm md:text-base">{cat.name}</h3>
              <p className="text-[11px] text-slate-400 line-clamp-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 border-t border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Featured Job Openings</h2>
            <p className="text-xs text-slate-400 mt-1">Latest vacancies verified in Pakistan</p>
          </div>
          <Link to="/jobs">
            <Button variant="outline" size="sm" className="gap-1">
              All Jobs <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel p-6 rounded-2xl h-48 animate-pulse bg-slate-100/50 border border-slate-100" />
            ))}
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="text-center py-12 glass-panel border border-slate-100 rounded-2xl text-slate-400">
            No jobs found. Be the first to post!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Hero Features / CTA */}
      <section className="py-16 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-emerald-300 text-xs font-semibold mb-4 border border-white/5">
            <GraduationCap className="w-4 h-4" />
            Tailored for Students & Employers
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug">
            Tired of boring job portals? <br />
            Let AI write resumes & letters.
          </h2>
          <p className="text-indigo-200 text-sm mt-4 max-w-md leading-relaxed">
            Get instant feedback on your resume format, generate professional cover letters matching job criteria, and prep for interviews.
          </p>
          <div className="flex gap-4 mt-8">
            <Link to="/ai-tools">
              <Button variant="secondary" className="font-semibold shadow-md">
                Try AI Tools
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="text-white border-white/20 bg-transparent hover:bg-white/10 font-semibold">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-shrink-0 flex gap-4 w-full md:w-auto overflow-x-auto pb-2">
          <div className="bg-white/5 border border-white/10 backdrop-blur p-5 rounded-2xl w-48 text-center flex flex-col items-center">
            <Sparkles className="text-emerald-400 w-8 h-8 mb-2" />
            <h4 className="font-bold text-sm">ATS Match</h4>
            <p className="text-[11px] text-slate-400 mt-1">Check score vs description</p>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur p-5 rounded-2xl w-48 text-center flex flex-col items-center">
            <Bot className="text-indigo-400 w-8 h-8 mb-2" />
            <h4 className="font-bold text-sm">Interview AI</h4>
            <p className="text-[11px] text-slate-400 mt-1">10 mock questions & tips</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
export { Home };
