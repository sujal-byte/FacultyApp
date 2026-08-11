import { registerRootComponent } from 'expo';

import App from './App';
import { Faculty } from './src/types';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
export type RootStackParamList = {
    Login: undefined;
    Dashboard: { faculty: Faculty };
    Feedback: { facultyId: string };
    Timetable: { faculty: Faculty };
    Announcements: { faculty: Faculty };
    LeaveApplication: { faculty: Faculty };
    Courses: { faculty: Faculty };
};
registerRootComponent(App);