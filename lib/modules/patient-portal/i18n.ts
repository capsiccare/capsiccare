// ==============================================================================
// CAPSIC CARE OS — STEP 11: PATIENT PORTAL MULTILINGUAL DICTIONARY (EN, BN, HI)
// ==============================================================================

export type SupportedLanguage = 'en' | 'bn' | 'hi'

export interface I18nDictionary {
  appName: string
  tagline: string
  emergencyBanner: string
  emergencyCall: string
  nav: {
    dashboard: string
    appointments: string
    bookAppointment: string
    doctors: string
    prescriptions: string
    medications: string
    records: string
    diagnostics: string
    reports: string
    homeCollection: string
    billing: string
    followUps: string
    family: string
    support: string
    feedback: string
    settings: string
  }
  dashboard: {
    welcome: string
    uhid: string
    nextAppointment: string
    activePrescriptions: string
    pendingReports: string
    dueBalance: string
    quickActions: string
    bookDoctor: string
    bookLab: string
    viewPrescriptions: string
    medicalRecords: string
    recentReports: string
    vitalsSummary: string
  }
}

export const translations: Record<SupportedLanguage, I18nDictionary> = {
  en: {
    appName: 'CAPSIC CARE Patient Portal',
    tagline: 'Your Health, Records & Care in One Place',
    emergencyBanner: 'Medical Emergency? Call 102/108 or proceed to the nearest emergency department immediately.',
    emergencyCall: 'Emergency 108',
    nav: {
      dashboard: 'Dashboard',
      appointments: 'My Appointments',
      bookAppointment: 'Book Doctor',
      doctors: 'Find Doctors',
      prescriptions: 'Prescriptions',
      medications: 'Medication Tracker',
      records: 'Health Records',
      diagnostics: 'Lab Tests',
      reports: 'Test Reports',
      homeCollection: 'Home Collection',
      billing: 'Bills & Invoices',
      followUps: 'Follow-ups',
      family: 'Family Care',
      support: 'Help & Support',
      feedback: 'Feedback',
      settings: 'Privacy & Settings',
    },
    dashboard: {
      welcome: 'Welcome back',
      uhid: 'UHID',
      nextAppointment: 'Upcoming Consultation',
      activePrescriptions: 'Active Prescriptions',
      pendingReports: 'Ready Test Reports',
      dueBalance: 'Outstanding Due',
      quickActions: 'Quick Healthcare Actions',
      bookDoctor: 'Consult Doctor',
      bookLab: 'Book Lab Test',
      viewPrescriptions: 'My Medicines',
      medicalRecords: 'Health Timeline',
      recentReports: 'Recent Diagnostic Reports',
      vitalsSummary: 'Recent Recorded Vitals',
    },
  },
  bn: {
    appName: 'ক্যাপসিক কেয়ার পেশেন্ট পোর্টাল',
    tagline: 'আপনার স্বাস্থ্য, প্রেসক্রিপশন ও রিপোর্ট এক জায়গায়',
    emergencyBanner: 'জরুরি চিকিৎসার প্রয়োজন? অবিলম্বে ১০২/১০৮ নম্বরে কল করুন বা নিকটস্থ হাসপাতালে যোগাযোগ করুন।',
    emergencyCall: 'জরুরি ১০৮',
    nav: {
      dashboard: 'ড্যাশবোর্ড',
      appointments: 'আমার অ্যাপয়েন্টমেন্ট',
      bookAppointment: 'ডাক্তার বুক করুন',
      doctors: 'ডাক্তারদের তালিকা',
      prescriptions: 'প্রেসক্রিপশন',
      medications: 'ওষুধের সময়সূচী',
      records: 'স্বাস্থ্য রেকর্ড',
      diagnostics: 'ল্যাব টেস্ট',
      reports: 'টেস্ট রিপোর্ট',
      homeCollection: 'হোম কালেকশন',
      billing: 'বিল ও পেমেন্ট',
      followUps: 'ফলো-আপ কেয়ার',
      family: 'পরিবারের সদস্য',
      support: 'সাহায্য ও সহায়তা',
      feedback: 'মতামত দিন',
      settings: 'সেটিংস ও গোপনীয়তা',
    },
    dashboard: {
      welcome: 'স্বাগতম',
      uhid: 'ইউএইচআইডি',
      nextAppointment: 'আসন্ন কনসালটেশন',
      activePrescriptions: 'বর্তমান প্রেসক্রিপশন',
      pendingReports: 'প্রস্তুত টেস্ট রিপোর্ট',
      dueBalance: 'বকেয়া বিল',
      quickActions: 'দ্রুত সেবা সমূহ',
      bookDoctor: 'ডাক্তার বুক করুন',
      bookLab: 'ল্যাব টেস্ট বুক করুন',
      viewPrescriptions: 'আমার ওষুধ',
      medicalRecords: 'স্বাস্থ্যের ইতিহাস',
      recentReports: 'সাম্প্রতিক টেস্ট রিপোর্ট',
      vitalsSummary: 'শারীরিক সূচক (ভাইটালস)',
    },
  },
  hi: {
    appName: 'कैप्सिक केयर पेशेंट पोर्टल',
    tagline: 'आपका स्वास्थ्य, पर्चे और रिपोर्ट एक ही स्थान पर',
    emergencyBanner: 'आपातकालीन चिकित्सा? तुरंत 102/108 पर कॉल करें या नजदीकी अस्पताल के आपातकालीन विभाग में जाएं।',
    emergencyCall: 'आपातकाल 108',
    nav: {
      dashboard: 'डैशबोर्ड',
      appointments: 'मेरे अपॉइंटमेंट',
      bookAppointment: 'डॉक्टर बुक करें',
      doctors: 'डॉक्टर खोजें',
      prescriptions: 'प्रिस्क्रिप्शन',
      medications: 'दवा ट्रैकर',
      records: 'स्वास्थ्य रिकॉर्ड',
      diagnostics: 'लैब टेस्ट',
      reports: 'जांच रिपोर्ट',
      homeCollection: 'घर पर सैंपल संग्रह',
      billing: 'बिल और भुगतान',
      followUps: 'फॉलो-अप देखभाल',
      family: 'परिवार के सदस्य',
      support: 'सहायता केंद्र',
      feedback: 'प्रतिक्रिया दें',
      settings: 'गोपनीयता और सेटिंग्स',
    },
    dashboard: {
      welcome: 'नमस्ते',
      uhid: 'यूएचआईडी',
      nextAppointment: 'आगामी परामर्श',
      activePrescriptions: 'सक्रिय प्रिस्क्रिप्शन',
      pendingReports: 'तैयार जांच रिपोर्ट',
      dueBalance: 'बकाया राशि',
      quickActions: 'त्वरित सेवाएं',
      bookDoctor: 'डॉक्टर से परामर्श',
      bookLab: 'लैब टेस्ट बुक करें',
      viewPrescriptions: 'मेरी दवाएं',
      medicalRecords: 'स्वास्थ्य इतिहास',
      recentReports: 'हालिया जांच रिपोर्ट',
      vitalsSummary: 'स्वास्थ्य मापदंड (वाइटल्स)',
    },
  },
}
