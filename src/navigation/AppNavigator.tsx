import RolesDashboardScreen from '../screens/admin/RolesDashboardScreen';
// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import LoginScreen from '../screens/auth/LoginScreen';
import FacultyDashboardScreen from '../screens/faculty/FacultyDashboardScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserAccountsScreen from '../screens/admin/UserAccountsScreen';
import BroadcastNoticeScreen from '../screens/admin/BroadcastNoticeScreen';
import AuditLogsScreen from '../screens/admin/AuditLogsScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';
import FeedbackScreen from '../screens/faculty/FeedbackScreen';
import TimetableScreen from '../screens/faculty/TimetableScreen';
import AnnouncementsScreen from '../screens/faculty/AnnouncementsScreen';
import LeaveApplicationScreen from '../screens/faculty/LeaveApplicationScreen';
import CoursesScreen from '../screens/faculty/CoursesScreen';
import SubmissionsScreen from '../screens/faculty/SubmissionsScreen';
import ProfileScreen from '../screens/faculty/ProfileScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import AdminQuizScreen from '../screens/admin/AdminQuizScreen';
import AdminSubmissionsScreen from '../screens/admin/AdminSubmissionsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Dashboard" component={FacultyDashboardScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="RolesDashboard" component={RolesDashboardScreen} />
            <Stack.Screen name="BroadcastNotice" component={BroadcastNoticeScreen} />
            <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="AdminFeedback" component={AdminFeedbackScreen} />
            <Stack.Screen name="AdminQuiz" component={AdminQuizScreen} />
            <Stack.Screen name="AdminSubmissions" component={AdminSubmissionsScreen} />
            <Stack.Screen name="UserAccounts" component={UserAccountsScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen name="Timetable" component={TimetableScreen} />
            <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
            <Stack.Screen name="LeaveApplication" component={LeaveApplicationScreen} />
            <Stack.Screen name="Courses" component={CoursesScreen} />
            <Stack.Screen name="Submissions" component={SubmissionsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
}
