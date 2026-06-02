import React from "react";
import Navbar from "../organisms/Navbar";

const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
      <footer className="glass-panel border-t border-slate-100 py-8 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-600">HirePK — Pakistan's AI-Powered Local Job Board</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} HirePK. Built for students, freshers, and local businesses.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
export { PublicLayout };
