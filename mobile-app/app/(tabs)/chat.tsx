import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../lib/firebase';

export default function ChatEntry() {
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      // Redirect patients directly to the clinical chat with the medical team
      // We use the patient's UID as the chat channel ID
      router.replace(`/chat/${user.uid}`);
    } else {
      router.replace('/(auth)/login');
    }
  }, [user]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#0d9488" />
    </View>
  );
}
