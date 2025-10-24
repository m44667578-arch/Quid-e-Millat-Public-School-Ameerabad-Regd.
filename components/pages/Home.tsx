import React, { useState, useEffect } from 'react';
import StatCard from '../StatCard';
import { AuthMode, UserType, LeadershipMessage } from '../../types';

interface HomeProps {
    studentCount: number;
    staffCount: number;
    openAuthModal: (mode: AuthMode, userType: UserType) => void;
    registrationMessage: string;
    leadershipMessages: LeadershipMessage[];
    heroImageUrls: string[];
}

const UsersIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const AcademicCapIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
);

interface PortalCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onLogin: () => void;
    onRegister: () => void;
}

const PortalCard: React.FC<PortalCardProps> = ({ title, description, icon, onLogin, onRegister }) => (
    <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
        <div className="bg-school-blue text-white p-4 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-school-blue mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 flex-grow">{description}</p>
        <div className="flex space-x-4">
            <button onClick={onLogin} className="bg-school-blue text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors">Login</button>
            <button onClick={onRegister} className="bg-school-gold text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors">Register</button>
        </div>
    </div>
);


const Home: React.FC<HomeProps> = ({ studentCount, staffCount, openAuthModal, registrationMessage, leadershipMessages, heroImageUrls }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (heroImageUrls.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImageUrls.length);
      }, 7000); // Change image every 7 seconds
      return () => clearInterval(timer);
    }
  }, [heroImageUrls.length]);

  return (
    <div className="bg-school-light">
      {/* Hero Section */}
      <div className="relative bg-school-blue h-96 overflow-hidden">
        {heroImageUrls.map((url, index) => (
            <img 
                key={url + index}
                src={url} 
                alt="Quaid-e-Millat Public School" 
                className={`absolute w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-50' : 'opacity-0'}`}
            />
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 bg-black bg-opacity-30">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Welcome to Quaid-e-Millat Public School</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl">Nurturing Minds, Building Futures Since 1999, where excellence in education meets character building. We provide quality education from Playgroup to Grade 7 in a nurturing environment.</p>
        </div>
      </div>
      
        {registrationMessage && (
            <div className="bg-green-100 border-t-4 border-green-500 rounded-b text-green-900 px-4 py-3 shadow-md my-4 max-w-4xl mx-auto" role="alert">
                <div className="flex">
                    <div className="py-1"><svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
                    <div>
                        <p className="font-bold">Registration Submitted!</p>
                        <p className="text-sm">{registrationMessage}</p>
                    </div>
                </div>
            </div>
        )}

      {/* Portals Section */}
       <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-school-blue sm:text-4xl">User Portals</h2>
                <p className="mt-4 text-lg text-gray-600">Access resources for students, parents, and our dedicated staff.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PortalCard 
                    title="Student Portal" 
                    description="Access grades, assignments, and school announcements. Your hub for academic success."
                    icon={<AcademicCapIcon />}
                    onLogin={() => openAuthModal('login', 'student')}
                    onRegister={() => openAuthModal('register', 'student')}
                />
                <PortalCard 
                    title="Parent Portal" 
                    description="Stay updated on your child's progress, attendance, and school events. Partner with us in their education."
                    icon={<UsersIcon />}
                    onLogin={() => openAuthModal('login', 'parent')}
                    onRegister={() => openAuthModal('register', 'parent')}
                />
                <PortalCard 
                    title="Admin & Staff Portal" 
                    description="Access administrative tools, manage school data, and collaborate with colleagues."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                    onLogin={() => openAuthModal('login', 'admin')}
                    onRegister={() => openAuthModal('register', 'admin')}
                />
            </div>
        </div>
      </section>

      {/* Leadership Messages Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-school-blue sm:text-4xl">Messages from Leadership</h2>
            <p className="mt-4 text-lg text-gray-600">Guidance and vision from our school's leaders.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {leadershipMessages.map(leader => (
                <div key={leader.id} className="p-6">
                    <img className="w-32 h-32 rounded-full mx-auto shadow-lg object-cover" src={leader.imageUrl} alt={leader.name} />
                    <h3 className="mt-6 text-xl font-bold text-school-blue">{leader.title}</h3>
                    <p className="mt-2 text-gray-600">"{leader.message}"</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StatCard icon={<UsersIcon />} title="Enrolled Students" count={studentCount} />
            <StatCard icon={<AcademicCapIcon />} title="Qualified Staff" count={staffCount} />
          </div>
        </div>
      </section>

       {/* School Glimpses Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-school-blue sm:text-4xl">School Glimpses</h2>
                <p className="mt-4 text-lg text-gray-600">A look into our vibrant campus life.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-64"><img className="w-full h-full object-cover rounded-lg shadow-md" src="https://picsum.photos/400/300?image=1018" alt="School building"/></div>
                <div className="h-64"><img className="w-full h-full object-cover rounded-lg shadow-md" src="https://picsum.photos/400/300?image=1078" alt="Students in classroom"/></div>
                <div className="h-64"><img className="w-full h-full object-cover rounded-lg shadow-md" src="https://picsum.photos/400/300?image=24" alt="Science lab"/></div>
                <div className="h-64"><img className="w-full h-full object-cover rounded-lg shadow-md" src="https://picsum.photos/400/300?image=1062" alt="Sports day"/></div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;