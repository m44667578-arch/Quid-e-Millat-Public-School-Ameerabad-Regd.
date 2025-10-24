export enum Page {
  Home = 'HOME',
  About = 'ABOUT',
  VisionMotive = 'VISION_MOTIVE',
  Events = 'EVENTS',
  Gallery = 'GALLERY',
  Admissions = 'ADMISSIONS',
  Contact = 'CONTACT',
  PrincipalDashboard = 'PRINCIPAL_DASHBOARD',
  StudentDashboard = 'STUDENT_DASHBOARD',
  ParentDashboard = 'PARENT_DASHBOARD',
  TeacherDashboard = 'TEACHER_DASHBOARD',
}

export enum Grade {
  PlayGroup = 'Play Group',
  Nursery = 'Nursery',
  Prep = 'Prep',
  One = 'One',
  Two = 'Two',
  Three = 'Three',
  Four = 'Four',
  Five = 'Five',
  Six = 'Six',
  Seven = 'Seven',
}

export interface SchoolEvent {
  id: number;
  title: string;
  date: string;
  description: string;
  detailedDescription: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface ResultSubject {
  name: string;
  marks: number;
  totalMarks: number;
}

export interface StructuredResult {
  studentId: string;
  studentName?: string;
  subjects: ResultSubject[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  position: string;
  remarks: string;
}

export interface ResultSheet {
  id: string; // e.g., 'final-term-grade-one'
  term: '1st Term' | '2nd Term' | 'Final Term' | 'Monthly Test';
  grade: Grade;
  uploadDate: string;
  type: 'image' | 'structured';
  sheetUrl?: string; // for image type
  results?: StructuredResult[]; // for structured type
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string; // For easier display
  teacherName: string;
  date: string;
  message: string;
  type: 'text' | 'voice';
  language?: 'english' | 'urdu';
  audioUrl?: string;
}

export type UserType = 'student' | 'parent' | 'principal' | 'admin'; // 'admin' is for staff/teachers
export type AuthMode = 'login' | 'register';
export type AdminRole = 'staff' | 'principal';

export interface User {
  id: string;
  email: string;
  fullName: string;
  userType: UserType;
  password?: string;
  // Student-specific
  studentId?: string; // Assigned by principal upon approval
  grade?: Grade;
  // Parent-specific
  childStudentIds?: string[];
}

export interface AuthModalState {
  isOpen: boolean;
  mode: AuthMode;
  userType: UserType;
}

export interface LeadershipMessage {
  id: 'principal' | 'vice-principal' | 'chief-proctor';
  name: string;
  title: string;
  message: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: number;
  src: string;
  caption: string;
  mediaType: 'image' | 'video';
}

export interface AdmissionApplication {
  id: string;
  fullName: string;
  guardianName: string;
  dob: string;
  grade: Grade;
  previousSchool: string;
  address: string;
  whatsappNumber: string;
  email: string;
  submissionDate: string;
  acknowledged?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SiteImages {
  logoUrl: string;
  heroImageUrls: string[];
  aboutImageUrl: string;
  contactImageUrl: string;
}