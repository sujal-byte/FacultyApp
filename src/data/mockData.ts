// src/data/mockData.ts
import { Submission, Announcement, Course, TimetableSlot, Faculty } from '../types';

export const DEMO_FACULTY: Faculty = {
    id: 'FAC-2024-0042',
    name: 'Dr. Priya Nair',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    email: 'priya.nair@college.edu.in',
};

// Valid demo credentials for login
export const VALID_CREDENTIALS = {
    facultyId: 'FAC-2024-0042',
    dob: '1985-03-15', // YYYY-MM-DD
};

export const UPCOMING_SUBMISSIONS: Submission[] = [
    {
        id: 'sub-001',
        courseCode: 'CS401',
        courseName: 'Machine Learning',
        title: 'Mini Project Phase 1 Report',
        dueDate: '2025-01-22',
        dueDateDisplay: '22 Jan 2025',
        totalStudents: 58,
        submittedCount: 12,
        type: 'project',
        urgent: true,
    },
    {
        id: 'sub-002',
        courseCode: 'CS302',
        courseName: 'Database Systems',
        title: 'SQL Assignment – Normalization',
        dueDate: '2025-01-24',
        dueDateDisplay: '24 Jan 2025',
        totalStudents: 62,
        submittedCount: 28,
        type: 'assignment',
        urgent: true,
    },
    {
        id: 'sub-003',
        courseCode: 'CS501',
        courseName: 'Cloud Computing',
        title: 'AWS Lab Exercise 3',
        dueDate: '2025-01-28',
        dueDateDisplay: '28 Jan 2025',
        totalStudents: 45,
        submittedCount: 5,
        type: 'lab',
        urgent: false,
    },
    {
        id: 'sub-004',
        courseCode: 'CS401',
        courseName: 'Machine Learning',
        title: 'Mid-Semester Quiz 2',
        dueDate: '2025-02-01',
        dueDateDisplay: '01 Feb 2025',
        totalStudents: 58,
        submittedCount: 0,
        type: 'quiz',
        urgent: false,
    },
];

export const ANNOUNCEMENTS: Announcement[] = [
    {
        id: 'ann-001',
        title: 'Exam Schedule Released – Even Semester 2024-25',
        body: 'The end-semester examination schedule has been published on the college portal. All faculty are requested to review the timetable and report conflicts to the COE office by Jan 25.',
        postedBy: 'Academic Section',
        postedDate: '2025-01-18',
        category: 'urgent',
        isRead: false,
    },
    {
        id: 'ann-002',
        title: 'Faculty Development Programme – Deep Learning',
        body: 'A 3-day FDP on Deep Learning and Neural Networks will be held from Feb 10-12, 2025. Registration deadline: Jan 30. Limited seats.',
        postedBy: 'Training & Development Cell',
        postedDate: '2025-01-17',
        category: 'event',
        isRead: false,
    },
    {
        id: 'ann-003',
        title: 'Internal Assessment Marks Entry Deadline',
        body: 'All faculty must enter IA marks for Cycle Test 1 on the ERP portal before January 30, 2025. Late entries will not be accepted.',
        postedBy: 'Examination Cell',
        postedDate: '2025-01-15',
        category: 'academic',
        isRead: true,
    },
];

export const MY_COURSES: Course[] = [
    {
        id: 'crs-001',
        code: 'CS401',
        name: 'Machine Learning',
        semester: '7th Sem',
        section: 'A & B',
        room: 'Lab 204',
        enrolledCount: 58,
        credits: 4,
    },
    {
        id: 'crs-002',
        code: 'CS302',
        name: 'Database Systems',
        semester: '5th Sem',
        section: 'C',
        room: 'Room 301',
        enrolledCount: 62,
        credits: 3,
    },
    {
        id: 'crs-003',
        code: 'CS501',
        name: 'Cloud Computing',
        semester: '7th Sem',
        section: 'A',
        room: 'Lab 205',
        enrolledCount: 45,
        credits: 3,
    },
];

export const TIMETABLE: TimetableSlot[] = [
    { id: 'tt-1', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Mon', startTime: '09:00', endTime: '10:00', room: 'Lab 204' },
    { id: 'tt-2', courseCode: 'CS302', courseName: 'Database Systems', day: 'Mon', startTime: '11:00', endTime: '12:00', room: 'Room 301' },
    { id: 'tt-3', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Tue', startTime: '10:00', endTime: '11:00', room: 'Lab 205' },
    { id: 'tt-4', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Wed', startTime: '09:00', endTime: '11:00', room: 'Lab 204' },
    { id: 'tt-5', courseCode: 'CS302', courseName: 'Database Systems', day: 'Thu', startTime: '14:00', endTime: '15:00', room: 'Room 301' },
    { id: 'tt-6', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Fri', startTime: '11:00', endTime: '13:00', room: 'Lab 205' },
];