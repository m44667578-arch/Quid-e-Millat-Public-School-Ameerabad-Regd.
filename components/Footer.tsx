

import React from 'react';
import { Page } from '../types';

interface FooterProps {
  navigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-school-blue text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-school-gold">Quaid-e-Millat Public School</h3>
            <p className="mt-2 text-gray-300 text-sm">Ameerabad</p>
            <p className="text-gray-300 text-sm">Established: 1999</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-school-gold">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><button onClick={() => navigate(Page.About)} className="text-sm text-gray-300 hover:text-school-gold">About Us</button></li>
              <li><button onClick={() => navigate(Page.Events)} className="text-sm text-gray-300 hover:text-school-gold">Events</button></li>
              <li><button onClick={() => navigate(Page.Gallery)} className="text-sm text-gray-300 hover:text-school-gold">Gallery</button></li>
              <li><button onClick={() => navigate(Page.Admissions)} className="text-sm text-gray-300 hover:text-school-gold">Admissions</button></li>
              <li><button onClick={() => navigate(Page.Contact)} className="text-sm text-gray-300 hover:text-school-gold">Contact</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-school-gold">Contact Us</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-gray-300">Email: qmpsameerabad@gmail.com</li>
              <li className="text-sm text-gray-300">Phone: +92-355-5351324</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Quaid-e-Millat Public School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;