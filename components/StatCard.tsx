
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, count }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 transform hover:scale-105 transition-transform duration-300">
      <div className="bg-school-blue text-white p-4 rounded-full">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-3xl font-bold text-school-blue">{count.toLocaleString()}+</p>
      </div>
    </div>
  );
};

export default StatCard;
