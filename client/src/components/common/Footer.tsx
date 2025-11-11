import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500" />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Logo className="w-8 h-8" />
              <span className="text-xl font-bold font-poppins">VolunFlow</span>
            </div>
            <p className="text-gray-300 max-w-md">
              Connecting volunteers with NGOs to create positive change in communities worldwide. 
              Join us in making a difference, one event at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-gray-300 hover:text-white transition duration-200 link-underline">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/ngo" className="text-gray-300 hover:text-white transition duration-200 link-underline">
                  NGOs
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition duration-200 link-underline">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200 link-underline">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200 link-underline">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200 link-underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200 link-underline">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 VolunFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <a href="#" aria-label="Twitter" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
              <Twitter className="w-5 h-5 text-white/80" />
            </a>
            <a href="#" aria-label="Facebook" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
              <Facebook className="w-5 h-5 text-white/80" />
            </a>
            <a href="#" aria-label="Instagram" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
              <Instagram className="w-5 h-5 text-white/80" />
            </a>
            <a href="#" aria-label="LinkedIn" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
              <Linkedin className="w-5 h-5 text-white/80" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;