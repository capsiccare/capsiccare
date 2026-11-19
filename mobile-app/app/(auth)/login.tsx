import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { doc, getDoc, setDoc } from 'firebase/firestore';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      handleGoogleLogin(credential);
    }
  }, [response]);

  const handleGoogleLogin = async (credential: any) => {
    setLoading(true);
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Check if user exists in Firestore, if not create profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: 'user',
          createdAt: new Date().toISOString(),
        });
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Google Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-8 pt-20">
        {/* Header/Logo */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-teal-50 rounded-2xl items-center justify-center shadow-sm">
             <Image 
                source={require('../../assets/images/logo.png')} 
                className="w-14 h-14"
                resizeMode="contain"
             />
          </View>
          <Text className="text-3xl font-bold text-slate-800 mt-6">Welcome Back</Text>
          <Text className="text-slate-500 mt-2">Sign in to manage your health</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
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
            <Text className="text-sm font-semibold text-slate-700 ml-1">Password</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
              <Lock size={20} color="#64748b" />
              <TextInput 
                className="flex-1 ml-3 text-slate-800"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
              </Pressable>
            </View>
          </View>

          <Pressable className="items-end">
            <Text className="text-teal-600 font-semibold text-sm">Forgot Password?</Text>
          </Pressable>

          <Pressable 
            onPress={handleLogin}
            disabled={loading}
            className={`mt-6 py-5 bg-teal-600 rounded-2xl flex-row items-center justify-center shadow-lg shadow-teal-600/20 active:scale-95 transition-all ${loading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white font-bold text-lg mr-2">
              {loading ? 'Please wait...' : 'Sign In'}
            </Text>
            {!loading && <ArrowRight size={20} color="white" />}
          </Pressable>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-slate-200" />
            <Text className="mx-4 text-slate-400 text-xs font-bold uppercase">Or continue with</Text>
            <View className="flex-1 h-[1px] bg-slate-200" />
          </View>

          <Pressable 
            onPress={() => promptAsync()}
            className="py-4 bg-white border border-slate-200 rounded-2xl flex-row items-center justify-center active:bg-slate-50 transition-all"
          >
            <Image 
              source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} 
              className="w-6 h-6 mr-3"
            />
            <Text className="text-slate-700 font-bold text-lg">Google</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-12">
          <Text className="text-slate-500">Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text className="text-teal-600 font-bold">Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
