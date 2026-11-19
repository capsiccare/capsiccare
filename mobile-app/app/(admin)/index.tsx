import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MessageSquare, User, Clock, ChevronRight } from 'lucide-react-native';

export default function AdminDashboard() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In a real app, you'd fetch all conversations where at least one message exists
    // For now, we'll listen to a "chats" collection which represents individual user conversations
    const q = query(collection(db, 'chats'), orderBy('lastMessageAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(docs);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <Pressable 
      onPress={() => router.push(`/(admin)/chat/${item.userId}`)}
      className="flex-row items-center p-4 bg-white border-b border-slate-100 active:bg-slate-50"
    >
      <View className="w-12 h-12 bg-teal-100 rounded-full items-center justify-center">
        <User size={24} color="#0d9488" />
      </View>
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-slate-800">{item.userName || 'Anonymous Patient'}</Text>
          <Text className="text-xs text-slate-400">
            {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
        <Text className="text-slate-500 text-sm mt-1" numberOfLines={1}>
          {item.lastMessage || 'Start conversation...'}
        </Text>
      </View>
      <ChevronRight size={20} color="#cbd5e1" />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-white px-6 pt-12 pb-6 border-b border-slate-200">
        <Text className="text-2xl font-bold text-slate-800">Admin Panel</Text>
        <Text className="text-slate-500 mt-1">Manage patient inquiries and messages</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0d9488" />
        </View>
      ) : (
        <FlatList 
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20 px-10">
              <MessageSquare size={48} color="#cbd5e1" />
              <Text className="text-slate-400 text-center mt-4">No active conversations found. New patient inquiries will appear here.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
