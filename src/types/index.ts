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
    dueDate: string;         // ISO date string "YYYY-MM-DD"
    dueDateDisplay: string;  // Human-readable "DD MMM YYYY"
    totalStudents: number;
    submittedCount: number;
    type: 'assignment' | 'project' | 'quiz' | 'lab';
    urgent: boolean;         // true if due within 3 days
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
    Announcements: undefined;
    Courses: undefined;
    Timetable: undefined;
};
