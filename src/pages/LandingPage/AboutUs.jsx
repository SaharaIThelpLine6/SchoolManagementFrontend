import useInView from '../../hooks/LandingPageHooks/useInView';

/* ---------- ছোট helper section component ---------- */
const InfoCard = ({ title, children, icon }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 animate-bounce-in">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold text-primary-dark">{title}</h2>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
};

const StatsItem = ({ value, label }) => {
  return (
    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary-navy/5 to-primary/10 animate-fade-in-up">
      <div className="text-3xl md:text-4xl font-extrabold text-primary-dark">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
};

/* ---------- মূল পেজ ---------- */
const AboutUs = () => {
  return (
    <>
      {/* Hero section */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-br from-primary-navy via-primary-dark to-primary text-white text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-white/20 text-white px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm mb-4 backdrop-blur-sm">
            প্রতিষ্ঠানের তথ্য
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            আপনার শিক্ষাপ্রতিষ্ঠানের পূর্ণাঙ্গ পরিচিতি
          </h1>
          <p className="text-base md:text-lg text-white/85 max-w-xl mx-auto">
            আমরা শিক্ষা ব্যবস্থাপনাকে সহজ, স্বচ্ছ ও আধুনিক করতে প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>
      </section>

      {/* Info cards */}
      <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoCard title="আমাদের সম্পর্কে" icon="🏫">
            আমরা একটি বিশ্বস্ত শিক্ষা ব্যবস্থাপনা সফটওয়্যার সরবরাহকারী প্রতিষ্ঠান। দীর্ঘদিন ধরে স্কুল, কলেজ, মাদ্রাসা ও কোচিং সেন্টারের প্রশাসনিক কাজ সহজ করে আসছি। আমাদের সিস্টেম বর্তমানে সারাদেশের শতাধিক প্রতিষ্ঠানে ব্যবহৃত হচ্ছে।
          </InfoCard>

          <InfoCard title="আমাদের মিশন" icon="🎯">
            প্রযুক্তির সর্বোচ্চ ব্যবহার নিশ্চিত করে শিক্ষাপ্রতিষ্ঠানের ব্যবস্থাপনাকে ডিজিটালাইজড করা, যাতে প্রশাসনিক কাজের সময় ও খরচ কমে এবং শিক্ষার মান উন্নত হয়।
          </InfoCard>

          <InfoCard title="আমাদের ভিশন" icon="🔭">
            ২০৩০ সালের মধ্যে বাংলাদেশের প্রতিটি শিক্ষাপ্রতিষ্ঠানকে ডিজিটাল ব্যবস্থাপনার আওতায় আনা এবং আন্তর্জাতিক মানের সেবা প্রদান করা।
          </InfoCard>

          <InfoCard title="যোগাযোগ" icon="📞">
            <p className="mb-2">📍 ভাঙ্গা প্রেস, যাত্রাবাড়ী, ঢাকা, বাংলাদেশ</p>
            <p className="mb-2">📞 ০১৮২২-৯৩০০৫৫</p>
          </InfoCard>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">আমাদের অর্জন</h2>
          <p className="text-base text-gray-500">কিছু গুরুত্বপূর্ণ সংখ্যা যা আমাদের সফলতার গল্প বলে</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <StatsItem value="১০০+" label="সক্রিয় প্রতিষ্ঠান" />
          <StatsItem value="৫০০+" label="শিক্ষক ব্যবহারকারী" />
          <StatsItem value="১০,০০০+" label="শিক্ষার্থী" />
          <StatsItem value="২৪/৭" label="সাপোর্ট" />
        </div>
      </section>
    </>
  );
};

export default AboutUs;
