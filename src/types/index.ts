// src/types/index.ts

export interface Faculty {
    id: string;
    name: string;
    department: string;
    designation: string;
    email: string;
    phone?: string;
    officeRoom?: string;
    joiningDate?: string;
    dob?: string;
    gender?: string;
    qualification?: string;
    specialization?: string;
    experience?: string;
    portalPin?: string;
}

export interface Submission {
    id: string;
    courseCode?: string;
    courseName?: string;
    title: string;
    description?: string | null;
    dueDate: string;
    dueDateDisplay?: string;
    totalStudents?: number;
    submittedCount?: number;
    type?: 'assignment' | 'project' | 'quiz' | 'lab';
    urgent?: boolean;
    status?: string;
    facultyId?: string;
    faculty?: any;
    createdAt?: string;
    updatedAt?: string;
}

export interface Announcement {
    id: string;
    title: string;
    body: string;
    postedBy: string;
    postedDate: string;
    category: 'academic' | 'admin' | 'event' | 'urgent';
    isRead: boolean;
}

export interface Course {
    id: string;
    code: string;
    name: string;
    semester: string;
    section: string;
    room: string;
    enrolledCount: number;
    credits: number;
}

export interface TimetableSlot {
    id: string;
    courseCode: string;
    courseName: string;
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
    startTime: string;
    endTime: string;
    room: string;
    section: string;
    type: 'lecture' | 'lab' | 'free';
    tags?: string[];
}

export interface Student {
    id: string;
    name: string;
    rollNumber: string;
    tags: string[];
    avatar?: string;
    email?: string;
}

export interface AttendanceStudentEntry {
    studentId: string;
    rollNumber: string;
    name: string;
    status: 'present' | 'absent';
}

export interface AttendanceSessionPayload {
    key: string;
    subjectId: string;
    courseCode: string;
    courseName: string;
    section: string;
    room: string;
    date: string;
    timestamp: string;
    expiryDate: string;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    records: AttendanceStudentEntry[];
}

export interface LeaveApplication {
    id: string;
    fromDate: string;
    toDate: string;
    fromDateDisplay: string;
    toDateDisplay: string;
    days: number;
    reason: string;
    type: 'casual' | 'medical' | 'emergency' | 'personal';
    status: 'approved' | 'pending' | 'rejected';
    appliedOn: string;
    remarks?: string;
}

export interface FeedbackPayload {
    facultyId: string;
    category: 'bug' | 'suggestion' | 'question' | 'other';
    message: string;
    timestamp: string;
}

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Dashboard: { faculty?: Faculty };
    FacultyDashboard: { faculty?: Faculty } | undefined;
    AdminDashboard: undefined;
    UserAccounts: undefined;
    BroadcastNotice: undefined;
    AuditLogs: undefined;
    Reports: undefined;
    AdminFeedback: undefined;
    AdminQuiz: undefined;
    AdminSubmissions: undefined;
    RolesDashboard: undefined;
    Feedback: { facultyId: string };
    Timetable: { faculty?: Faculty };
    Announcements: { faculty?: Faculty };
    LeaveApplication: { faculty?: Faculty };
    Courses: { faculty?: Faculty };
    Submissions: { faculty?: Faculty } | undefined;
    Profile: { faculty?: Faculty };
};
