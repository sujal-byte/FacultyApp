// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import LoginScreen from '../screens/auth/LoginScreen';
import FacultyDashboardScreen from '../screens/faculty/FacultyDashboardScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import FeedbackScreen from '../screens/faculty/FeedbackScreen';
import TimetableScreen from '../screens/faculty/TimetableScreen';
import AnnouncementsScreen from '../screens/faculty/AnnouncementsScreen';
import LeaveApplicationScreen from '../screens/faculty/LeaveApplicationScreen';
import CoursesScreen from '../screens/faculty/CoursesScreen';
import SubmissionsScreen from '../screens/faculty/SubmissionsScreen';
import ProfileScreen from '../screens/faculty/ProfileScreen';

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