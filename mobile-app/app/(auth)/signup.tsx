import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        role: 'user', // Default role
        createdAt: new Date().toISOString(),
      });

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-8 pt-12">
        {/* Header */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-slate-800">Create Account</Text>
          <Text className="text-slate-500 mt-2">Join Capsic Care for better health management</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm font-semibold text-slate-700 ml-1">Full Name</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
              <User size={20} color="#64748b" />
              <TextInput 
                className="flex-1 ml-3 text-slate-800"
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View className="space-y-2">
            <Text className="text-sm font-semibold text-slate-700 ml-1">Email</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
              <Mail size={20} color="#64748b" />
              <TextInput 
                className="flex-1 ml-3 text-slate-800"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View className="space-y-2">
            <Text className="text-sm font-semibold text-slate-700 ml-1">Phone Number (Optional)</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
              <Phone size={20} color="#64748b" />
              <TextInput 
                className="flex-1 ml-3 text-slate-800"
                placeholder="+91 00000 00000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View className="space-y-2">
            <Text className="text-sm font-semibold text-slate-700 ml-1">Password</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
              <Lock size={20} color="#64748b" />
              <TextInput 
                className="flex-1 ml-3 text-slate-800"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View className="flex-row items-center mt-2 ml-1">
            <CheckCircle2 size={16} color="#0d9488" />
            <Text className="text-xs text-slate-500 ml-2">I agree to the Terms of Service and Privacy Policy</Text>
          </View>

          <Pressable 
            onPress={handleSignup}
            disabled={loading}
            className={`mt-8 py-5 bg-teal-600 rounded-2xl flex-row items-center justify-center shadow-lg shadow-teal-600/20 active:scale-95 transition-all ${loading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white font-bold text-lg mr-2">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
            {!loading && <ArrowRight size={20} color="white" />}
          </Pressable>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-10 mb-20">
          <Text className="text-slate-500">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="text-teal-600 font-bold">Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
