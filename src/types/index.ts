// src/types/index.ts

export interface Faculty {
    id: string;
    name: string;
    department: string;
    designation: string;
    email: string;
}

export interface Submission {
    id: string;
    courseCode: string;
    courseName: string;
    title: string;
    dueDate: string;
    dueDateDisplay: string;
    totalStudents: number;
    submittedCount: number;
    type: 'assignment' | 'project' | 'quiz' | 'lab';
    urgent: boolean;
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
    Login: undefined;
    Dashboard: { faculty: Faculty };
    Feedback: { facultyId: string };
    Timetable: { faculty: Faculty };
    Announcements: { faculty: Faculty };
    LeaveApplication: { faculty: Faculty };
    Courses: { faculty: Faculty };
    Submissions: { faculty: Faculty };
};