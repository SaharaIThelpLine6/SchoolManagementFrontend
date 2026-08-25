const img1 = 'LandingPage/assets/teamimg/img3.png';
const img2 = 'LandingPage/assets/teamimg/img2.jfif';
const img3 = 'LandingPage/assets/teamimg/img1.jfif';

const TeamMember = ({ name, role, bio, img }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 animate-bounce-in">
      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 bg-gray-100">
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">{name}</h3>
      <p className="text-sm text-primary-dark font-medium mb-2">{role}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{bio}</p>
    </div>
  );
};

const ManagementTeam = () => {
  const team = [
    {
      name: 'খোরশেদ আলম খন্দকার',
      role: 'Chairman',
      bio: 'সাহারা আইটির প্রতিষ্ঠাতা , গবেষক,',
      img: img1,
    },
    {
      name: 'ফরহাদ হাসান',
      role: '(CEO) Chief Executive Officer',
      bio: 'সর্বোচ্চ নির্বাহী কর্মকর্তা',
      img: img2,
    },
    {
      name: 'নাহিদুল ইসলাম',
      role: 'Software Developer',
      bio: '.Net Framework, C++, MySql সহ একাধিক প্রোগ্রামিং ল্যাংগুয়েজে অভিজ্ঞ ডেভেলোপার।',
      img: img3,
    },
    {
      name: 'মো: ইমন হাসান',
      role: 'Web Developer',
      bio: 'JAVASCRIPT,MySQL,Laravel,etc.',
      img: 'https://placehold.co/200x200/0F828C/white?text=Developer',
    },
    {
      name: 'মনছুরুল আজম (শিপু)',
      role: 'কাস্টমার সাপোর্ট লিড',
      bio: 'গ্রাহক সেবায় ১০ বছরের অভিজ্ঞতা।',
      img: 'https://placehold.co/200x200/0F828C/white?text=manager',
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-br from-primary-navy via-primary-dark to-primary text-white text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-white/20 text-white px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm mb-4 backdrop-blur-sm">
            আমাদের টিম
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            ব্যবস্থাপনা টিম
          </h1>
          <p className="text-base md:text-lg text-white/85 max-w-xl mx-auto">
            আমাদের দক্ষ ও অভিজ্ঞ টিমের সদস্যরা শিক্ষা ব্যবস্থাপনাকে সহজ করতে নিরলস কাজ করছে।
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <TeamMember key={idx} {...member} />
          ))}
        </div>
      </section>
    </>
  );
};

export default ManagementTeam;
