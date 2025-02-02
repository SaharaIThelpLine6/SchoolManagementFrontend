import { useSelector } from "react-redux";

const Translate = (key) => {
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
        'Arabic': "আরবি"
    };
    return currectLanguage === 'bn' ? englishToBangla[key] || key : key;
};

export default Translate;
