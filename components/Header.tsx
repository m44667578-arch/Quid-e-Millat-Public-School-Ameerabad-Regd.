import React, { useState } from 'react';
import { Page, User } from '../types';

interface HeaderProps {
  navigate: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
  logoUrl: string;
}

const SchoolLogo: React.FC<{ logoUrl: string }> = ({ logoUrl }) => (
    <img src={logoUrl} alt="Quaid-e-Millat Public School Logo" className="w-16 h-16 object-contain rounded-full" />
);

const NavLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick} className="text-white hover:text-school-gold transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium">
    {children}
  </button>
);


const Header: React.FC<HeaderProps> = ({ navigate, user, onLogout, logoUrl }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleNavClick = (page: Page) => {
    navigate(page);
    setIsMenuOpen(false);
  }

  const getDashboardPage = () => {
    if (!user) return Page.Home;
    switch (user.userType) {
      case 'principal': return Page.PrincipalDashboard;
      case 'student': return Page.StudentDashboard;
      case 'parent': return Page.ParentDashboard;
      case 'admin': return Page.TeacherDashboard;
      default: return Page.Home;
    }
  }

  const navItems = [
    { page: Page.Home, label: 'Home' },
    { page: Page.About, label: 'About Us' },
    { page: Page.VisionMotive, label: 'Vision & Motive' },
    { page: Page.Events, label: 'Events' },
    { page: Page.Gallery, label: 'Gallery' },
    { page: Page.Admissions, label: 'Admissions' },
    { page: Page.Contact, label: 'Contact' },
  ];

  return (
    <header className="bg-school-blue shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className={`flex items-center ${!user ? 'cursor-pointer' : ''}`} onClick={() => !user && handleNavClick(Page.Home)}>
            <SchoolLogo logoUrl={logoUrl} />
            <div className="ml-4">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">Quaid-e-Millat Public School</h1>
              <p className="text-sm text-school-gold font-serif italic">"Enter to Learn, Leave to Lead"</p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {user ? (
                <>
                  <span className="text-white">Welcome, {user.fullName.split(' ')[0]}!</span>
                  <NavLink onClick={() => handleNavClick(getDashboardPage())}>Dashboard</NavLink>
                  <NavLink onClick={onLogout}>Logout</NavLink>
                </>
              ) : (
                navItems.map(item => (
                  <NavLink key={item.page} onClick={() => handleNavClick(item.page)}>{item.label}</NavLink>
                ))
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-label="Open main menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
               <>
                  <button onClick={() => {handleNavClick(getDashboardPage()); setIsMenuOpen(false);}} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Dashboard</button>
                  <button onClick={() => {onLogout(); setIsMenuOpen(false);}} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Logout</button>
               </>
            ) : (
                navItems.map(item => (
                    <button key={item.page} onClick={() => handleNavClick(item.page)} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                        {item.label}
                    </button>
                ))
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;