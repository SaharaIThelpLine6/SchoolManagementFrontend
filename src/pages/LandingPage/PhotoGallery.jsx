const img1 = 'LandingPage/assets/photogallary/img1.jpg';
const img2 = 'LandingPage/assets/photogallary/img2.jpg';
const img3 = 'LandingPage/assets/photogallary/img3.jpg';
const img4 = 'LandingPage/assets/photogallary/img4.jpg';
const img5 = 'LandingPage/assets/photogallary/img3.jpg';
const img6 = 'LandingPage/assets/photogallary/img4.jpg';
const img7 = 'LandingPage/assets/photogallary/img1.jpg';
const img8 = 'LandingPage/assets/photogallary/img2.jpg';
const img9 = 'LandingPage/assets/photogallary/img2.jpg';
const img10 = 'LandingPage/assets/photogallary/img1.jpg';
const img11 = 'LandingPage/assets/photogallary/img4.jpg';
const img12 = 'LandingPage/assets/photogallary/img3.jpg';

// -------------------- ছোট ইমেজ কার্ড --------------------
const GalleryCard = ({ src, alt }) => {
  return (
    <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 animate-bounce-in">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      {/* ওভারলে */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white text-sm font-medium truncate">{alt}</p>
      </div>
    </div>
  );
};

// -------------------- মূল পেজ --------------------
const PhotoGallery = () => {
  const images = [
    { src: img1, alt: 'সফটওয়্যার প্রশিক্ষণ কর্মশালা' },
    { src: img2, alt: 'বার্ষিক পুরস্কার বিতরণী' },
    { src: img3, alt: 'শিক্ষক প্রশিক্ষণ সেশন' },
    { src: img4, alt: 'মাদ্রাসা পরিদর্শন' },
    { src: img5, alt: 'নতুন ক্যাম্পাস উদ্বোধন' },
    { src: img6, alt: 'আইটি মেলা ২০২৫' },
    { src: img7, alt: 'গ্রাহক সমাবেশ' },
    { src: img8, alt: 'সাংস্কৃতিক অনুষ্ঠান' },
    { src: img9, alt: 'সফটওয়্যার লঞ্চ' },
    { src: img10, alt: 'দাতা সম্মাননা' },
    { src: img11, alt: 'শিক্ষা মেলা' },
    { src: img12, alt: 'টিম আউটিং' },
  ];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-br from-primary-navy via-primary-dark to-primary text-white text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-white/20 text-white px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm mb-4 backdrop-blur-sm">
            স্মৃতিময় মুহূর্ত
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            ফটো গ্যালারি
          </h1>
          <p className="text-base md:text-lg text-white/85 max-w-xl mx-auto">
            আমাদের বিভিন্ন কার্যক্রম, অনুষ্ঠান ও সফলতার কিছু স্মরণীয় মুহূর্ত এখানে দেখুন।
          </p>
        </div>
      </section>

      {/* ---------- গ্যালারি গ্রিড ---------- */}
      <section className="py-16 md:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {images.map((img, idx) => (
            <GalleryCard key={idx} src={img.src} alt={img.alt} />
          ))}
        </div>
      </section>
    </>
  );
};

export default PhotoGallery;
