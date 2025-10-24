import React from 'react';

interface ProgressData {
  term: string;
  percentage: number;
}

interface ProgressGraphProps {
  data: ProgressData[];
  studentName: string;
}

const ProgressGraph: React.FC<ProgressGraphProps> = ({ data, studentName }) => {
  if (data.length < 2) {
    return null; // Don't show graph for less than 2 data points
  }

  const maxValue = 100; // Percentage max

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8 animate-fade-in">
      <h3 className="text-xl font-bold text-school-blue text-center mb-6">
        Academic Progress for {studentName}
      </h3>
      <div className="flex justify-around items-end h-64 space-x-2 sm:space-x-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 h-full">
            <div className="w-full flex items-end justify-center bg-blue-100 rounded-t-lg h-full">
              <div
                className="w-4/5 bg-school-blue rounded-t-lg flex items-start justify-center transition-all duration-700 ease-out"
                style={{ height: `${(item.percentage / maxValue) * 100}%` }}
                title={`${item.percentage.toFixed(2)}%`}
              >
                 <div className="text-white text-xs sm:text-sm font-bold text-center pt-1 px-1">{item.percentage.toFixed(1)}%</div>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-700 text-center">{item.term}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressGraph;
