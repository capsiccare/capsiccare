import React from 'react';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { Home, TestTube, Package, MessageCircle, Info } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = colorScheme === 'dark' ? '#00e5ff' : '#0d9488'; // Medical teal

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: colorScheme === 'dark' ? '#141b27' : '#ffffff',
          position: 'absolute',
          height: 60,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#0a0e14' : '#ffffff',
        },
        headerTitleStyle: {
          color: colorScheme === 'dark' ? '#f0f4f8' : '#0f3731',
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Info
                    size={24}
                    color={colorScheme === 'dark' ? '#f0f4f8' : '#0f3731'}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: 'Lab Tests',
          tabBarIcon: ({ color, size }) => <TestTube color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="packages"
        options={{
          title: 'Packages',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
