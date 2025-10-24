
import React, { useState, useEffect } from 'react';

interface AdminPanelProps {
  studentCount: number;
  staffCount: number;
  setStudentCount: (count: number) => void;
  setStaffCount: (count: number) => void;
  navigateToHome: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  studentCount,
  staffCount,
  setStudentCount,
  setStaffCount,
  navigateToHome
}) => {
  const [localStudents, setLocalStudents] = useState(studentCount);
  const [localStaff, setLocalStaff] = useState(staffCount);
  const [isSaved, setIsSaved] = useState(false);
  
  useEffect(() => {
    setLocalStudents(studentCount);
    setLocalStaff(staffCount);
  }, [studentCount, staffCount]);

  const handleSave = () => {
    setStudentCount(localStudents);
    setStaffCount(localStaff);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
  };
  
  const handleCancel = () => {
    navigateToHome();
  }

  return (
    <div className="py-20 bg-gray-100 min-h-[calc(100vh-250px)] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg space-y-6">
        <div>
            <h2 className="text-center text-3xl font-extrabold text-school-blue">
                Principal Admin Panel
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
                Update school statistics
            </p>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="student-count" className="block text-sm font-medium text-gray-700">
              Enrolled Students
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="student-count"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-school-blue focus:border-school-blue sm:text-sm"
                value={localStudents}
                onChange={(e) => setLocalStudents(parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="staff-count" className="block text-sm font-medium text-gray-700">
              Qualified Staff
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="staff-count"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-school-blue focus:border-school-blue sm:text-sm"
                value={localStaff}
                onChange={(e) => setLocalStaff(parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>
        </div>
        
        {isSaved && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Changes saved successfully.</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
           <button
            onClick={handleCancel}
            className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Site
          </button>
          <button
            onClick={handleSave}
            className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-school-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-school-blue"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
