import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Admin Dashboard',
          headerShown: false, 
        }} 
      />
      <Stack.Screen 
        name="chat/[id]" 
        options={{ 
          title: 'Patient Inquiry',
          headerShown: true,
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#0d9488',
        }} 
      />
    </Stack>
  );
}
