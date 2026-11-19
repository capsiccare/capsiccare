import { View, Text, ScrollView, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

export default function LabTests() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-950">
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Search Lab Tests
        </Text>
        
        <View className="mt-4 flex-row items-center bg-slate-100 dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10">
          <Search size={20} color="#64748b" />
          <TextInput 
            className="flex-1 ml-3 text-slate-800 dark:text-slate-100"
            placeholder="Search for blood tests, X-rays..."
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View className="mt-8">
          <Text className="text-lg font-semibold text-teal-600 dark:text-teal-400 mb-4">
            Popular Tests
          </Text>
          {['Complete Blood Count', 'Lipid Profile', 'Thyroid Profile', 'Diabetes Screening'].map((test, index) => (
            <View key={index} className="mb-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
              <Text className="font-medium text-slate-800 dark:text-slate-100">{test}</Text>
              <Text className="text-sm text-slate-500 mt-1">Starting from ₹385</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
