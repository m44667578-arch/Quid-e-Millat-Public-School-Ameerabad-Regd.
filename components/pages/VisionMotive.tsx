import React from 'react';

const VisionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-school-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const MotiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-school-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);


const VisionMotive: React.FC = () => {
  return (
    <div className="py-20 bg-school-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Vision Section */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
              <VisionIcon />
              <h2 className="ml-4 text-3xl font-bold text-school-blue">Our Vision</h2>
            </div>
            <p className="text-gray-600 text-lg">
              To be a premier educational institution recognized for its excellence in developing knowledgeable, compassionate, and responsible global citizens who are prepared to meet the challenges of the future.
            </p>
          </div>

          {/* Motive Section */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
              <MotiveIcon />
              <h2 className="ml-4 text-3xl font-bold text-school-blue">Our Motive</h2>
            </div>
            <p className="text-gray-600 text-lg">
              Our motive is to cultivate a love for learning by promoting academic excellence, character development, and lifelong learning skills. We foster critical thinking and encourage creativity within a supportive and inclusive community. We aim to empower students with the skills, knowledge, and strong moral values necessary to lead meaningful lives, meet the challenges of a rapidly changing world, and make positive contributions to society.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionMotive;