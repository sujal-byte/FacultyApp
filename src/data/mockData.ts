// src/data/mockData.ts
import { Submission, Announcement, Course, TimetableSlot, Faculty, LeaveApplication } from '../types';

export const DEMO_FACULTY: Faculty = {
    id: 'FAC-2024-0042',
    name: 'Dr. Priya Nair',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    email: 'priya.nair@college.edu.in',
};

export const VALID_CREDENTIALS = {
    facultyId: 'FAC-2024-0042',
    dob: '1985-03-15',
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
    {
        id: 'sub-005',
        courseCode: 'CS302',
        courseName: 'Database Systems',
        title: 'ER Diagram – Mini Project',
        dueDate: '2025-02-05',
        dueDateDisplay: '05 Feb 2025',
        totalStudents: 62,
        submittedCount: 0,
        type: 'project',
        urgent: false,
    },
    {
        id: 'sub-006',
        courseCode: 'CS501',
        courseName: 'Cloud Computing',
        title: 'Docker & Kubernetes Lab',
        dueDate: '2025-02-10',
        dueDateDisplay: '10 Feb 2025',
        totalStudents: 45,
        submittedCount: 0,
        type: 'lab',
        urgent: false,
    },
    {
        id: 'sub-007',
        courseCode: 'CS401',
        courseName: 'Machine Learning',
        title: 'Neural Network Implementation',
        dueDate: '2025-02-14',
        dueDateDisplay: '14 Feb 2025',
        totalStudents: 58,
        submittedCount: 0,
        type: 'assignment',
        urgent: false,
    },
];

export const ANNOUNCEMENTS: Announcement[] = [
    // URGENT / IMPORTANT
    {
        id: 'ann-001',
        title: 'Exam Schedule Released – Even Semester 2024-25',
        body: 'The end-semester examination schedule has been published on the college portal. All faculty are requested to review the timetable and report conflicts to the COE office by Jan 25. No extensions will be granted after the deadline.',
        postedBy: 'Academic Section',
        postedDate: '2025-01-18',
        category: 'urgent',
        isRead: false,
    },
    {
        id: 'ann-002',
        title: 'Internal Assessment Marks Entry Deadline',
        body: 'All faculty must enter IA marks for Cycle Test 1 on the ERP portal before January 30, 2025. Late entries will not be accepted under any circumstances. Contact the exam cell for queries.',
        postedBy: 'Examination Cell',
        postedDate: '2025-01-15',
        category: 'urgent',
        isRead: false,
    },
    {
        id: 'ann-003',
        title: 'Mandatory Attendance Audit – All Departments',
        body: 'An attendance audit will be conducted for all courses. Faculty must ensure student attendance records are updated on the portal before February 5, 2025.',
        postedBy: 'Dean of Academics',
        postedDate: '2025-01-12',
        category: 'urgent',
        isRead: true,
    },
    // EVENTS
    {
        id: 'ann-004',
        title: 'Faculty Development Programme – Deep Learning',
        body: 'A 3-day FDP on Deep Learning and Neural Networks will be held from Feb 10-12, 2025 at the Main Seminar Hall. Registration deadline: Jan 30. Limited seats available — first come, first served.',
        postedBy: 'Training & Development Cell',
        postedDate: '2025-01-17',
        category: 'event',
        isRead: false,
    },
    {
        id: 'ann-005',
        title: 'Annual Tech Symposium – Volunteer Faculty Required',
        body: 'The Annual Tech Symposium is scheduled for March 1-2, 2025. Faculty volunteers are required to coordinate student project exhibitions and guest lecture sessions. Please register your interest by Feb 10.',
        postedBy: 'Symposium Organizing Committee',
        postedDate: '2025-01-14',
        category: 'event',
        isRead: true,
    },
    {
        id: 'ann-006',
        title: 'Research Paper Submission – National Conference',
        body: 'Faculty are encouraged to submit research papers for the National Conference on Emerging Technologies (NCET-2025) to be held at IIT Bombay on April 5-6. Submission deadline: Feb 20, 2025.',
        postedBy: 'Research & Development Cell',
        postedDate: '2025-01-10',
        category: 'event',
        isRead: true,
    },
    // ACADEMIC (general)
    {
        id: 'ann-007',
        title: 'New Library Resources Added – AI & ML Books',
        body: 'The college library has added 45 new titles in Artificial Intelligence, Machine Learning, and Data Science. Faculty can recommend additional titles through the library portal.',
        postedBy: 'Library Committee',
        postedDate: '2025-01-13',
        category: 'academic',
        isRead: false,
    },
    {
        id: 'ann-008',
        title: 'Updated Anti-Ragging Policy – Faculty Briefing',
        body: 'The institution has updated its anti-ragging policy as per UGC guidelines 2024. All faculty are requested to brief their respective classes and ensure the signed declarations are submitted to the admin office.',
        postedBy: 'Student Welfare Office',
        postedDate: '2025-01-09',
        category: 'academic',
        isRead: true,
    },
    {
        id: 'ann-009',
        title: 'Course Material Upload Reminder',
        body: 'All faculty are reminded to upload course materials, lesson plans, and reference documents for the current semester on the Learning Management System (LMS) before January 28, 2025.',
        postedBy: 'Academic Section',
        postedDate: '2025-01-08',
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

// Time slots: 9:20–5:00, 55-min classes
// Short break 11:10–11:30, Lunch 1:20–2:05
// Period 1:  09:20 – 10:15
// Period 2:  10:15 – 11:10
// Short break: 11:10 – 11:30
// Period 3:  11:30 – 12:25
// Period 4:  12:25 – 13:20
// Lunch: 13:20 – 14:05
// Period 5:  14:05 – 15:00
// Period 6:  15:00 – 15:55
// Period 7:  15:55 – 16:50  (ends ~5pm)

export const TIMETABLE: TimetableSlot[] = [
    // MONDAY
    { id: 'tt-mon-1', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Mon', startTime: '09:20', endTime: '10:15', room: 'Lab 204', section: 'Sec A', type: 'lecture' },
    { id: 'tt-mon-2', courseCode: 'CS302', courseName: 'Database Systems', day: 'Mon', startTime: '10:15', endTime: '11:10', room: 'Room 301', section: 'Sec C', type: 'lecture' },
    { id: 'tt-mon-3', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Mon', startTime: '11:30', endTime: '12:25', room: 'Lab 205', section: 'Sec A', type: 'lab' },
    { id: 'tt-mon-4', courseCode: 'CS302', courseName: 'Database Systems', day: 'Mon', startTime: '12:25', endTime: '13:20', room: 'Room 301', section: 'Sec C', type: 'lecture' },
    { id: 'tt-mon-5', courseCode: 'FREE', courseName: 'Free Period', day: 'Mon', startTime: '14:05', endTime: '15:00', room: '—', section: '—', type: 'free' },
    { id: 'tt-mon-6', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Mon', startTime: '15:00', endTime: '15:55', room: 'Lab 204', section: 'Sec B', type: 'lab' },
    { id: 'tt-mon-7', courseCode: 'FREE', courseName: 'Free Period', day: 'Mon', startTime: '15:55', endTime: '16:50', room: '—', section: '—', type: 'free' },

    // TUESDAY
    { id: 'tt-tue-1', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Tue', startTime: '09:20', endTime: '10:15', room: 'Lab 205', section: 'Sec A', type: 'lecture' },
    { id: 'tt-tue-2', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Tue', startTime: '10:15', endTime: '11:10', room: 'Room 402', section: 'Sec A', type: 'lecture' },
    { id: 'tt-tue-3', courseCode: 'FREE', courseName: 'Free Period', day: 'Tue', startTime: '11:30', endTime: '12:25', room: '—', section: '—', type: 'free' },
    { id: 'tt-tue-4', courseCode: 'CS302', courseName: 'Database Systems', day: 'Tue', startTime: '12:25', endTime: '13:20', room: 'Room 301', section: 'Sec C', type: 'lecture' },
    { id: 'tt-tue-5', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Tue', startTime: '14:05', endTime: '15:00', room: 'Lab 204', section: 'Sec B', type: 'lecture' },
    { id: 'tt-tue-6', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Tue', startTime: '15:00', endTime: '15:55', room: 'Lab 205', section: 'Sec A', type: 'lab' },
    { id: 'tt-tue-7', courseCode: 'FREE', courseName: 'Free Period', day: 'Tue', startTime: '15:55', endTime: '16:50', room: '—', section: '—', type: 'free' },

    // WEDNESDAY
    { id: 'tt-wed-1', courseCode: 'CS302', courseName: 'Database Systems', day: 'Wed', startTime: '09:20', endTime: '10:15', room: 'Room 301', section: 'Sec C', type: 'lecture' },
    { id: 'tt-wed-2', courseCode: 'FREE', courseName: 'Free Period', day: 'Wed', startTime: '10:15', endTime: '11:10', room: '—', section: '—', type: 'free' },
    { id: 'tt-wed-3', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Wed', startTime: '11:30', endTime: '12:25', room: 'Room 402', section: 'Sec A', type: 'lecture' },
    { id: 'tt-wed-4', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Wed', startTime: '12:25', endTime: '13:20', room: 'Lab 204', section: 'Sec B', type: 'lab' },
    { id: 'tt-wed-5', courseCode: 'CS302', courseName: 'Database Systems', day: 'Wed', startTime: '14:05', endTime: '15:00', room: 'Lab 206', section: 'Sec C', type: 'lab' },
    { id: 'tt-wed-6', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Wed', startTime: '15:00', endTime: '15:55', room: 'Room 402', section: 'Sec A', type: 'lecture' },
    { id: 'tt-wed-7', courseCode: 'FREE', courseName: 'Free Period', day: 'Wed', startTime: '15:55', endTime: '16:50', room: '—', section: '—', type: 'free' },

    // THURSDAY
    { id: 'tt-thu-1', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Thu', startTime: '09:20', endTime: '10:15', room: 'Room 402', section: 'Sec A', type: 'lecture' },
    { id: 'tt-thu-2', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Thu', startTime: '10:15', endTime: '11:10', room: 'Lab 204', section: 'Sec A', type: 'lab' },
    { id: 'tt-thu-3', courseCode: 'CS302', courseName: 'Database Systems', day: 'Thu', startTime: '11:30', endTime: '12:25', room: 'Room 301', section: 'Sec C', type: 'lecture' },
    { id: 'tt-thu-4', courseCode: 'FREE', courseName: 'Free Period', day: 'Thu', startTime: '12:25', endTime: '13:20', room: '—', section: '—', type: 'free' },
    { id: 'tt-thu-5', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Thu', startTime: '14:05', endTime: '15:00', room: 'Lab 205', section: 'Sec A', type: 'lab' },
    { id: 'tt-thu-6', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Thu', startTime: '15:00', endTime: '15:55', room: 'Room 402', section: 'Sec B', type: 'lecture' },
    { id: 'tt-thu-7', courseCode: 'FREE', courseName: 'Free Period', day: 'Thu', startTime: '15:55', endTime: '16:50', room: '—', section: '—', type: 'free' },

    // FRIDAY
    { id: 'tt-fri-1', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Fri', startTime: '09:20', endTime: '10:15', room: 'Room 402', section: 'Sec A', type: 'lecture' },
    { id: 'tt-fri-2', courseCode: 'CS302', courseName: 'Database Systems', day: 'Fri', startTime: '10:15', endTime: '11:10', room: 'Lab 206', section: 'Sec C', type: 'lab' },
    { id: 'tt-fri-3', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Fri', startTime: '11:30', endTime: '12:25', room: 'Room 402', section: 'Sec A', type: 'lecture' },
    { id: 'tt-fri-4', courseCode: 'CS302', courseName: 'Database Systems', day: 'Fri', startTime: '12:25', endTime: '13:20', room: 'Room 301', section: 'Sec C', type: 'lecture' },
    { id: 'tt-fri-5', courseCode: 'FREE', courseName: 'Free Period', day: 'Fri', startTime: '14:05', endTime: '15:00', room: '—', section: '—', type: 'free' },
    { id: 'tt-fri-6', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Fri', startTime: '15:00', endTime: '15:55', room: 'Lab 204', section: 'Sec B', type: 'lab' },
    { id: 'tt-fri-7', courseCode: 'FREE', courseName: 'Free Period', day: 'Fri', startTime: '15:55', endTime: '16:50', room: '—', section: '—', type: 'free' },

    // SATURDAY
    { id: 'tt-sat-1', courseCode: 'CS302', courseName: 'Database Systems', day: 'Sat', startTime: '09:20', endTime: '10:15', room: 'Room 301', section: 'Sec C', type: 'lecture' },
    { id: 'tt-sat-2', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Sat', startTime: '10:15', endTime: '11:10', room: 'Room 402', section: 'Sec A', type: 'lecture' },
    { id: 'tt-sat-3', courseCode: 'FREE', courseName: 'Free Period', day: 'Sat', startTime: '11:30', endTime: '12:25', room: '—', section: '—', type: 'free' },
    { id: 'tt-sat-4', courseCode: 'FREE', courseName: 'Free Period', day: 'Sat', startTime: '12:25', endTime: '13:20', room: '—', section: '—', type: 'free' },
    { id: 'tt-sat-5', courseCode: 'FREE', courseName: 'Free Period', day: 'Sat', startTime: '14:05', endTime: '15:00', room: '—', section: '—', type: 'free' },
    { id: 'tt-sat-6', courseCode: 'FREE', courseName: 'Free Period', day: 'Sat', startTime: '15:00', endTime: '15:55', room: '—', section: '—', type: 'free' },
    { id: 'tt-sat-7', courseCode: 'FREE', courseName: 'Free Period', day: 'Sat', startTime: '15:55', endTime: '16:50', room: '—', section: '—', type: 'free' },
];

export const LEAVE_APPLICATIONS: LeaveApplication[] = [
    {
        id: 'lv-001',
        fromDate: '2025-01-06',
        toDate: '2025-01-06',
        fromDateDisplay: '06 Jan 2025',
        toDateDisplay: '06 Jan 2025',
        days: 1,
        reason: 'Personal work — bank-related documentation and property registration.',
        type: 'personal',
        status: 'approved',
        appliedOn: '2025-01-04',
        remarks: 'Approved by HoD.',
    },
    {
        id: 'lv-002',
        fromDate: '2024-12-23',
        toDate: '2024-12-24',
        fromDateDisplay: '23 Dec 2024',
        toDateDisplay: '24 Dec 2024',
        days: 2,
        reason: 'Medical — follow-up consultation and lab tests at Apollo Hospital.',
        type: 'medical',
        status: 'approved',
        appliedOn: '2024-12-21',
        remarks: 'Approved. Medical certificate submitted.',
    },
    {
        id: 'lv-003',
        fromDate: '2024-12-10',
        toDate: '2024-12-10',
        fromDateDisplay: '10 Dec 2024',
        toDateDisplay: '10 Dec 2024',
        days: 1,
        reason: 'Family emergency — urgent travel to hometown.',
        type: 'emergency',
        status: 'approved',
        appliedOn: '2024-12-10',
        remarks: 'Approved on compassionate grounds.',
    },
    {
        id: 'lv-004',
        fromDate: '2024-11-18',
        toDate: '2024-11-19',
        fromDateDisplay: '18 Nov 2024',
        toDateDisplay: '19 Nov 2024',
        days: 2,
        reason: 'Attending sister\'s wedding ceremony and related functions.',
        type: 'casual',
        status: 'approved',
        appliedOn: '2024-11-10',
    },
    {
        id: 'lv-005',
        fromDate: '2024-10-28',
        toDate: '2024-10-28',
        fromDateDisplay: '28 Oct 2024',
        toDateDisplay: '28 Oct 2024',
        days: 1,
        reason: 'Casual leave for Diwali celebrations and family commitments.',
        type: 'casual',
        status: 'approved',
        appliedOn: '2024-10-25',
    },
    {
        id: 'lv-006',
        fromDate: '2024-09-14',
        toDate: '2024-09-14',
        fromDateDisplay: '14 Sep 2024',
        toDateDisplay: '14 Sep 2024',
        days: 1,
        reason: 'Medical — fever and viral infection, doctor advised rest.',
        type: 'medical',
        status: 'approved',
        appliedOn: '2024-09-14',
        remarks: 'Self-certified. Approved.',
    },
    {
        id: 'lv-007',
        fromDate: '2025-01-25',
        toDate: '2025-01-26',
        fromDateDisplay: '25 Jan 2025',
        toDateDisplay: '26 Jan 2025',
        days: 2,
        reason: 'Attending an international research workshop in Pune (personal capacity).',
        type: 'casual',
        status: 'pending',
        appliedOn: '2025-01-20',
    },
];

export const TOTAL_LEAVE_QUOTA = 12;