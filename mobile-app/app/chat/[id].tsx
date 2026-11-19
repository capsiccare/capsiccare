import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import { useLocalSearchParams } from 'expo-router';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Send as SendIcon } from 'lucide-react-native';

export default function ChatRoom() {
  const { id } = useLocalSearchParams(); // This is the userId (for admin) or adminId (for user)
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  // For simplicity, we use a single collection "messages" and filter by the chat ID
  // A chat ID is formed by the userId (since patients only talk to the medical team)
  const chatId = id as string;

  useEffect(() => {
    if (!currentUser) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          user: data.user,
        };
      });
      setMessages(allMessages);
      setLoading(false);
    });

    return unsubscribe;
  }, [chatId, currentUser]);

  const onSend = useCallback(async (messages = []) => {
    if (!currentUser) return;
    
    const { text } = messages[0];
    const messageData = {
      text,
      createdAt: new Date(),
      user: {
        _id: currentUser.uid,
        name: currentUser.displayName || 'Me',
      },
    };

    // Add message to Firestore
    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

    // Update the conversation summary in "chats" collection
    await setDoc(doc(db, 'chats', chatId), {
      lastMessage: text,
      lastMessageAt: new Date().toISOString(),
      userId: chatId, // Track the user this chat belongs to
      userName: currentUser.displayName || 'Patient',
    }, { merge: true });

  }, [chatId, currentUser]);

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: '#0d9488' },
        left: { backgroundColor: '#f1f5f9' },
      }}
      textStyle={{
        right: { color: '#fff' },
        left: { color: '#1e293b' },
      }}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props}>
      <View className="mr-3 mb-2">
        <SendIcon size={24} color="#0d9488" />
      </View>
    </Send>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs as any)}
        user={{
          _id: currentUser?.uid || '',
          name: currentUser?.displayName || 'User',
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        placeholder="Type clinical inquiry..."
        alwaysShowSend
        scrollToBottom
      />
    </View>
  );
}
