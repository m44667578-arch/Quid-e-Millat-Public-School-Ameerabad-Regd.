import React, { useState, useRef, useMemo, useEffect } from 'react';
import { User, Notice, SchoolEvent, Complaint, Grade, GalleryItem } from '../../types';

interface TeacherDashboardProps {
    user: User;
    notices: Notice[];
    events: SchoolEvent[];
    onAddComplaint: (complaint: Omit<Complaint, 'id'|'date'|'teacherName'>) => void;
    approvedStudents: User[];
    onSaveEvent: (event: SchoolEvent) => void;
    onPostNotice: (notice: Omit<Notice, 'id'|'date'>) => void;
    onAddGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = (props) => {
    const { user, notices, events, onAddComplaint, approvedStudents, onSaveEvent, onPostNotice, onAddGalleryItem } = props;
    const [activeTab, setActiveTab] = useState('notices');
    
    // Complaint form state
    const [complaintForm, setComplaintForm] = useState({ studentId: '', message: '', language: 'english' });
    const [complaintType, setComplaintType] = useState<'text' | 'voice'>('text');
    const [selectedGrade, setSelectedGrade] = useState<Grade | ''>('');
    
    // Content creation forms
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '' });
    const [eventForm, setEventForm] = useState<Omit<SchoolEvent, 'id'>>({ title: '', date: '', description: '', detailedDescription: '', mediaUrl: '', mediaType: 'image'});
    const [galleryForm, setGalleryForm] = useState<Omit<GalleryItem, 'id'>>({ src: '', caption: '', mediaType: 'image' });
    
    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | undefined>();
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        setComplaintForm(prev => ({ ...prev, studentId: '' }));
    }, [selectedGrade]);

    const filteredStudentsByGrade = useMemo(() => {
        if (!selectedGrade) return [];
        return approvedStudents.filter(s => s.grade === selectedGrade);
    }, [selectedGrade, approvedStudents]);

    const handleStartRecording = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        setAudioUrl(reader.result as string);
                    };
                    audioChunksRef.current = [];
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone. Please check permissions.");
            }
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
    const handleComplaintSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const student = approvedStudents.find(s => s.studentId === complaintForm.studentId);
        if (!student) { alert("Please select a valid student."); return; }
        if (complaintType === 'text' && !complaintForm.message.trim()) { alert("Please enter a complaint message."); return; }
        if (complaintType === 'voice' && !audioUrl) { alert("Please record a voice message."); return; }

        const newComplaint: Omit<Complaint, 'id' | 'date' | 'teacherName'> = { studentId: student.studentId!, studentName: student.fullName, type: complaintType, message: complaintType === 'text' ? complaintForm.message : 'Voice Message', language: complaintForm.language === 'urdu' ? 'urdu' : 'english', audioUrl: audioUrl };
        onAddComplaint(newComplaint);
        setComplaintForm({ studentId: '', message: '', language: 'english' });
        setAudioUrl(undefined);
        setSelectedGrade('');
        alert("Complaint has been filed successfully.");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => callback(loadEvent.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleNoticeSubmit = (e: React.FormEvent) => { e.preventDefault(); onPostNotice(noticeForm); setNoticeForm({ title: '', content: '' }); alert("Notice posted successfully!"); };
    const handleEventSubmit = (e: React.FormEvent) => { e.preventDefault(); onSaveEvent({ ...eventForm, id: Date.now()}); setEventForm({ title: '', date: '', description: '', detailedDescription: '', mediaUrl: '', mediaType: 'image'}); alert("Event added successfully!"); };
    const handleGallerySubmit = (e: React.FormEvent) => { e.preventDefault(); if (!galleryForm.src || !galleryForm.caption) { alert("Please provide an image and a caption."); return; } onAddGalleryItem(galleryForm); setGalleryForm({ src: '', caption: '', mediaType: 'image' }); alert("Image added to gallery!"); };

    const TabButton: React.FC<{tabKey: string; label: string;}> = ({ tabKey, label }) => (
        <button onClick={() => setActiveTab(tabKey)} className={`py-2 px-4 text-sm sm:text-base font-medium ${activeTab === tabKey ? 'border-b-2 border-school-blue text-school-blue' : 'text-gray-500'}`}>{label}</button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'notices': return (
                <div className="space-y-8">
                    <div className="card-style"><h3 className="card-title">School Notices</h3>{notices.length > 0 ? <ul className="space-y-3">{notices.map(n => <li key={n.id} className="p-3 border rounded-md"><strong>{n.title}</strong><p className="text-sm text-gray-600">{n.content}</p><p className="text-xs text-gray-400 mt-1">{n.date}</p></li>)}</ul> : <p>No notices found.</p>}</div>
                    <div className="card-style"><h3 className="card-title">Upcoming Events</h3>{events.length > 0 ? <ul className="space-y-3">{events.map(e => <li key={e.id} className="p-3 border rounded-md"><strong>{e.title}</strong> ({e.date})<p className="text-sm text-gray-600">{e.description}</p></li>)}</ul> : <p>No events found.</p>}</div>
                </div>
            );
            case 'complaint': return (
                <div className="card-style">
                    <h3 className="card-title">File a Complaint</h3>
                    <form onSubmit={handleComplaintSubmit} className="space-y-4">
                        <div><label className="label-style">Select Grade</label><select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value as Grade)} className="input-field" required><option value="">-- Select Grade --</option>{Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                        {selectedGrade && <div><label className="label-style">Select Student</label><select value={complaintForm.studentId} onChange={e => setComplaintForm({...complaintForm, studentId: e.target.value})} className="input-field" required><option value="">-- Select Student --</option>{filteredStudentsByGrade.map(s => <option key={s.id} value={s.studentId}>{s.fullName}</option>)}</select></div>}
                        <div className="flex space-x-4"><button type="button" onClick={() => setComplaintType('text')} className={complaintType === 'text' ? 'btn-primary' : 'btn-secondary'}>Text</button><button type="button" onClick={() => setComplaintType('voice')} className={complaintType === 'voice' ? 'btn-primary' : 'btn-secondary'}>Voice</button></div>
                        {complaintType === 'text' ? (<div><label className="label-style">Message</label><select className="input-field mb-2" value={complaintForm.language} onChange={e => setComplaintForm({...complaintForm, language: e.target.value})}><option value="english">English</option><option value="urdu">Urdu</option></select><textarea value={complaintForm.message} onChange={e => setComplaintForm({...complaintForm, message: e.target.value})} dir={complaintForm.language === 'urdu' ? 'rtl' : 'ltr'} className="input-field" rows={5} placeholder="Write your complaint..."/></div>) : (<div><label className="label-style">Record Voice Message</label><div className="flex items-center space-x-4"><button type="button" onClick={isRecording ? handleStopRecording : handleStartRecording} className={isRecording ? 'btn-danger' : 'btn-success'}>{isRecording ? 'Stop Recording' : 'Start Recording'}</button>{audioUrl && <audio controls src={audioUrl} />}</div></div>)}
                        <div className="flex justify-end"><button type="submit" className="btn-primary">File Complaint</button></div>
                    </form>
                </div>
            );
            case 'add_notice': return (<div className="card-style"><h3 className="card-title">Post New Notice</h3><form onSubmit={handleNoticeSubmit} className="space-y-4"><input value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} placeholder="Notice Title" className="input-field" required/><textarea value={noticeForm.content} onChange={e => setNoticeForm({...noticeForm, content: e.target.value})} placeholder="Notice Content" className="input-field" rows={5} required/><div className="flex justify-end"><button type="submit" className="btn-primary">Post Notice</button></div></form></div>);
            case 'add_event': return (<div className="card-style"><h3 className="card-title">Add New Event</h3><form onSubmit={handleEventSubmit} className="space-y-4"><input value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} placeholder="Event Title" className="input-field" required /><input type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="input-field" required /><textarea value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} placeholder="Short Description" className="input-field" rows={2} required /><textarea value={eventForm.detailedDescription} onChange={e => setEventForm({...eventForm, detailedDescription: e.target.value})} placeholder="Detailed Description" className="input-field" rows={4} required /><div className="flex justify-end"><button type="submit" className="btn-primary">Add Event</button></div></form></div>);
            case 'add_gallery': return (
                <div className="card-style"><h3 className="card-title">Add to Gallery</h3><form onSubmit={handleGallerySubmit} className="space-y-4"><div><label className="label-style">Caption</label><input value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} placeholder="E.g., Sports Day 2024" className="input-field" required /></div><div><label className="label-style">Media Type</label><select value={galleryForm.mediaType} onChange={e => setGalleryForm({...galleryForm, mediaType: e.target.value as 'image'|'video'})} className="input-field"><option value="image">Image</option><option value="video">Video</option></select></div><div><label className="label-style">Upload File</label><input type="file" onChange={e => handleFileUpload(e, url => setGalleryForm({...galleryForm, src: url}))} className="input-field" accept={galleryForm.mediaType === 'image' ? 'image/*' : 'video/*'} required /></div>{galleryForm.src && (galleryForm.mediaType === 'image' ? <img src={galleryForm.src} alt="Preview" className="w-40 h-auto rounded-md" /> : <video src={galleryForm.src} className="w-40 h-auto rounded-md" />)}<div className="flex justify-end"><button type="submit" className="btn-primary">Add Item</button></div></form></div>
            );
            default: return null;
        }
    };
    
    return (
        <div className="py-12 sm:py-20 bg-gray-100 min-h-[calc(100vh-192px)]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8"><h1 className="text-3xl sm:text-4xl font-extrabold text-school-blue">Welcome, {user.fullName}!</h1><p className="mt-2 text-lg text-gray-600">Teacher & Staff Portal</p></div>
                <div className="mb-8 border-b border-gray-300 flex flex-wrap justify-center"><TabButton tabKey="notices" label="Notices & Events" /><TabButton tabKey="complaint" label="File Complaint" /><TabButton tabKey="add_notice" label="Post Notice" /><TabButton tabKey="add_event" label="Add Event" /><TabButton tabKey="add_gallery" label="Add to Gallery" /></div>
                <div className="animate-fade-in">{renderContent()}</div>
            </div>
            <style>{`
                .input-field { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; transition: border-color 0.2s; }
                .input-field:focus { outline: none; border-color: #0D244F; }
                .label-style { display: block; margin-bottom: 4px; font-weight: 500; color: #374151; }
                .card-style { padding: 2rem; background-color: white; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
                .card-title { font-size: 1.25rem; font-weight: 700; color: #1F2937; margin-bottom: 1.5rem; }
                .btn-primary { padding: 10px 16px; border: none; font-weight: 500; border-radius: 6px; color: white; background-color: #0D244F; transition: background-color 0.2s; } .btn-primary:hover { background-color: #1a3a75; }
                .btn-secondary { padding: 10px 16px; border: 1px solid #ccc; font-weight: 500; border-radius: 6px; color: #374151; background-color: #F9FAFB; } .btn-secondary:hover { background-color: #F3F4F6; }
                .btn-success { padding: 8px 12px; font-size: 0.875rem; border-radius: 6px; color: white; background-color: #10B981; } .btn-success:hover { background-color: #059669; }
                .btn-danger { padding: 8px 12px; font-size: 0.875rem; border-radius: 6px; color: white; background-color: #EF4444; } .btn-danger:hover { background-color: #DC2626; }
                .animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default TeacherDashboard;
