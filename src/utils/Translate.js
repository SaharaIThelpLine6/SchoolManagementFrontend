import { useSelector } from "react-redux";

const useTranslate = () => {
  const { currectLanguage } = useSelector((state) => state.language);

  const englishToBangla = {
    'Home': 'হোম',
    'Student': 'ছাত্র-ছাত্রী',
    'Book List': 'বুক লিস্ট',
    'Staff': 'স্টাফ',
    'Exam': 'পরীক্ষা',
    'Libery': 'লাইব্রেরি',
    'Others': 'অন্যান্য',
    'Setting': 'সেটিংস',
    'Sahara IT': 'সাহারা আইটি',
    'Sahara': 'সাহারা',
    'IT': 'আইটি',
    'Last Modified': 'সর্বশেষ পরিবর্তিত',
    'Last': 'সর্বশেষ',
    'Modified': 'পরিবর্তিত',
    'Today': 'আজ',
    'Last Week': 'শেষ সপ্তাহ',
    'Last Month': 'শেষ মাস',
    'Date Added': 'তারিখ যোগ ',
    'Date': 'তারিখ',
    'Added': 'যোগ করা হয়েছে',
    'Newest First': 'নতুন থেকে শুরু',
    'Oldest First': 'পুরাতন থেকে শুরু',
    'Search': 'অনুসন্ধান',
    'Notification': 'বিজ্ঞপ্তি',
    'Online': 'অনলাইন',
    'Set Status': 'অবস্থা নির্ধারণ',
    'Settings': 'সেটিংস',
    'Share Your Opinion': 'আপনার মতামত শেয়ার করুন',
    'Class': "শ্রেণী",
    'English': "ইংরেজী",
    'Add Class': "ক্লাস যোগ করুন",
    'Save': "সংরক্ষণ করুন",
    'Add New': "নতুন যোগ করুন",
    'Serial': "সিরিয়াল",
    'Sections': 'সাব ক্লাস',
    'Bangla': 'বাংলা',
    'Arabic': "আরবি",
    'User': 'ইউজার',
    'Filter': 'ফিল্টার',
    'Not Admitted students': 'ভর্তি না হওয়া শিক্ষার্থী',
    'Admitted students': 'ভর্তিকৃত শিক্ষার্থী ',
    'Complete Admission': 'ভর্তি সম্পূর্ন করুন',
    'Admitted Students List': "ভর্তিকৃত ছাত্র তালিকা",
    'Not Admitted Students List': "ভর্তি না হওয়া শিক্ষার্থীদের তালিকা",
    'Student Name': 'শিক্ষার্থীর নাম',
    'Father Name': "পিতার নাম",
    'Mobile': "মোবাইল",
    'Entry Date': "এন্টি তারিখ",
    'Session': "শিক্ষাবর্ষ",
    'Admission Class': "ভর্তি ইচ্ছুক ক্লাস",
    'Admission Serial': "ভর্তি সিরিয়াল",
    'Financial Condition': "আর্থিক অবস্থা",
    'Living Condition': "আবাসন অবস্থা",
    'Admission Type': "ভর্তির ধরণ",
    'Select': "নির্বাচন করুন",
    'Admission Details': 'ভর্তির ফরম',
    'Request already in progress. Please wait...': 'অনুরোধ ইতিমধ্যে প্রক্রিয়াধীন। অনুগ্রহ করে অপেক্ষা করুন...',
    'Information Added Successfully': 'তথ্য যুক্ত করা হয়েছে।',
    
  };

  return (key) => currectLanguage === 'bn' ? englishToBangla[key] || key : key;
};

export default useTranslate;
