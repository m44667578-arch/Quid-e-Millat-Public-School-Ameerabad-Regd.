import React, { useState, useEffect, useMemo } from 'react';
import { User, SchoolEvent, Notice, Grade, AdmissionApplication, GalleryItem, ResultSubject, LeadershipMessage, ResultSheet, StructuredResult, SiteImages } from '../../types';

declare const XLSX: any; // Using XLSX from a CDN script

interface PrincipalDashboardProps {
  studentCount: number;
  staffCount: number;
  setStudentCount: (count: number) => void;
  setStaffCount: (count: number) => void;
  pendingUsers: User[];
  onApproveUser: (userId: string) => void;
  onDenyUser: (userId: string) => void;
  approvedUsers: User[];
  events: SchoolEvent[];
  onSaveEvent: (event: SchoolEvent) => void;
  onDeleteEvent: (eventId: number) => void;
  notices: Notice[];
  onPostNotice: (notice: Omit<Notice, 'id'|'date'>) => void;
  resultSheets: ResultSheet[];
  onAddResultSheet: (sheet: ResultSheet) => void;
  onDeleteResultSheet: (sheetId: string) => void;
  admissionApplications: AdmissionApplication[];
  onAcknowledgeAdmission: (applicationId: string) => void;
  galleryItems: GalleryItem[];
  onAddGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  onDeleteGalleryItem: (itemId: number) => void;
  leadershipMessages: LeadershipMessage[];
  onUpdateLeadershipMessage: (message: LeadershipMessage) => void;
  siteImages: SiteImages;
  onUpdateSiteImages: (images: SiteImages) => void;
}

const PrincipalDashboard: React.FC<PrincipalDashboardProps> = (props) => {
  const { 
    studentCount, staffCount, setStudentCount, setStaffCount, pendingUsers, onApproveUser, onDenyUser, 
    approvedUsers, events, onSaveEvent, onDeleteEvent, notices, onPostNotice, resultSheets, onAddResultSheet, onDeleteResultSheet,
    admissionApplications, onAcknowledgeAdmission, galleryItems, onAddGalleryItem, onDeleteGalleryItem, leadershipMessages, onUpdateLeadershipMessage,
    siteImages, onUpdateSiteImages
  } = props;
  
  const [activeTab, setActiveTab] = useState('stats');
  const [statsSaved, setStatsSaved] = useState(false);
  const [localStudents, setLocalStudents] = useState(studentCount);
  const [localStaff, setLocalStaff] = useState(staffCount);
  
  const [eventForm, setEventForm] = useState<Omit<SchoolEvent, 'id'>>({ title: '', date: '', description: '', detailedDescription: '', mediaUrl: '', mediaType: 'image'});
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '' });
  const [resultSheetForm, setResultSheetForm] = useState<{ grade: Grade | '', term: ResultSheet['term'], type: 'image' | 'structured' }>({ grade: '', term: '1st Term', type: 'image' });
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [galleryForm, setGalleryForm] = useState<Omit<GalleryItem, 'id'>>({ src: '', caption: '', mediaType: 'image' });
  const [leadershipForms, setLeadershipForms] = useState<LeadershipMessage[]>(leadershipMessages);
  const [siteImageForms, setSiteImageForms] = useState<SiteImages>(siteImages);

  const [studentGradeFilter, setStudentGradeFilter] = useState<Grade | 'all'>('all');

  const approvedStudents = useMemo(() => approvedUsers.filter(u => u.userType === 'student'), [approvedUsers]);
  const approvedParents = useMemo(() => approvedUsers.filter(u => u.userType === 'parent'), [approvedUsers]);
  const approvedStaff = useMemo(() => approvedUsers.filter(u => u.userType === 'admin'), [approvedUsers]);

  const unacknowledgedAdmissionsCount = useMemo(() => admissionApplications.filter(app => !app.acknowledged).length, [admissionApplications]);

  const filteredApprovedStudents = useMemo(() => {
    if (studentGradeFilter === 'all') return approvedStudents;
    return approvedStudents.filter(s => s.grade === studentGradeFilter);
  }, [studentGradeFilter, approvedStudents]);


  useEffect(() => {
    setLocalStudents(studentCount);
    setLocalStaff(staffCount);
  }, [studentCount, staffCount]);

  useEffect(() => {
    setLeadershipForms(leadershipMessages);
  }, [leadershipMessages]);

   useEffect(() => {
    setSiteImageForms(siteImages);
  }, [siteImages]);

  const handleStatsSave = () => {
    setStudentCount(localStudents);
    setStaffCount(localStaff);
    setStatsSaved(true);
    setTimeout(() => setStatsSaved(false), 3000);
  };

  const handleEventSubmit = (e: React.FormEvent) => { e.preventDefault(); onSaveEvent({ ...eventForm, id: Date.now()}); setEventForm({ title: '', date: '', description: '', detailedDescription: '', mediaUrl: '', mediaType: 'image'}); alert("Event saved successfully!"); };
  const handleNoticeSubmit = (e: React.FormEvent) => { e.preventDefault(); onPostNotice(noticeForm); setNoticeForm({ title: '', content: '' }); alert("Notice posted successfully!"); };
  
  // ---------- Excel header detection & tolerant parsing helpers ----------
  const normalizeHeader = (s: string) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '').trim();

  const getValueFromRow = (row: any, keys: string[]) => {
      const rowKeys = Object.keys(row || {});
      const normMap: Record<string,string> = {};
      rowKeys.forEach(rk => {
          normMap[normalizeHeader(rk)] = rk;
      });
      for (const k of keys) {
          const nk = normalizeHeader(k);
          if (nk in normMap) {
              const actualKey = normMap[nk];
              return row[actualKey];
          }
      }
      for (const rk of rowKeys) {
          const nrk = normalizeHeader(rk);
          for (const k of keys) {
              const nk = normalizeHeader(k);
              if (nrk === nk || nrk.includes(nk) || nk.includes(nrk)) {
                  return row[rk];
              }
          }
      }
      return undefined;
  };

  const handleResultSheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultSheetForm.grade || !resultFile) {
        alert('Please select a grade and a file to upload.');
        return;
    }
    setIsUploading(true);

    const sheetId = `${resultSheetForm.term}-${resultSheetForm.grade}`.replace(/\s+/g, '-').toLowerCase();
    
    let newSheet: ResultSheet = {
        id: sheetId,
        grade: resultSheetForm.grade,
        term: resultSheetForm.term,
        uploadDate: new Date().toLocaleDateString(),
        type: resultSheetForm.type,
    };

    try {
        if (resultSheetForm.type === 'image') {
            const base64Url = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(resultFile);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
            newSheet.sheetUrl = base64Url;
        } else { // structured (Excel)
            const data = await resultFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Read as arrays to detect header row reliably
            const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

            // header detection heuristics
            const headerKeywords = ['student', 'student id', 'studentid', 'name', '%age', 'percentage', 'obtain', 'obtained', 'total', 'marks'];
            const findHeaderRowIndex = (rowsArr: any[][]) => {
              for (let i = 0; i < Math.min(rowsArr.length, 10); i++) {
                const row = rowsArr[i] || [];
                const normalized = row.map((c: any) => (c || '').toString().toLowerCase());
                const hits = headerKeywords.reduce((acc, kw) => acc + (normalized.some((cell: string) => cell.includes(kw)) ? 1 : 0), 0);
                if (hits >= 1) {
                  return i;
                }
              }
              return 1;
            };

            const headerRowIndex = findHeaderRowIndex(rows);
            console.log('Detected header row index:', headerRowIndex, 'Header row preview:', rows[headerRowIndex]);

            const headerRow = (rows[headerRowIndex] || []).map((h: any) => (h || '').toString().trim());
            const dataRows = rows.slice(headerRowIndex + 1);

            const jsonObjects: any[] = dataRows.map((r: any[]) => {
              const obj: any = {};
              headerRow.forEach((h: string, idx: number) => {
                const key = h || `col_${idx}`;
                obj[key] = r[idx];
              });
              return obj;
            });

            console.log('Number of data rows parsed:', jsonObjects.length, 'sample keys:', Object.keys(jsonObjects[0] || {}).slice(0,20));

            const structuredResults: StructuredResult[] = (jsonObjects || []).map((row: any, idx: number) => {
                const studentIdRaw = getValueFromRow(row, ['Student ID', 'StudentID', 'student_id', 'regno', 'roll', 'registration', 'admission']);
                const studentNameRaw = getValueFromRow(row, ['Name of S', 'Student Name', 'StudentName', 'name', 'fullName']);
                const obtainedMarksRaw = getValueFromRow(row, ['Obtain Marks', 'Obtained Marks', 'TotalObtained', 'obtainedmarks']);
                const totalMarksRaw = getValueFromRow(row, ['Total Marks', 'TotalMarksPossible', 'totalmarks']);
                const percentageRaw = getValueFromRow(row, ['%age', 'Percentage', 'percentage']);
                const gradeRaw = getValueFromRow(row, ['Grade']);
                const positionRaw = getValueFromRow(row, ['Possition', 'Position', 'position']);
                const remarksRaw = getValueFromRow(row, ['Remarks', 'remarks']);

                const studentId = studentIdRaw !== undefined && studentIdRaw !== null ? String(studentIdRaw).trim() : '';
                const studentName = studentNameRaw !== undefined && studentNameRaw !== null ? String(studentNameRaw).trim() : '';

                const obtainedMarks = obtainedMarksRaw !== undefined && obtainedMarksRaw !== null ? parseFloat(String(obtainedMarksRaw).replace(/[^0-9.\-]/g,'')) : NaN;
                const totalMarks = totalMarksRaw !== undefined && totalMarksRaw !== null ? parseFloat(String(totalMarksRaw).replace(/[^0-9.\-]/g,'')) : NaN;
                const percentage = percentageRaw !== undefined && percentageRaw !== null ? parseFloat(String(percentageRaw).replace(/[^0-9.\-]/g,'')) : NaN;

                const metadataKeys = new Set([
                    's', 'sno', 's#', 'studentid','studentname','nameof s','fathername','obtainmarks','obtainedmarks','totalobtained','totalmarks','percentage','%age','grade','position','possition','remarks','regno','roll','admission'
                ].map(k => normalizeHeader(k)));

                const subjects: ResultSubject[] = [];
                Object.keys(row).forEach(key => {
                    const nk = normalizeHeader(key);
                    if (!metadataKeys.has(nk)) {
                        const raw = row[key];
                        const val = parseFloat(String(raw || '').replace(/[^0-9.\-]/g,''));
                        if (!isNaN(val)) {
                            subjects.push({
                                name: key,
                                marks: val,
                                totalMarks: 100
                            });
                        }
                    }
                });

                const resultObj: any = {
                    studentId,
                    student_id: studentId,
                    studentName,
                    name: studentName || undefined,
                    fullName: studentName || undefined,
                    subjects,
                    totalMarks: !isNaN(totalMarks) ? totalMarks : (subjects.reduce((s, sub) => s + (sub.totalMarks || 0), 0) || undefined),
                    obtainedMarks: !isNaN(obtainedMarks) ? obtainedMarks : (subjects.reduce((s, sub) => s + (sub.marks || 0), 0) || undefined),
                    percentage: !isNaN(percentage) ? percentage : undefined,
                    grade: gradeRaw ? String(gradeRaw) : undefined,
                    position: positionRaw ? String(positionRaw) : undefined,
                    remarks: remarksRaw ? String(remarksRaw) : undefined,
                    _rawRowIndex: idx + headerRowIndex + 1
                };

                return resultObj as StructuredResult;
            }).filter((r: any) => r.studentId && r.studentId.length > 0);

            console.info('Parsed structured results sample (after header-detect):', structuredResults.slice(0,8));
            newSheet.results = structuredResults;
        }
        
        onAddResultSheet(newSheet);
        alert('Result sheet uploaded successfully!');
        setResultFile(null);
        (document.getElementById('result-file-input') as HTMLInputElement).value = "";
    } catch (error) {
        console.error("Error processing result sheet:", error);
        alert('There was an error processing the file. Please ensure it is in the correct format.');
    } finally {
        setIsUploading(false);
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => callback(loadEvent.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGallerySubmit = (e: React.FormEvent) => { e.preventDefault(); if (!galleryForm.src || !galleryForm.caption) { alert("Please provide a file and a caption."); return; } onAddGalleryItem(galleryForm); setGalleryForm({ src: '', caption: '', mediaType: 'image' }); alert("Item added to gallery!"); };

  const handleLeadershipFormChange = (id: LeadershipMessage['id'], field: 'message' | 'imageUrl', value: string) => {
    setLeadershipForms(prev => prev.map(form => form.id === id ? { ...form, [field]: value } : form));
  };

  const handleLeadershipFormSubmit = (e: React.FormEvent, id: LeadershipMessage['id']) => {
    e.preventDefault();
    const updatedMessage = leadershipForms.find(form => form.id === id);
    if (updatedMessage) {
      onUpdateLeadershipMessage(updatedMessage);
    }
  };
  
  const handleSiteImageChange = (key: keyof SiteImages, value: string | string[]) => {
      setSiteImageForms(prev => ({ ...prev, [key]: value }));
  };

  const handleAddHeroImage = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileUpload(e, (url) => {
          setSiteImageForms(prev => ({ ...prev, heroImageUrls: [...prev.heroImageUrls, url] }));
      });
      e.target.value = ''; // Reset file input
  };
  
  const handleDeleteHeroImage = (index: number) => {
      if (siteImageForms.heroImageUrls.length <= 1) {
          alert("You must have at least one hero image for the slider.");
          return;
      }
      setSiteImageForms(prev => ({ ...prev, heroImageUrls: prev.heroImageUrls.filter((_, i) => i !== index) }));
  };


  const TabButton: React.FC<{tabKey: string; label: string; count?: number;}> = ({ tabKey, label, count }) => (
     <button onClick={() => setActiveTab(tabKey)} className={`py-2 px-4 text-sm sm:text-lg font-medium relative ${activeTab === tabKey ? 'border-b-2 border-school-blue text-school-blue' : 'text-gray-500'}`}>
        {label}
        {count !== undefined && count > 0 && (<span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{count}</span>)}
    </button>
  );

  const renderTabs = () => (
     <div className="mb-8 border-b border-gray-300 flex flex-wrap justify-center">
        <TabButton tabKey="stats" label="Statistics" />
        <TabButton tabKey="users" label="Approve Users" count={pendingUsers.length} />
        <TabButton tabKey="approved_accounts" label="Approved Accounts" />
        <TabButton tabKey="admissions" label="Admissions" count={unacknowledgedAdmissionsCount} />
        <TabButton tabKey="events" label="Events" />
        <TabButton tabKey="notices" label="Notices" />
        <TabButton tabKey="results" label="Results" />
        <TabButton tabKey="gallery" label="Gallery" />
        <TabButton tabKey="leadership" label="Leadership" />
        <TabButton tabKey="content" label="Website Content" />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'stats': return (<div className="card-style"><h3 className="card-title">Manage School Statistics</h3><div className="space-y-4"><div><label className="label-style">Enrolled Students</label><input type="number" className="input-field" value={localStudents} onChange={(e) => setLocalStudents(parseInt(e.target.value, 10) || 0)} /></div><div><label className="label-style">Qualified Staff</label><input type="number" className="input-field" value={localStaff} onChange={(e) => setLocalStaff(parseInt(e.target.value, 10) || 0)} /></div></div>{statsSaved && <div className="success-alert mt-4"><p>Changes saved successfully.</p></div>}<div className="flex justify-end mt-4"><button onClick={handleStatsSave} className="btn-primary">Save Changes</button></div></div>);
      case 'users': return (<div className="card-style"><h3 className="card-title">Pending User Registrations</h3>{pendingUsers.length === 0 ? <p className="text-center text-gray-500">No pending user registrations.</p> : (<ul className="space-y-4">{pendingUsers.map(user => (<li key={user.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center"><div className="flex-grow"><p className="font-bold">{user.fullName} <span className="text-sm font-normal text-gray-500 capitalize">({user.userType})</span></p><p className="text-sm text-gray-600">{user.email}</p>{user.grade && <p className="text-sm text-gray-500">Grade: {user.grade}</p>}{user.childStudentIds && <p className="text-sm text-gray-500">Child IDs: {user.childStudentIds.join(', ')}</p>}</div><div className="flex space-x-2 mt-4 sm:mt-0 self-end sm:self-center flex-shrink-0"><button onClick={() => onApproveUser(user.id)} className="btn-success">Approve</button><button onClick={() => onDenyUser(user.id)} className="btn-danger">Deny</button></div></li>))}</ul>)}</div>);
      case 'approved_accounts': return (
        <div className="card-style space-y-8">
            <div><h3 className="card-title">Approved User Accounts</h3></div>
            <div className="space-y-2"><div className="flex justify-between items-center"><h4 className="font-bold text-xl text-gray-800">Students</h4><select value={studentGradeFilter} onChange={e => setStudentGradeFilter(e.target.value as Grade | 'all')} className="input-field w-auto"><option value="all">All Grades</option>{Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}</select></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-100 text-left"><th className="p-2">Name</th><th className="p-2">Student ID</th><th className="p-2">Grade</th><th className="p-2">Email</th><th className="p-2">Password</th></tr></thead><tbody>{filteredApprovedStudents.map(u=><tr key={u.id} className="border-b"><td className="p-2">{u.fullName}</td><td className="p-2">{u.studentId}</td><td className="p-2">{u.grade}</td><td className="p-2">{u.email}</td><td className="p-2">{u.password}</td></tr>)}</tbody></table></div></div>
            <div className="space-y-2"><h4 className="font-bold text-xl text-gray-800">Parents</h4><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-100 text-left"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Child ID(s)</th><th className="p-2">Password</th></tr></thead><tbody>{approvedParents.map(u=><tr key={u.id} className="border-b"><td className="p-2">{u.fullName}</td><td className="p-2">{u.email}</td><td className="p-2">{u.childStudentIds?.join(', ')}</td><td className="p-2">{u.password}</td></tr>)}</tbody></table></div></div>
            <div className="space-y-2"><h4 className="font-bold text-xl text-gray-800">Staff</h4><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-100 text-left"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Password</th></tr></thead><tbody>{approvedStaff.map(u=><tr key={u.id} className="border-b"><td className="p-2">{u.fullName}</td><td className="p-2">{u.email}</td><td className="p-2">{u.password}</td></tr>)}</tbody></table></div></div>
        </div>
      );
      case 'events': return (<div className="space-y-8"><div className="card-style"><h3 className="card-title">Add New Event</h3><form onSubmit={handleEventSubmit} className="space-y-4"><input name="title" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} placeholder="Event Title" className="input-field" required /><input name="date" type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="input-field" required /><textarea name="description" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} placeholder="Short Description" className="input-field" rows={2} required /><textarea name="detailedDescription" value={eventForm.detailedDescription} onChange={e => setEventForm({...eventForm, detailedDescription: e.target.value})} placeholder="Detailed Description" className="input-field" rows={4} required /><select name="mediaType" value={eventForm.mediaType} onChange={e => setEventForm({...eventForm, mediaType: e.target.value as 'image'|'video'})} className="input-field"><option value="image">Image</option><option value="video">Video</option></select><input type="file" onChange={(e) => handleFileUpload(e, (url) => setEventForm({...eventForm, mediaUrl: url}))} className="input-field" accept={eventForm.mediaType === 'image' ? 'image/*' : 'video/*'} /><div className="flex justify-end"><button type="submit" className="btn-primary">Add Event</button></div></form></div><div className="card-style"><h3 className="card-title">Manage Existing Events</h3><ul className="space-y-3">{events.map(event => (<li key={event.id} className="flex justify-between items-center p-3 border rounded-md"><span>{event.title} ({event.date})</span><button onClick={() => onDeleteEvent(event.id)} className="btn-danger">Delete</button></li>))}</ul></div></div>);
      case 'admissions': return (<div className="card-style"><h3 className="card-title">New Admission Applications</h3>{admissionApplications.length === 0 ? <p className="text-center text-gray-500">No new admission applications.</p> : (<div className="space-y-4">{admissionApplications.map(app => (<div key={app.id} className={`p-4 border rounded-lg ${app.acknowledged ? 'bg-green-50' : 'bg-white'}`}><div className="flex justify-between items-start"><div className="flex-grow"><p className="font-bold">{app.fullName} <span className="text-sm font-normal text-gray-500">- Submitted: {app.submissionDate}</span></p><p><strong>Grade Applied for:</strong> {app.grade}</p><p><strong>Guardian:</strong> {app.guardianName}</p><p><strong>Contact:</strong> {app.email} | {app.whatsappNumber}</p></div><button onClick={() => onAcknowledgeAdmission(app.id)} disabled={app.acknowledged} className={`btn-secondary text-sm ${app.acknowledged ? 'opacity-50 cursor-not-allowed' : ''}`}>{app.acknowledged ? 'Acknowledged' : 'Acknowledge'}</button></div></div>))}</div>)}</div>);
      case 'notices': return (<div className="card-style"><h3 className="card-title">Post New Notice</h3><form onSubmit={handleNoticeSubmit} className="space-y-4"><input value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} placeholder="Notice Title" className="input-field" required/><textarea value={noticeForm.content} onChange={e => setNoticeForm({...noticeForm, content: e.target.value})} placeholder="Notice Content" className="input-field" rows={5} required/><div className="flex justify-end"><button type="submit" className="btn-primary">Post Notice</button></div></form></div>);
      case 'results': return (
        <div className="space-y-8">
            <div className="card-style">
                <h3 className="card-title">Upload Result Sheet</h3>
                <form onSubmit={handleResultSheetSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="label-style">Term</label><select value={resultSheetForm.term} onChange={e => setResultSheetForm({...resultSheetForm, term: e.target.value as ResultSheet['term']})} className="input-field"><option>1st Term</option><option>2nd Term</option><option>Final Term</option><option>Monthly Test</option></select></div>
                        <div><label className="label-style">Grade</label><select value={resultSheetForm.grade} onChange={e => setResultSheetForm({...resultSheetForm, grade: e.target.value as Grade})} className="input-field" required><option value="">-- Select Grade --</option>{Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                        <div><label className="label-style">Upload Type</label><select value={resultSheetForm.type} onChange={e => setResultSheetForm({...resultSheetForm, type: e.target.value as 'image' | 'structured'})} className="input-field"><option value="image">Image of Sheet</option><option value="structured">Excel Data File</option></select></div>
                    </div>
                    <div>
                        <label className="label-style">Upload File</label>
                        <input id="result-file-input" type="file" onChange={e => setResultFile(e.target.files ? e.target.files[0] : null)} className="input-field" accept={resultSheetForm.type === 'image' ? 'image/*' : '.xlsx, .xls'} required />
                    </div>
                    {resultSheetForm.type === 'structured' && (
                        <div className="text-sm p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                            <p className="font-bold">Excel File Format Instructions:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>The first row of your Excel sheet must be the column headers.</li>
                                <li>Essential columns are: <strong>`Student ID`</strong>, <strong>`Name of S`</strong> (or `Student Name`), <strong>`Obtain Marks`</strong>, <strong>`Total Marks`</strong>, <strong>`%age`</strong>, <strong>`Grade`</strong>, <strong>`Possition`</strong> (or `Position`), and <strong>`Remarks`</strong>.</li>
                                <li>Column names can vary slightly (e.g., `Student ID` or `StudentID` are both fine).</li>
                                <li>All other columns with numeric values (e.g., `Math`, `Urdu`, `Science`) will be automatically detected as subjects.</li>
                                <li>Ensure the <strong>`Student ID`</strong> for each student matches the official ID assigned by the school.</li>
                            </ul>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button type="submit" className="btn-primary" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Upload Sheet'}</button>
                    </div>
                </form>
            </div>
             <div className="card-style"><h3 className="card-title">Manage Uploaded Results</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100"><tr><th className="p-2">Term</th><th className="p-2">Grade</th><th className="p-2">Type</th><th className="p-2">Date</th><th className="p-2">Actions</th></tr></thead>
                        <tbody>{resultSheets.map(sheet => <tr key={sheet.id} className="border-b"><td className="p-2">{sheet.term}</td><td className="p-2">{sheet.grade}</td><td className="p-2 capitalize">{sheet.type}</td><td className="p-2">{sheet.uploadDate}</td><td className="p-2"><button onClick={() => onDeleteResultSheet(sheet.id)} className="btn-danger text-xs">Delete</button></td></tr>)}</tbody>
                    </table>
                </div>
             </div>
        </div>
      );
      case 'gallery': return (<div className="space-y-8"><div className="card-style"><h3 className="card-title">Add to Gallery</h3><form onSubmit={handleGallerySubmit} className="space-y-4"><div><label className="label-style">Caption</label><input value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} placeholder="E.g., Sports Day 2024" className="input-field" required /></div><div><label className="label-style">Media Type</label><select value={galleryForm.mediaType} onChange={e => setGalleryForm({...galleryForm, mediaType: e.target.value as 'image'|'video'})} className="input-field"><option value="image">Image</option><option value="video">Video</option></select></div><div><label className="label-style">Upload File</label><input type="file" onChange={e => handleFileUpload(e, url => setGalleryForm({...galleryForm, src: url}))} className="input-field" accept={galleryForm.mediaType === 'image' ? 'image/*' : 'video/*'} required /></div>{galleryForm.src && (galleryForm.mediaType === 'image' ? <img src={galleryForm.src} alt="Preview" className="w-40 h-auto rounded-md" /> : <video src={galleryForm.src} className="w-40 h-auto rounded-md" />)}<div className="flex justify-end"><button type="submit" className="btn-primary">Add Item</button></div></form></div><div className="card-style"><h3 className="card-title">Manage Gallery</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{galleryItems.map(item => (<div key={item.id} className="relative group"><img src={item.mediaType === 'image' ? item.src : 'https://placehold.co/500x500/0D244F/B8860B?text=Video'} alt={item.caption} className="w-full h-32 object-cover rounded-md" /><div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => onDeleteGalleryItem(item.id)} className="btn-danger">Delete</button></div></div>))}</div></div></div>);
      case 'leadership': return (
        <div className="card-style space-y-8">
            <h3 className="card-title">Edit Leadership Messages</h3>
            {leadershipForms.map(leader => (
            <form key={leader.id} onSubmit={(e) => handleLeadershipFormSubmit(e, leader.id)} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                <h4 className="font-bold text-xl text-gray-800">{leader.title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="flex justify-center">
                        <img src={leader.imageUrl} alt={leader.name} className="w-24 h-24 rounded-full object-cover shadow-md"/>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="label-style">Change Image</label>
                        <input type="file" onChange={(e) => handleFileUpload(e, (url) => handleLeadershipFormChange(leader.id, 'imageUrl', url))} className="input-field" accept="image/*" />
                        <p className="text-xs text-gray-500 mt-1">Upload a new photo to replace the current one.</p>
                    </div>
                </div>
                <div>
                <label className="label-style">Message</label>
                <textarea 
                    value={leader.message} 
                    onChange={(e) => handleLeadershipFormChange(leader.id, 'message', e.target.value)} 
                    className="input-field" 
                    rows={4}
                    required 
                />
                </div>
                <div className="flex justify-end">
                <button type="submit" className="btn-primary">Save for {leader.name}</button>
                </div>
            </form>
            ))}
        </div>
      );
      case 'content': return (
        <div className="card-style space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="card-title">Manage Website Content</h3>
                    <p className="text-sm text-gray-500 -mt-4 mb-4">Control the main images displayed across the website.</p>
                </div>
                <button onClick={() => onUpdateSiteImages(siteImageForms)} className="btn-primary">Save All Changes</button>
            </div>

            {/* Logo */}
            <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-bold text-xl text-gray-800 mb-4">School Logo</h4>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <img src={siteImageForms.logoUrl} alt="Current Logo" className="w-24 h-24 object-contain rounded-full bg-white shadow-md" />
                    <div className="flex-grow">
                        <label className="label-style">Upload New Logo</label>
                        <input type="file" onChange={(e) => handleFileUpload(e, (url) => handleSiteImageChange('logoUrl', url))} className="input-field" accept="image/*" />
                        <p className="text-xs text-gray-500 mt-1">Recommended: A square image with a transparent background (PNG).</p>
                    </div>
                </div>
            </div>

            {/* Hero Images */}
            <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-bold text-xl text-gray-800 mb-2">Home Page Slider Images</h4>
                 <p className="text-sm text-gray-500 mb-4">These images will rotate automatically on the home page. Add at least two for the slider effect.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {siteImageForms.heroImageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                            <img src={url} alt={`Hero Image ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDeleteHeroImage(index)} className="btn-danger">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    <label className="label-style">Add New Hero Image</label>
                    <input type="file" onChange={handleAddHeroImage} className="input-field" accept="image/*" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* About Page Image */}
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-bold text-xl text-gray-800 mb-4">About Us Page Image</h4>
                    <div className="flex flex-col items-center gap-4">
                        <img src={siteImageForms.aboutImageUrl} alt="About Us" className="w-full h-40 object-cover rounded-md shadow-md" />
                        <div>
                            <label className="label-style">Upload New Image</label>
                            <input type="file" onChange={(e) => handleFileUpload(e, (url) => handleSiteImageChange('aboutImageUrl', url))} className="input-field" accept="image/*" />
                        </div>
                    </div>
                </div>

                {/* Contact Page Image */}
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-bold text-xl text-gray-800 mb-4">Contact Page Image</h4>
                    <div className="flex flex-col items-center gap-4">
                        <img src={siteImageForms.contactImageUrl} alt="Contact" className="w-full h-40 object-cover rounded-md shadow-md" />
                        <div>
                            <label className="label-style">Upload New Image</label>
                            <input type="file" onChange={(e) => handleFileUpload(e, (url) => handleSiteImageChange('contactImageUrl', url))} className="input-field" accept="image/*" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="py-12 sm:py-20 bg-gray-100 min-h-[calc(100vh-192px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-school-blue mb-8">Principal Dashboard</h1>
        {renderTabs()}
        <div className="animate-fade-in">{renderContent()}</div>
      </div>
       <style>{`
        .input-field { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; transition: border-color 0.2s; }
        .input-field:focus { outline: none; border-color: #0D244F; }
        .label-style { display: block; margin-bottom: 4px; font-weight: 500; color: #374151; }
        .card-style { padding: 2rem; background-color: white; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
        .card-title { font-size: 1.25rem; font-weight: 700; color: #1F2937; margin-bottom: 1.5rem; }
        .btn-primary { padding: 10px 16px; border: none; font-weight: 500; border-radius: 6px; color: white; background-color: #0D244F; transition: background-color 0.2s; } .btn-primary:hover { background-color: #1a3a75; } .btn-primary:disabled { background-color: #6B7280; cursor: not-allowed; }
        .btn-secondary { padding: 8px 12px; border: 1px solid #ccc; font-weight: 500; border-radius: 6px; color: #374151; background-color: #F9FAFB; } .btn-secondary:hover { background-color: #F3F4F6; }
        .btn-success { padding: 6px 10px; font-size: 0.875rem; border-radius: 6px; color: white; background-color: #10B981; } .btn-success:hover { background-color: #059669; }
        .btn-danger { padding: 6px 10px; font-size: 0.875rem; border-radius: 6px; color: white; background-color: #EF4444; } .btn-danger:hover { background-color: #DC2626; }
        .success-alert { border-left: 4px solid #10B981; background-color: #D1FAE5; color: #065F46; padding: 1rem; }
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
       `}</style>
    </div>
  );
};

export default PrincipalDashboard;