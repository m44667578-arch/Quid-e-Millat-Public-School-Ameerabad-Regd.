import React, { useState } from 'react';
import { Grade, AdmissionApplication } from '../../types';

interface AdmissionProps {
  onAdmissionSubmit: (application: Omit<AdmissionApplication, 'id' | 'submissionDate'>) => void;
}

const Admission: React.FC<AdmissionProps> = ({ onAdmissionSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    guardianName: '',
    dob: '',
    grade: Grade.PlayGroup,
    previousSchool: '',
    address: '',
    whatsappNumber: '',
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdmissionSubmit(formData);
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-school-blue sm:text-4xl">Online Admission Application</h2>
          <p className="mt-4 text-lg text-gray-600">
            Take the first step towards joining our school community. Please fill out the form below.
          </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label htmlFor="fullName" className="label-style">Student's Full Name</label><input id="fullName" name="fullName" type="text" onChange={handleInputChange} required className="input-field" /></div>
              <div><label htmlFor="guardianName" className="label-style">Parent/Guardian's Name</label><input id="guardianName" name="guardianName" type="text" onChange={handleInputChange} required className="input-field" /></div>
              <div><label htmlFor="dob" className="label-style">Date of Birth</label><input id="dob" name="dob" type="date" onChange={handleInputChange} required className="input-field" /></div>
              <div><label htmlFor="grade" className="label-style">Grade Applying For</label><select id="grade" name="grade" value={formData.grade} onChange={handleInputChange} required className="input-field">{Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}</select></div>
              <div><label htmlFor="whatsappNumber" className="label-style">WhatsApp Number</label><input id="whatsappNumber" name="whatsappNumber" type="tel" onChange={handleInputChange} required className="input-field" /></div>
              <div><label htmlFor="email" className="label-style">Email Address</label><input id="email" name="email" type="email" onChange={handleInputChange} required className="input-field" /></div>
            </div>
            <div><label htmlFor="previousSchool" className="label-style">Previous School (if any)</label><input id="previousSchool" name="previousSchool" type="text" onChange={handleInputChange} className="input-field" /></div>
            <div><label htmlFor="address" className="label-style">Full Residential Address</label><textarea id="address" name="address" rows={3} onChange={handleInputChange} required className="input-field" /></div>
            <div className="pt-4 flex justify-end">
              <button type="submit" className="bg-school-blue text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors">Submit Application</button>
            </div>
          </form>
        </div>
      </div>
       <style>{`
        .input-field { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; transition: border-color 0.2s; background-color: #f9fafb; }
        .input-field:focus { outline: none; border-color: #0D244F; ring: 1; ring-color: #0D244F; }
        .label-style { display: block; margin-bottom: 6px; font-weight: 500; color: #374151; }
       `}</style>
    </div>
  );
};

export default Admission;
