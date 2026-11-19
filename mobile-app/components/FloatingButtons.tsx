import React, { useState, useEffect } from 'react';
import { View, Pressable, Text, Linking, Animated } from 'react-native';
import { Phone, MessageSquare } from 'lucide-react-native';

export function FloatingButtons() {
  const [showText, setShowText] = useState(false);
  const textWidth = useState(new Animated.Value(0))[0];
  const opacity = useState(new Animated.Value(0))[0];

  const whatsappUrl = 'https://wa.me/918910260709?text=Hi, I want to upload my prescription for lab tests.';
  const callUrl = 'tel:+918910260709';

  useEffect(() => {
    const interval = setInterval(() => {
      const toValue = showText ? 0 : 1;
      
      Animated.parallel([
        Animated.timing(textWidth, {
          toValue: toValue,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: toValue,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowText(!showText);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [showText]);

  return (
    <View 
      style={{ position: 'absolute', bottom: 85, right: 20, zIndex: 1000 }}
      className="items-end space-y-4"
    >
      {/* Call Button */}
      <Pressable 
        onPress={() => Linking.openURL(callUrl)}
        className="flex-row items-center"
      >
        <View className="bg-white/90 dark:bg-slate-900/90 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 mr-3 shadow-md">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">Call Now</Text>
        </View>
        <View className="w-14 h-14 bg-teal-600 rounded-full items-center justify-center shadow-lg">
          <Phone size={24} color="white" />
        </View>
      </Pressable>

      {/* WhatsApp Button */}
      <Pressable 
        onPress={() => Linking.openURL(whatsappUrl)}
        className="flex-row items-center"
      >
        <Animated.View 
          style={{ 
            width: textWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 180] }),
            opacity: opacity,
            overflow: 'hidden',
          }}
          className="bg-[#25D366] h-14 rounded-full justify-center px-4 mr-[-28px] pr-10"
        >
          <Text className="text-white font-bold text-sm whitespace-nowrap">Upload Prescription</Text>
        </Animated.View>
        <View className="w-14 h-14 bg-[#25D366] rounded-full items-center justify-center shadow-lg border-2 border-white/20">
          <MessageSquare size={26} color="white" />
        </View>
      </Pressable>
    </View>
  );
}
