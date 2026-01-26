import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-gray-700">EDU-AI Classroom</p>
            <p className="text-xs text-gray-500 mt-1">
              &copy; {new Date().getFullYear()} Learning Platform. All rights reserved.
            </p>
          </div>

          <div className="flex gap-6 text-sm text-gray-500 font-medium">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-blue-600 transition-colors">Help Center</a>
          </div>

          <div className="flex gap-4">
            <a href="#" onClick={(e) => e.preventDefault()} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-black hover:bg-gray-200 transition-all">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
