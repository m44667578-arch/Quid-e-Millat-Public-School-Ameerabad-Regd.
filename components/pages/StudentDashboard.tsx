import React, { useMemo } from 'react';
import { User, Complaint, ResultSheet, StructuredResult } from '../../types';
import ProgressGraph from '../ProgressGraph';
import { normalizeId } from '../../utils/string';

// ---------- Helpers for robust matching & normalization ----------
const normalizeHeaderKey = (s: string | undefined | null) =>
  (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '').trim();

export const getResultStudentId = (r: any): string | null => {
  if (!r) return null;
  // try common keys and nested shapes
  const candidates = [
    r.studentId, r.student_id, r.id, r.roll, r.regno, r.registration, r.admission,
    r.studentName, r.name, r.fullName
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim() !== '') return normalizeId(c);
    if (typeof c === 'number') return normalizeId(String(c));
  }
  // nested shapes (e.g., r.data)
  if (r.data) return getResultStudentId(r.data);
  return null;
};

const normalizeResultForUI = (r: any) => {
  // subjects detection: prefer explicit r.subjects, else extract numeric columns
  const subjects =
    r.subjects ||
    r.data?.subjects ||
    (Array.isArray(r.subjects) ? r.subjects : (
      Object.keys(r || {})
        .filter(k => {
          const nk = k.toString().toLowerCase();
          return ![
            'studentid','student_id','studentname','name','fullname','percentage','grade','remarks','position','totalmarks','obtainedmarks','data','studentname'
          ].includes(nk);
        })
        .map(k => {
          const val = r[k];
          const marks = typeof val === 'number' ? val : parseFloat(String(val || '').replace(/[^0-9.\-]/g,'')) || 0;
          return { name: k, marks, totalMarks: 100 };
        })
    ));

  const studentId = getResultStudentId(r);
  const fullName = r.fullName || r.name || r.data?.name || r.studentName || '';
  const percentage = (typeof r.percentage === 'number') ? r.percentage : (r.data && typeof r.data.percentage === 'number' ? r.data.percentage : NaN);
  const obtainedMarks = (typeof r.obtainedMarks === 'number')
    ? r.obtainedMarks
    : (r.data && typeof r.data.obtainedMarks === 'number'
      ? r.data.obtainedMarks
      : (subjects ? subjects.reduce((s:any,x:any)=> s + (x.marks||0), 0) : undefined));
  const totalMarks = (typeof r.totalMarks === 'number')
    ? r.totalMarks
    : (r.data && typeof r.data.totalMarks === 'number'
      ? r.data.totalMarks
      : (subjects ? subjects.reduce((s:any,x:any)=> s + (x.totalMarks||0), 0) : undefined));

  return {
    ...r,
    studentId,
    fullName,
    percentage,
    obtainedMarks,
    totalMarks,
    subjects
  };
};

// ---------------- Student Dashboard component ----------------
interface StudentDashboardProps {
    user: User;
    resultSheets: ResultSheet[];
    complaints: Complaint[];
}

const StructuredResultCard: React.FC<{ result: StructuredResult, term: string, uploadDate: string }> = ({ result, term, uploadDate }) => {
    return (
        <div className="border rounded-lg p-4 bg-white shadow animate-fade-in">
            <h3 className="font-bold text-xl text-school-blue">{term}</h3>
            <p className="text-sm text-gray-500 mb-4">Uploaded: {uploadDate}</p>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm mb-4">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2">Subject</th>
                            <th className="p-2">Marks Obtained</th>
                            <th className="p-2">Total Marks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.subjects.map((s, i) => (
                            <tr key={i} className="border-b">
                                <td className="p-2 font-medium">{s.name}</td>
                                <td className="p-2">{s.marks}</td>
                                <td className="p-2">{s.totalMarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-sm font-semibold text-gray-600">Total Marks</p>
                    <p className="font-bold text-lg text-school-blue">{result.obtainedMarks} / {result.totalMarks}</p>
                </div>
                 <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-sm font-semibold text-gray-600">Percentage</p>
                    <p className="font-bold text-lg text-school-blue">{(result.percentage || 0).toFixed(2)}%</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-sm font-semibold text-gray-600">Grade</p>
                    <p className="font-bold text-lg text-school-blue">{result.grade}</p>
                </div>
                 <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-sm font-semibold text-gray-600">Position</p>
                    <p className="font-bold text-lg text-school-blue">{result.position}</p>
                </div>
            </div>
             <div className="mt-4 bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-semibold text-gray-800">Remarks: <span className="font-normal">{result.remarks}</span></p>
            </div>
        </div>
    );
};

const ImageResultCard: React.FC<{ sheet: ResultSheet }> = ({ sheet }) => {
    return (
        <div className="border rounded-lg p-4 bg-white shadow animate-fade-in">
            <h3 className="font-bold text-xl text-school-blue">{sheet.term}</h3>
            <p className="text-sm text-gray-500 mb-4">Uploaded: {sheet.uploadDate}</p>
            <div>
                <img src={sheet.sheetUrl} alt={`Result sheet for ${sheet.term}`} className="w-full h-auto rounded-md border" />
            </div>
        </div>
    )
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, resultSheets, complaints }) => {
    const progressData = useMemo(() => {
        const normalizedUserId = normalizeId(user.studentId);
        const out: { term: ResultSheet['term']; percentage: number }[] = [];

        for (const sheet of resultSheets) {
            try {
                // FIX: Removed checks for 'structured_result' and 'table' as they are not part of the ResultSheet type.
                if (sheet.type === 'structured') {
                    if (!sheet.results || !Array.isArray(sheet.results)) continue;
                    const found = sheet.results.find((r: any) => getResultStudentId(r) === normalizedUserId);
                    if (found) {
                        // FIX: Cast 'found' to 'any' to allow accessing 'data' property, preserving original author's intent for handling potentially nested data.
                        const pct = typeof found.percentage === 'number'
                            ? found.percentage
                            : ((found as any).data && typeof (found as any).data.percentage === 'number' ? (found as any).data.percentage : NaN);
                        if (!isNaN(pct)) out.push({ term: sheet.term, percentage: pct });
                    }
                // FIX: Removed check for 'photo' as it is not part of the ResultSheet type.
                } else if (sheet.type === 'image') {
                    const found = sheet.results?.find((r: any) => getResultStudentId(r) === normalizedUserId);
                    if (found && !isNaN(found.percentage)) out.push({ term: sheet.term, percentage: found.percentage });
                } else {
                    const found = Array.isArray(sheet.results) ? sheet.results.find((r:any) => getResultStudentId(r) === normalizedUserId) : null;
                    if (found && !isNaN(found.percentage)) out.push({ term: sheet.term, percentage: found.percentage });
                }
            } catch (e) {
                console.error('Error scanning sheet for progressData', sheet, e);
            }
        }

        const termOrder = ['1st Term', '2nd Term', 'Monthly Test', 'Final Term'];
        out.sort((a, b) => (termOrder.indexOf(a.term) - termOrder.indexOf(b.term)));
        return out;
    }, [resultSheets, user.studentId]);

    const validResults = useMemo(() => {
        const normalizedUserId = normalizeId(user.studentId);
        return resultSheets.map(sheet => {
            // FIX: Removed checks for 'structured_result' and 'table' as they are not part of the ResultSheet type.
            if (sheet.type === 'structured') {
                const found = Array.isArray(sheet.results) ? sheet.results.find((r: any) => getResultStudentId(r) === normalizedUserId) : null;
                return found ? { ...sheet, results: [normalizeResultForUI(found)] } : null;
            // FIX: Removed check for 'photo' as it is not part of the ResultSheet type.
            } else if (sheet.type === 'image') {
                if (!sheet.results) return sheet;
                const found = sheet.results.find((r: any) => getResultStudentId(r) === normalizedUserId);
                return found ? { ...sheet, results: [normalizeResultForUI(found)] } : null;
            }
            const found = Array.isArray(sheet.results) ? sheet.results.find((r:any) => getResultStudentId(r) === normalizedUserId) : null;
            return found ? { ...sheet, results: [normalizeResultForUI(found)] } : null;
        }).filter((sheet): sheet is ResultSheet => sheet !== null);
    }, [resultSheets, user.studentId]);

    return (
        <div className="py-12 sm:py-20 bg-gray-50 min-h-[calc(100vh-192px)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h1 className="text-3xl font-bold text-school-blue">Welcome, {user.fullName}!</h1>
                    <p className="mt-4 text-lg text-gray-600">This is your Student Dashboard.</p>
                    <p className="mt-2 text-gray-500">Student ID: <strong>{user.studentId}</strong> | Grade: <strong>{user.grade}</strong></p>
                </div>

                {/* Complaints Section */}
                {complaints.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-red-800 mb-4">Urgent: Teacher Complaints</h2>
                        <div className="space-y-4">
                            {complaints.map(c => (
                                <div key={c.id} className="p-4 bg-white border rounded-md">
                                    <p className="font-bold">From: {c.teacherName} <span className="text-sm font-normal text-gray-500">({c.date})</span></p>
                                    {c.type === 'text' ? (
                                        <p className="mt-2 text-gray-700" dir={c.language === 'urdu' ? 'rtl' : 'ltr'}>{c.message}</p>
                                    ) : (
                                        c.audioUrl && <audio controls src={c.audioUrl} className="mt-2 w-full sm:w-auto" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Results Section */}
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Your Academic Results</h2>
                    {progressData.length > 1 && <ProgressGraph data={progressData} studentName={user.fullName} />}
                     {validResults.length > 0 ? (
                        <div className="space-y-6">
                           {validResults.map((sheet) => {
                                const key = (sheet as any).id ?? (sheet as any).upload_id ?? sheet.term ?? Math.random();
                                // FIX: Removed check for 'photo' as it is not part of the ResultSheet type.
                                if (sheet.type === 'image') {
                                    return <ImageResultCard key={key} sheet={sheet} />;
                                }
                                const studentResult = sheet.results?.[0];
                                if (studentResult) {
                                    return <StructuredResultCard key={key} result={studentResult} term={sheet.term} uploadDate={sheet.uploadDate} />;
                                }
                                return null;
                           })}
                        </div>
                    ) : (
                         <p className="text-center text-gray-500">No results have been uploaded yet.</p>
                    )}
                </div>

                {/* Homework Section (Placeholder) */}
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Homework Status</h2>
                    <p className="text-center text-gray-500">Homework tracking will be available here soon.</p>
                </div>

            </div>
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }`}</style>
        </div>
    );
};

export default StudentDashboard;