import { View, Text, ScrollView, Pressable } from 'react-native';
import { ShieldCheck, HeartPulse, Microscope } from 'lucide-react-native';

export default function Packages() {
  const packages = [
    { title: 'Thyroid & Wellness Check', icon: ShieldCheck, price: '₹499', color: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Basic Full Body Check-Up', icon: HeartPulse, price: '₹699', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Diabetes & Sugar Care', icon: Microscope, price: '₹699', color: 'bg-teal-50 dark:bg-teal-900/20' },
    { title: 'Heart & Metabolic Check', icon: HeartPulse, price: '₹799', color: 'bg-rose-50 dark:bg-rose-900/20' },
    { title: 'Vitamin & Energy Check', icon: ShieldCheck, price: '₹949', color: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-950">
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Health Packages
        </Text>
        <Text className="text-slate-500 mt-1 mb-6">
          Comprehensive health screenings at affordable prices
        </Text>

        {packages.map((pkg, index) => (
          <Pressable key={index} className={`mb-6 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm ${pkg.color}`}>
            <View className="flex-row items-center justify-between">
              <View className="p-3 bg-white dark:bg-slate-800 rounded-2xl">
                <pkg.icon size={24} color="#0d9488" />
              </View>
              <Text className="text-xl font-bold text-teal-600 dark:text-teal-400">{pkg.price}</Text>
            </View>
            <Text className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">{pkg.title}</Text>
            <Text className="mt-2 text-slate-500 dark:text-slate-400">Includes 60+ parameters with free home sample collection.</Text>
            
            <View className="mt-6 py-3 bg-teal-600 rounded-xl items-center">
              <Text className="text-white font-bold">Book Now</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
