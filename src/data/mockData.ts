// src/data/mockData.ts
import { Submission, Announcement, Course, TimetableSlot, Faculty, LeaveApplication, Student } from '../types';
import { UserGroup, User } from '../services/api';

export const DEMO_FACULTY: Faculty = {
    id: 'FAC-2024-0042',
    name: 'Dr. Priya Nair',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    email: 'priya.nair@college.edu.in',
    phone: '+91 98765 43210',
    officeRoom: 'Cabin 402, Ramanujan Block',
    joiningDate: '12th July 2018',
    dob: '15/03/1985',
    gender: 'Female',
    qualification: 'Ph.D. in Computer Science',
    specialization: 'Machine Learning & Image Processing',
    experience: '12 Years',
    portalPin: '1503',
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
export const TIMETABLE: TimetableSlot[] = [
    // MONDAY
    { id: 'tt-mon-1', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Mon', startTime: '09:20', endTime: '10:15', room: 'Lab 204', section: 'Sec A', type: 'lecture', tags: ['Batch_2026', 'CSE-A', 'CS401'] },
    { id: 'tt-mon-2', courseCode: 'CS302', courseName: 'Database Systems', day: 'Mon', startTime: '10:15', endTime: '11:10', room: 'Room 301', section: 'Sec C', type: 'lecture', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'tt-mon-3', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Mon', startTime: '11:30', endTime: '12:25', room: 'Lab 205', section: 'Sec A', type: 'lab', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
    { id: 'tt-mon-4', courseCode: 'CS302', courseName: 'Database Systems', day: 'Mon', startTime: '12:25', endTime: '13:20', room: 'Room 301', section: 'Sec C', type: 'lecture', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'tt-mon-5', courseCode: 'FREE', courseName: 'Free Period', day: 'Mon', startTime: '14:05', endTime: '15:00', room: '—', section: '—', type: 'free' },
    { id: 'tt-mon-6', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Mon', startTime: '15:00', endTime: '15:55', room: 'Lab 204', section: 'Sec B', type: 'lab', tags: ['Batch_2026', 'CSE-B', 'CS401'] },
    { id: 'tt-mon-7', courseCode: 'FREE', courseName: 'Free Period', day: 'Mon', startTime: '15:55', endTime: '16:50', room: '—', section: '—', type: 'free' },

    // TUESDAY
    { id: 'tt-tue-1', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Tue', startTime: '09:20', endTime: '10:15', room: 'Lab 205', section: 'Sec A', type: 'lecture', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
    { id: 'tt-tue-2', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Tue', startTime: '10:15', endTime: '11:10', room: 'Room 402', section: 'Sec A', type: 'lecture', tags: ['Batch_2026', 'CSE-A', 'CS401'] },
    { id: 'tt-tue-3', courseCode: 'FREE', courseName: 'Free Period', day: 'Tue', startTime: '11:30', endTime: '12:25', room: '—', section: '—', type: 'free' },
    { id: 'tt-tue-4', courseCode: 'CS302', courseName: 'Database Systems', day: 'Tue', startTime: '12:25', endTime: '13:20', room: 'Room 301', section: 'Sec C', type: 'lecture', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'tt-tue-5', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Tue', startTime: '14:05', endTime: '15:00', room: 'Lab 204', section: 'Sec B', type: 'lecture', tags: ['Batch_2026', 'CSE-B', 'CS401'] },
    { id: 'tt-tue-6', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Tue', startTime: '15:00', endTime: '15:55', room: 'Lab 205', section: 'Sec A', type: 'lab', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
    { id: 'tt-tue-7', courseCode: 'FREE', courseName: 'Free Period', day: 'Tue', startTime: '15:55', endTime: '16:50', room: '—', section: '—', type: 'free' },

    // WEDNESDAY
    { id: 'tt-wed-1', courseCode: 'CS302', courseName: 'Database Systems', day: 'Wed', startTime: '09:20', endTime: '10:15', room: 'Room 301', section: 'Sec C', type: 'lecture', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'tt-wed-2', courseCode: 'FREE', courseName: 'Free Period', day: 'Wed', startTime: '10:15', endTime: '11:10', room: '—', section: '—', type: 'free' },
    { id: 'tt-wed-3', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Wed', startTime: '11:30', endTime: '12:25', room: 'Room 402', section: 'Sec A', type: 'lecture', tags: ['Batch_2026', 'CSE-A', 'CS401'] },
    { id: 'tt-wed-4', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Wed', startTime: '12:25', endTime: '13:20', room: 'Lab 204', section: 'Sec B', type: 'lab', tags: ['Batch_2026', 'CSE-B', 'CS401'] },
    { id: 'tt-wed-5', courseCode: 'CS302', courseName: 'Database Systems', day: 'Wed', startTime: '14:05', endTime: '15:00', room: 'Lab 206', section: 'Sec C', type: 'lab', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'tt-wed-6', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Wed', startTime: '15:00', endTime: '15:55', room: 'Room 402', section: 'Sec A', type: 'lecture', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
    { id: 'tt-wed-7', courseCode: 'FREE', courseName: 'Free Period', day: 'Wed', startTime: '15:55', endTime: '16:50', room: '—', section: '—', type: 'free' },

    // THURSDAY
    { id: 'tt-thu-1', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Thu', startTime: '09:20', endTime: '10:15', room: 'Room 402', section: 'Sec A', type: 'lecture', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
    { id: 'tt-thu-2', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Thu', startTime: '10:15', endTime: '11:10', room: 'Lab 204', section: 'Sec A', type: 'lab', tags: ['Batch_2026', 'CSE-A', 'CS401'] },
    { id: 'tt-thu-3', courseCode: 'CS302', courseName: 'Database Systems', day: 'Thu', startTime: '11:30', endTime: '12:25', room: 'Room 301', section: 'Sec C', type: 'lecture', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'tt-thu-4', courseCode: 'FREE', courseName: 'Free Period', day: 'Thu', startTime: '12:25', endTime: '13:20', room: '—', section: '—', type: 'free' },
    { id: 'tt-thu-5', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Thu', startTime: '14:05', endTime: '15:00', room: 'Lab 205', section: 'Sec A', type: 'lab', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
    { id: 'tt-thu-6', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Thu', startTime: '15:00', endTime: '15:55', room: 'Room 402', section: 'Sec B', type: 'lecture', tags: ['Batch_2026', 'CSE-B', 'CS401'] },
    { id: 'tt-thu-7', courseCode: 'FREE', courseName: 'Free Period', day: 'Thu', startTime: '15:55', endTime: '16:50', room: '—', section: '—', type: 'free' },

    // FRIDAY
    { id: 'tt-fri-1', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Fri', startTime: '09:20', endTime: '10:15', room: 'Room 402', section: 'Sec A', type: 'lecture', tags: ['Batch_2026', 'CSE-A', 'CS401'] },
    { id: 'tt-fri-2', courseCode: 'CS302', courseName: 'Database Systems', day: 'Fri', startTime: '10:15', endTime: '11:10', room: 'Lab 206', section: 'Sec C', type: 'lab', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'tt-fri-3', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Fri', startTime: '11:30', endTime: '12:25', room: 'Room 402', section: 'Sec A', type: 'lecture', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
    { id: 'tt-fri-4', courseCode: 'CS302', courseName: 'Database Systems', day: 'Fri', startTime: '12:25', endTime: '13:20', room: 'Room 301', section: 'Sec C', type: 'lecture', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'tt-fri-5', courseCode: 'FREE', courseName: 'Free Period', day: 'Fri', startTime: '14:05', endTime: '15:00', room: '—', section: '—', type: 'free' },
    { id: 'tt-fri-6', courseCode: 'CS401', courseName: 'Machine Learning', day: 'Fri', startTime: '15:00', endTime: '15:55', room: 'Lab 204', section: 'Sec B', type: 'lab', tags: ['Batch_2026', 'CSE-B', 'CS401'] },
    { id: 'tt-fri-7', courseCode: 'FREE', courseName: 'Department Meeting', day: 'Fri', startTime: '15:55', endTime: '16:50', room: 'Conf Hall', section: 'All', type: 'free' },

    // SATURDAY
    { id: 'tt-sat-1', courseCode: 'CS302', courseName: 'Database Systems', day: 'Sat', startTime: '09:20', endTime: '10:15', room: 'Room 301', section: 'Sec C', type: 'lecture', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'tt-sat-2', courseCode: 'CS501', courseName: 'Cloud Computing', day: 'Sat', startTime: '10:15', endTime: '11:10', room: 'Room 402', section: 'Sec A', type: 'lecture', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
    { id: 'tt-sat-3', courseCode: 'FREE', courseName: 'Project Mentoring', day: 'Sat', startTime: '11:30', endTime: '12:25', room: 'Lab 204', section: 'Final Yr', type: 'lab' },
    { id: 'tt-sat-4', courseCode: 'FREE', courseName: 'Free Period', day: 'Sat', startTime: '12:25', endTime: '13:20', room: '—', section: '—', type: 'free' },
    { id: 'tt-sat-5', courseCode: 'FREE', courseName: 'Free Period', day: 'Sat', startTime: '14:05', endTime: '15:00', room: '—', section: '—', type: 'free' },
    { id: 'tt-sat-6', courseCode: 'FREE', courseName: 'Free Period', day: 'Sat', startTime: '15:00', endTime: '15:55', room: '—', section: '—', type: 'free' },
    { id: 'tt-sat-7', courseCode: 'FREE', courseName: 'Free Period', day: 'Sat', startTime: '15:55', endTime: '16:50', room: '—', section: '—', type: 'free' },
];

export const MOCK_STUDENTS: Student[] = [
    { id: 'std-001', name: 'Aarav Sharma', rollNumber: '22CS0101', tags: ['Batch_2026', 'CSE-A', 'CS401'] },
    { id: 'std-002', name: 'Ananya Iyer', rollNumber: '22CS0102', tags: ['Batch_2026', 'CSE-A', 'CS401'] },
    { id: 'std-003', name: 'Rohan Verma', rollNumber: '22CS0103', tags: ['Batch_2026', 'CSE-A', 'CS401'] },
    { id: 'std-004', name: 'Sneha Patel', rollNumber: '22CS0104', tags: ['Batch_2026', 'CSE-A', 'CS401'] },
    { id: 'std-005', name: 'Vikram Rao', rollNumber: '22CS0105', tags: ['Batch_2026', 'CSE-B', 'CS401'] },
    { id: 'std-006', name: 'Priya Menon', rollNumber: '22CS0106', tags: ['Batch_2026', 'CSE-B', 'CS401'] },
    { id: 'std-007', name: 'Aditya Nair', rollNumber: '22CS0107', tags: ['Batch_2026', 'CSE-B', 'CS401'] },
    { id: 'std-008', name: 'Riya Sen', rollNumber: '23CS0201', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'std-009', name: 'Siddharth Roy', rollNumber: '23CS0202', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'std-010', name: 'Tanvi Kulkarni', rollNumber: '23CS0203', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'std-011', name: 'Ishaan Gupta', rollNumber: '23CS0204', tags: ['Batch_2027', 'CSE-C', 'CS302'] },
    { id: 'std-012', name: 'Neha Deshmukh', rollNumber: '21CS0301', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
    { id: 'std-013', name: 'Rahul Joshi', rollNumber: '21CS0302', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
    { id: 'std-014', name: 'Pooja Hegde', rollNumber: '21CS0303', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
    { id: 'std-015', name: 'Karthik Reddy', rollNumber: '21CS0304', tags: ['Batch_2025', 'CSE-A', 'CS501'] },
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

export const DEFAULT_ROLE_GROUPS: UserGroup[] = [
    // Batches
    { id: 'grp-batch-2029', name: 'Batch_2029', category: 'Batch', _count: { users: 2 } },
    { id: 'grp-batch-2028', name: 'Batch_2028', category: 'Batch', _count: { users: 0 } },
    { id: 'grp-batch-2027', name: 'Batch_2027', category: 'Batch', _count: { users: 4 } },
    { id: 'grp-batch-2026', name: 'Batch_2026', category: 'Batch', _count: { users: 7 } },
    { id: 'grp-batch-2025', name: 'Batch_2025', category: 'Batch', _count: { users: 4 } },

    // Sections
    { id: 'grp-sec-csej', name: 'CSE-J', category: 'Section', _count: { users: 2 } },
    { id: 'grp-sec-csea', name: 'CSE-A', category: 'Section', _count: { users: 8 } },
    { id: 'grp-sec-cseb', name: 'CSE-B', category: 'Section', _count: { users: 3 } },
    { id: 'grp-sec-csec', name: 'CSE-C', category: 'Section', _count: { users: 4 } },
    { id: 'grp-sec-ita', name: 'IT-A', category: 'Section', _count: { users: 0 } },
    { id: 'grp-sec-aimla', name: 'AIML-A', category: 'Section', _count: { users: 0 } },

    // Courses / Subjects
    { id: 'grp-crs-cs401', name: 'CS401', category: 'Course', _count: { users: 7 } },
    { id: 'grp-crs-cs302', name: 'CS302', category: 'Course', _count: { users: 4 } },
    { id: 'grp-crs-cs501', name: 'CS501', category: 'Course', _count: { users: 4 } },

    // Department & Committees
    { id: 'grp-dept-cse', name: 'HOD - Computer Science', category: 'Department', _count: { users: 1 } },
    { id: 'grp-com-exam', name: 'Exam Cell Coordinator', category: 'Committee', _count: { users: 2 } },
    { id: 'grp-com-placement', name: 'Placement Cell', category: 'Committee', _count: { users: 1 } },
    { id: 'grp-club-ai', name: 'AI & Robotics Club', category: 'Club', _count: { users: 5 } },
];

export const MOCK_USERS_WITH_ROLES: User[] = [
    {
        id: 'usr-001',
        name: 'Dr. Priya Nair',
        email: 'priya.nair@college.edu.in',
        role: 'FACULTY',
        usn: null,
        department: 'Computer Science & Engineering',
        groups: [
            { id: 'grp-dept-cse', name: 'HOD - Computer Science', category: 'Department' },
            { id: 'grp-crs-cs401', name: 'CS401', category: 'Course' },
            { id: 'grp-crs-cs501', name: 'CS501', category: 'Course' },
        ],
    },
    {
        id: 'usr-002',
        name: 'Prof. Rajesh Kumar',
        email: 'rajesh.k@college.edu.in',
        role: 'FACULTY',
        usn: null,
        department: 'Computer Science & Engineering',
        groups: [
            { id: 'grp-com-exam', name: 'Exam Cell Coordinator', category: 'Committee' },
            { id: 'grp-crs-cs302', name: 'CS302', category: 'Course' },
        ],
    },
    {
        id: 'usr-003',
        name: 'Aarav Sharma',
        email: 'aarav.22cs0101@college.edu.in',
        role: 'STUDENT',
        usn: '22CS0101',
        department: 'Computer Science',
        groups: [
            { id: 'grp-batch-2026', name: 'Batch_2026', category: 'Batch' },
            { id: 'grp-sec-csea', name: 'CSE-A', category: 'Section' },
            { id: 'grp-crs-cs401', name: 'CS401', category: 'Course' },
            { id: 'grp-club-ai', name: 'AI & Robotics Club', category: 'Club' },
        ],
    },
    {
        id: 'usr-004',
        name: 'Ananya Iyer',
        email: 'ananya.22cs0102@college.edu.in',
        role: 'STUDENT',
        usn: '22CS0102',
        department: 'Computer Science',
        groups: [
            { id: 'grp-batch-2026', name: 'Batch_2026', category: 'Batch' },
            { id: 'grp-sec-csea', name: 'CSE-A', category: 'Section' },
            { id: 'grp-crs-cs401', name: 'CS401', category: 'Course' },
        ],
    },
    {
        id: 'usr-005',
        name: 'Vikram Rao',
        email: 'vikram.22cs0105@college.edu.in',
        role: 'STUDENT',
        usn: '22CS0105',
        department: 'Computer Science',
        groups: [
            { id: 'grp-batch-2026', name: 'Batch_2026', category: 'Batch' },
            { id: 'grp-sec-cseb', name: 'CSE-B', category: 'Section' },
            { id: 'grp-crs-cs401', name: 'CS401', category: 'Course' },
        ],
    },
    {
        id: 'usr-006',
        name: 'Riya Sen',
        email: 'riya.23cs0201@college.edu.in',
        role: 'STUDENT',
        usn: '23CS0201',
        department: 'Computer Science',
        groups: [
            { id: 'grp-batch-2027', name: 'Batch_2027', category: 'Batch' },
            { id: 'grp-sec-csec', name: 'CSE-C', category: 'Section' },
            { id: 'grp-crs-cs302', name: 'CS302', category: 'Course' },
        ],
    },
    {
        id: 'usr-007',
        name: 'Kavya Deshmukh',
        email: 'kavya.25cs0901@college.edu.in',
        role: 'STUDENT',
        usn: '25CS0901',
        department: 'Computer Science',
        groups: [
            { id: 'grp-batch-2029', name: 'Batch_2029', category: 'Batch' },
            { id: 'grp-sec-csej', name: 'CSE-J', category: 'Section' },
        ],
    },
    {
        id: 'usr-008',
        name: 'Manish Verma',
        email: 'manish.25cs0902@college.edu.in',
        role: 'STUDENT',
        usn: '25CS0902',
        department: 'Computer Science',
        groups: [
            { id: 'grp-batch-2029', name: 'Batch_2029', category: 'Batch' },
            { id: 'grp-sec-csej', name: 'CSE-J', category: 'Section' },
        ],
    },
    {
        id: 'usr-009',
        name: 'Dr. Ramesh Sundaram',
        email: 'admin.dean@college.edu.in',
        role: 'ADMIN',
        usn: null,
        department: 'Administration',
        groups: [
            { id: 'grp-com-exam', name: 'Exam Cell Coordinator', category: 'Committee' },
            { id: 'grp-com-placement', name: 'Placement Cell', category: 'Committee' },
        ],
    },
];