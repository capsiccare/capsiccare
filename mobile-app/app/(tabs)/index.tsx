import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Settings, LogOut, ShieldAlert } from 'lucide-react-native';

export default function Home() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    async function checkRole() {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      }
      setLoading(false);
    }
    checkRole();
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-slate-950">
        <ActivityIndicator color="#0d9488" size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-950">
      <View className="px-6 py-8">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              Capsic Care
            </Text>
            <Text className="text-lg text-slate-600 dark:text-slate-300 mt-1">
              Welcome, {user?.displayName || 'Patient'}
            </Text>
          </View>
          <Pressable onPress={handleLogout} className="p-2">
            <LogOut size={24} color="#f43f5e" />
          </Pressable>
        </View>

        {role === 'admin' && (
          <Pressable 
            onPress={() => router.push('/(admin)')}
            className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-200 dark:border-amber-500/20 flex-row items-center"
          >
            <View className="p-3 bg-white dark:bg-amber-900/40 rounded-2xl mr-4">
              <ShieldAlert size={24} color="#d97706" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-amber-800 dark:text-amber-200">Admin Panel</Text>
              <Text className="text-amber-600 dark:text-amber-400 mt-1">Manage chats, forms, and users</Text>
            </View>
          </Pressable>
        )}
        
        <View className="mt-8 p-6 bg-teal-50 dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-white/10">
          <Text className="text-xl font-semibold text-teal-800 dark:text-teal-200">
            Welcome to our mobile app
          </Text>
          <Text className="mt-2 text-slate-600 dark:text-slate-400 leading-6">
            We are bringing all our diagnostic services directly to your smartphone. 
            Book tests, upload prescriptions, and view reports on the go.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
