import React, { useState, useCallback } from 'react';
import { Page, User, AuthModalState, UserType, AuthMode, SchoolEvent, Notice, ResultSheet, Complaint, Grade, GalleryItem, AdmissionApplication, LeadershipMessage, SiteImages } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/pages/Home';
import About from './components/pages/About';
import VisionMotive from './components/pages/VisionMotive';
import Events from './components/pages/Events';
import Gallery from './components/pages/Gallery';
import Admission from './components/pages/Admission';
import Contact from './components/pages/Contact';
import PrincipalDashboard from './components/pages/PrincipalDashboard';
import StudentDashboard from './components/pages/StudentDashboard';
import ParentDashboard from './components/pages/ParentDashboard';
import TeacherDashboard from './components/pages/TeacherDashboard';
import AuthModal from './components/auth/AuthModal';
import Chatbot from './components/Chatbot';
import { eventsData } from './components/pages/Events';
import { galleryData } from './components/pages/Gallery';
import { normalizeId } from './utils/string';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [studentCount, setStudentCount] = useState<number>(1250);
  const [staffCount, setStaffCount] = useState<number>(75);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [registrationMessage, setRegistrationMessage] = useState<string>('');

  const [siteImages, setSiteImages] = useState<SiteImages>({
    logoUrl: 'https://i.imgur.com/3Y1Z2f5.png',
    heroImageUrls: [
      'https://i.imgur.com/Oq1tA7o.jpeg',
      'https://picsum.photos/1920/1080?image=1018',
      'https://picsum.photos/1920/1080?image=1078'
    ],
    aboutImageUrl: 'https://i.imgur.com/Oq1tA7o.jpeg',
    contactImageUrl: 'https://i.imgur.com/Oq1tA7o.jpeg',
  });

  // In a real app, this would be managed via a database
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>(eventsData);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [resultSheets, setResultSheets] = useState<ResultSheet[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(galleryData);
  const [admissionApplications, setAdmissionApplications] = useState<AdmissionApplication[]>([]);

  const initialLeadershipMessages: LeadershipMessage[] = [
    {
      id: 'principal',
      name: 'Principal',
      title: "Principal's Message",
      message: "We are committed to providing a safe, nurturing environment where every student can achieve their full potential.",
      imageUrl: "https://picsum.photos/200/200?image=1005",
    },
    {
      id: 'vice-principal',
      name: 'Vice Principal',
      title: "Vice Principal's Message",
      message: "Our focus is on academic excellence, character development, and fostering a love for lifelong learning.",
      imageUrl: "https://picsum.photos/200/200?image=1027",
    },
    {
      id: 'chief-proctor',
      name: 'Chief Proctor',
      title: "Chief Proctor's Message",
      message: "We uphold a standard of discipline and respect that ensures a productive and positive school atmosphere for all.",
      imageUrl: "https://picsum.photos/200/200?image=836",
    }
  ];

  const [leadershipMessages, setLeadershipMessages] = useState<LeadershipMessage[]>(initialLeadershipMessages);

  const [authModalState, setAuthModalState] = useState<AuthModalState>({ isOpen: false, mode: 'login', userType: 'student' });

  const openAuthModal = (mode: AuthMode, userType: UserType) => {
    setRegistrationMessage('');
    setAuthModalState({ isOpen: true, mode, userType });
  };

  const closeAuthModal = () => {
    setAuthModalState({ ...authModalState, isOpen: false });
  };

  const handleLogout = useCallback(() => {
    setLoggedInUser(null);
    setCurrentPage(Page.Home);
    window.scrollTo(0, 0);
  }, []);
  
  const handleLoginSuccess = useCallback((user: User) => {
    setLoggedInUser(user);
    closeAuthModal();
    switch (user.userType) {
      case 'principal':
        setCurrentPage(Page.PrincipalDashboard);
        break;
      case 'student':
        setCurrentPage(Page.StudentDashboard);
        break;
      case 'parent':
        setCurrentPage(Page.ParentDashboard);
        break;
      case 'admin': // Staff/Teacher
        setCurrentPage(Page.TeacherDashboard);
        break;
      default:
        setCurrentPage(Page.Home);
    }
    window.scrollTo(0, 0);
  }, []);

  const handleRegister = (newUser: Omit<User, 'id'>) => {
    const userWithId = { ...newUser, id: `user-${Date.now()}-${Math.random()}` };
    setPendingUsers(prev => [...prev, userWithId]);
    closeAuthModal();
    setRegistrationMessage('Your account is pending approval. Once approved, please contact the admin for your ID!');
  };
  
  const handleApproveUser = (userId: string) => {
    const userToApprove = pendingUsers.find(u => u.id === userId);
    if (userToApprove) {
      let approvedUser = { ...userToApprove };
      if (userToApprove.userType === 'student' && userToApprove.grade) {
        const gradeMap: { [key in Grade]: string } = {
            [Grade.PlayGroup]: 'PG',
            [Grade.Nursery]: 'N',
            [Grade.Prep]: 'P',
            [Grade.One]: '01',
            [Grade.Two]: '02',
            [Grade.Three]: '03',
            [Grade.Four]: '04',
            [Grade.Five]: '05',
            [Grade.Six]: '06',
            [Grade.Seven]: '07',
        };
        const classCode = gradeMap[userToApprove.grade];
        const studentNumberInClass = approvedUsers.filter(u => u.grade === userToApprove.grade).length + 1;
        const studentNumber = studentNumberInClass.toString().padStart(3, '0');
        const studentId = `QMPS-${classCode}-${studentNumber}`;
        
        approvedUser.studentId = studentId;
        alert(`Student ${userToApprove.fullName} approved!\nTheir new Student ID is: ${studentId}\nA confirmation email has been sent from myportfolio699@gmail.com to ${userToApprove.email}.`);
        setStudentCount(c => c + 1);
      } else if (userToApprove.userType === 'parent') {
         alert(`Parent ${userToApprove.fullName} approved! They can now log in with their email and password.`);
      }
      else { // admin/staff
         alert(`Staff member ${userToApprove.fullName} approved! They can now log in.`);
         setStaffCount(c => c + 1);
      }

      setApprovedUsers(prev => [...prev, approvedUser]);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleDenyUser = (userId: string) => {
    setPendingUsers(prev => prev.filter(u => u.id !== userId));
  };
  
  const handleSaveEvent = (event: SchoolEvent) => {
    const existingIndex = events.findIndex(e => e.id === event.id);
    if (existingIndex > -1) {
      setEvents(events.map(e => e.id === event.id ? event : e));
    } else {
      setEvents([{ ...event, id: Date.now() }, ...events]);
    }
  };
  
  const handleDeleteEvent = (eventId: number) => {
    if(window.confirm('Are you sure you want to delete this event?')) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  const handlePostNotice = (notice: Omit<Notice, 'id' | 'date'>) => {
    const newNotice = { ...notice, id: `notice-${Date.now()}`, date: new Date().toLocaleDateString() };
    setNotices(prev => [newNotice, ...prev]);
  };

  const handleAddResultSheet = (newSheet: ResultSheet) => {
    setResultSheets(prev => {
      // If a sheet with the same ID already exists, replace it. Otherwise, add it.
      const existingIndex = prev.findIndex(sheet => sheet.id === newSheet.id);
      if (existingIndex > -1) {
        const updatedSheets = [...prev];
        updatedSheets[existingIndex] = newSheet;
        return updatedSheets;
      }
      return [newSheet, ...prev];
    });
  };

  const handleDeleteResultSheet = (sheetId: string) => {
    if(window.confirm('Are you sure you want to delete this result sheet? This action cannot be undone.')) {
        setResultSheets(prev => prev.filter(sheet => sheet.id !== sheetId));
    }
  }

  const handleAddComplaint = (complaint: Omit<Complaint, 'id' | 'date' | 'teacherName'>) => {
    if (!loggedInUser) return;
    const newComplaint = { ...complaint, id: `complaint-${Date.now()}`, date: new Date().toLocaleDateString(), teacherName: loggedInUser.fullName };
    setComplaints(prev => [...prev, newComplaint]);
  };

  const handleAdmissionSubmit = (application: Omit<AdmissionApplication, 'id' | 'submissionDate'>) => {
    const newApplication = { ...application, id: `adm-${Date.now()}`, submissionDate: new Date().toLocaleString(), acknowledged: false };
    setAdmissionApplications(prev => [newApplication, ...prev]);
    alert('Thank you for reaching out to us, your application is received. We will contact you soon.');
    setCurrentPage(Page.Home);
  };
  
  const handleAcknowledgeAdmission = (applicationId: string) => {
    setAdmissionApplications(prev => prev.map(app => 
      app.id === applicationId ? { ...app, acknowledged: true } : app
    ));
  };

  const handleAddGalleryItem = (item: Omit<GalleryItem, 'id'>) => {
    const newItem = { ...item, id: Date.now() };
    setGalleryItems(prev => [newItem, ...prev]);
  };

  const handleDeleteGalleryItem = (itemId: number) => {
    if(window.confirm('Are you sure you want to delete this item?')) {
        setGalleryItems(prev => prev.filter(item => item.id !== itemId));
    }
  };
  
  const handleUpdateLeadershipMessage = (updatedMessage: LeadershipMessage) => {
    setLeadershipMessages(prev => prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg));
    alert(`${updatedMessage.name}'s message has been updated successfully!`);
  };

  const handleUpdateSiteImages = (updatedImages: SiteImages) => {
    setSiteImages(updatedImages);
    alert('Website images have been updated successfully!');
  };


  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
    setRegistrationMessage('');
    window.scrollTo(0, 0);
  }, []);

  const renderPage = () => {
    const homeProps = { studentCount, staffCount, openAuthModal, registrationMessage, leadershipMessages, heroImageUrls: siteImages.heroImageUrls };
    switch (currentPage) {
      case Page.Home:
        return <Home {...homeProps} />;
      case Page.About:
        return <About aboutImageUrl={siteImages.aboutImageUrl} />;
      case Page.VisionMotive:
        return <VisionMotive />;
      case Page.Events:
        return <Events eventsData={events} />;
      case Page.Gallery:
        return <Gallery galleryItems={galleryItems} />;
      case Page.Admissions:
        return <Admission onAdmissionSubmit={handleAdmissionSubmit} />;
      case Page.Contact:
        return <Contact contactImageUrl={siteImages.contactImageUrl} />;
      case Page.PrincipalDashboard:
        return loggedInUser?.userType === 'principal' ? (
          <PrincipalDashboard
            studentCount={studentCount}
            staffCount={staffCount}
            setStudentCount={setStudentCount}
            setStaffCount={setStaffCount}
            pendingUsers={pendingUsers}
            onApproveUser={handleApproveUser}
            onDenyUser={handleDenyUser}
            approvedUsers={approvedUsers}
            events={events}
            onSaveEvent={handleSaveEvent}
            onDeleteEvent={handleDeleteEvent}
            notices={notices}
            onPostNotice={handlePostNotice}
            resultSheets={resultSheets}
            onAddResultSheet={handleAddResultSheet}
            onDeleteResultSheet={handleDeleteResultSheet}
            admissionApplications={admissionApplications}
            onAcknowledgeAdmission={handleAcknowledgeAdmission}
            galleryItems={galleryItems}
            onAddGalleryItem={handleAddGalleryItem}
            onDeleteGalleryItem={handleDeleteGalleryItem}
            leadershipMessages={leadershipMessages}
            onUpdateLeadershipMessage={handleUpdateLeadershipMessage}
            siteImages={siteImages}
            onUpdateSiteImages={handleUpdateSiteImages}
          />
        ) : <Home {...homeProps} />;
      case Page.StudentDashboard:
        return loggedInUser?.userType === 'student' && loggedInUser.studentId ? <StudentDashboard user={loggedInUser} resultSheets={resultSheets} complaints={complaints.filter(c => normalizeId(c.studentId) === normalizeId(loggedInUser.studentId))} /> : <Home {...homeProps} />;
      case Page.ParentDashboard:
        return loggedInUser?.userType === 'parent' ? <ParentDashboard user={loggedInUser} allResultSheets={resultSheets} allComplaints={complaints} allApprovedUsers={approvedUsers} /> : <Home {...homeProps} />;
      case Page.TeacherDashboard:
        return loggedInUser?.userType === 'admin' ? <TeacherDashboard user={loggedInUser} notices={notices} events={events} onAddComplaint={handleAddComplaint} approvedStudents={approvedUsers.filter(u => u.userType === 'student')} onSaveEvent={handleSaveEvent} onPostNotice={handlePostNotice} onAddGalleryItem={handleAddGalleryItem} /> : <Home {...homeProps} />;
      default:
        return <Home {...homeProps} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800">
      <Header navigate={navigate} user={loggedInUser} onLogout={handleLogout} logoUrl={siteImages.logoUrl} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer navigate={navigate} />
      {authModalState.isOpen && 
        <AuthModal 
            modalState={authModalState} 
            onClose={closeAuthModal}
            onLoginSuccess={handleLoginSuccess}
            onRegister={handleRegister}
            approvedUsers={approvedUsers}
        />}
      <Chatbot />
    </div>
  );
};

export default App;