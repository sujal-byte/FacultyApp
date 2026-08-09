# Faculty Portal — React Native Expo App

## Tech Stack
- React Native + Expo (Managed Workflow)
- TypeScript
- NativeWind (Tailwind CSS for RN)
- React Navigation (Stack Navigator)
- react-native-calendars
- Lucide React Native / FontAwesome icons
- React Native Paper (optional overlay components)

## Folder Structure
```
FacultyApp/
├── App.tsx
├── app.json
├── babel.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── src/
    ├── navigation/
    │   └── AppNavigator.tsx
    ├── screens/
    │   ├── LoginScreen.tsx
    │   ├── DashboardScreen.tsx
    │   └── FeedbackScreen.tsx
    ├── components/
    │   ├── CalendarModal.tsx
    │   ├── DashboardCard.tsx
    │   ├── SubmissionItem.tsx
    │   └── HeaderActions.tsx
    ├── types/
    │   └── index.ts
    └── data/
        └── mockData.ts
```

## Setup
```bash
npx create-expo-app FacultyApp --template blank-typescript
cd FacultyApp
npx expo install nativewind
npx expo install react-native-calendars
npm install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npm install lucide-react-native
npm install react-native-paper
```

See individual source files for complete implementation.