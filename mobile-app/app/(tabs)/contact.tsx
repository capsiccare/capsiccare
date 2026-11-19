import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react-native';

export default function Contact() {
  const contactMethods = [
    { 
      title: 'Call Us', 
      detail: '+91 8910260709', 
      icon: Phone, 
      color: 'bg-teal-50', 
      action: () => Linking.openURL('tel:+918910260709') 
    },
    { 
      title: 'WhatsApp', 
      detail: 'Chat with us for help', 
      icon: MessageSquare, 
      color: 'bg-green-50', 
      action: () => Linking.openURL('https://wa.me/918910260709') 
    },
    { 
      title: 'Email', 
      detail: 'support@capsiccare.com', 
      icon: Mail, 
      color: 'bg-blue-50', 
      action: () => Linking.openURL('mailto:support@capsiccare.com') 
    },
    { 
      title: 'Location', 
      detail: 'Kolkata, West Bengal', 
      icon: MapPin, 
      color: 'bg-orange-50', 
      action: null 
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-950">
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Get in Touch
        </Text>
        <Text className="text-slate-500 mt-1 mb-8">
          We're here to help you with your diagnostic needs 24/7.
        </Text>

        {contactMethods.map((method, index) => (
          <Pressable 
            key={index} 
            onPress={method.action}
            className={`mb-6 p-6 rounded-3xl flex-row items-center border border-slate-100 dark:border-white/5 shadow-sm bg-white dark:bg-slate-900`}
          >
            <View className={`p-4 rounded-2xl ${method.color} dark:bg-slate-800`}>
              <method.icon size={24} color="#0d9488" />
            </View>
            <View className="ml-5">
              <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">{method.title}</Text>
              <Text className="text-slate-500 dark:text-slate-400 mt-1">{method.detail}</Text>
            </View>
          </Pressable>
        ))}

        <View className="mt-8 p-8 bg-teal-600 rounded-3xl items-center">
          <Text className="text-white text-xl font-bold">Need Immediate Help?</Text>
          <Text className="text-teal-100 text-center mt-2">
            Our health experts are available to assist you with booking and reports.
          </Text>
          <Pressable 
            onPress={() => Linking.openURL('tel:+918910260709')}
            className="mt-6 px-8 py-4 bg-white rounded-2xl"
          >
            <Text className="text-teal-600 font-bold text-lg">Call Now</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
