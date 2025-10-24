import React from 'react';

interface ContactProps {
  contactImageUrl: string;
}

const Contact: React.FC<ContactProps> = ({ contactImageUrl }) => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-school-blue sm:text-4xl">
            Get In Touch
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We're here to help. Feel free to reach out with any questions.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-school-blue">Contact Information</h3>
            <div className="mt-6 space-y-4 text-lg text-gray-700">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-school-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Quaid-e-Millat Public School, Ameerabad</span>
              </p>
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-school-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>+92-355-5351324</span>
              </p>
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-school-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>qmpsameerabad@gmail.com</span>
              </p>
            </div>
          </div>
          <div className="bg-gray-200 rounded-lg shadow-md overflow-hidden">
             <img src={contactImageUrl} alt="Quaid-e-Millat Public School building" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;