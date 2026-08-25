import React from 'react';

/* ---------- ছোট helper section component ---------- */
const PolicyBlock = ({ title, children }) => {
  return (
    <div className="mb-10 animate-fade-in-up">
      {title && (
        <h2 className="text-xl md:text-2xl font-bold text-primary-dark mb-4 border-b border-gray-100 pb-3">
          {title}
        </h2>
      )}
      <div className="text-sm md:text-base text-gray-700 leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
};

/* ---------- মূল পেজ ---------- */
const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero section */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-br from-primary-navy via-primary-dark to-primary text-white text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-white/20 text-white px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm mb-4 backdrop-blur-sm">
            Legal Information
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-base md:text-lg text-white/85 max-w-xl mx-auto">
            Effective Date: 02/22/2026
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="px-6 -mt-10 md:-mt-16 max-w-4xl mx-auto relative z-10">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-14 shadow-lg">
          
          <PolicyBlock>
            <p>
              Thank you for using Sahara IT Management Software, the mobile application for our School Management System. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our Web & Android application.
            </p>
            <p>
              By using the application, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
          </PolicyBlock>

          <PolicyBlock title="Information We Collect">
            <p>We may collect the following information:</p>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>Full name</li>
              <li>Phone number</li>
            </ul>
            <p>
              We do not collect unnecessary personal information beyond what is required to provide our services.
            </p>
          </PolicyBlock>

          <PolicyBlock title="How We Use Your Information">
            <p>We use your information to:</p>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>Provide access to your account.</li>
              <li>Verify your identity.</li>
              <li>Verify your identity.</li>
              <li>Send important notifications and updates.</li>
              <li>Improve the performance, security, and reliability of the application.</li>
              <li>Respond to support requests.</li>
            </ul>
          </PolicyBlock>

          <PolicyBlock title="Permissions">
            <p>The application may request the following permissions:</p>
            <div className="mt-4 space-y-4">
              <div>
                <strong className="text-gray-900 block mb-1">Camera</strong>
                <p>The Camera permission is used only when you choose to capture or upload a profile picture or other images within the application. The camera is never accessed without your permission.</p>
              </div>
              <div>
                <strong className="text-gray-900 block mb-1">Notifications</strong>
                <p>The Notification permission is used to send important updates, announcements, reminders, and other information related to your account and services. You can manage notification preferences through your device settings.</p>
              </div>
            </div>
          </PolicyBlock>

          <PolicyBlock title="Data Sharing">
            <p>We do not sell, rent, or trade your personal information.</p>
            <p>Your information may be shared only:</p>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>With your educational institution as necessary to provide the service.</li>
              <li>With trusted service providers who help us operate the application.</li>
              <li>When required by law or to protect our legal rights.</li>
            </ul>
          </PolicyBlock>

          <PolicyBlock title="Data Security">
            <p>
              We implement reasonable technical and organizational measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of electronic transmission or storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </PolicyBlock>

          <PolicyBlock title="Data Retention">
            <p>
              We retain your information only for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </PolicyBlock>

          <PolicyBlock title="Children's Privacy">
            <p>
              This application is intended for users who are authorized by their educational institution to access the service. If you believe that personal information has been provided inappropriately, please contact us so we can review the request.
            </p>
          </PolicyBlock>

          <PolicyBlock title="Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted within the application or on our website with an updated "Effective Date".
            </p>
          </PolicyBlock>

          <PolicyBlock title="Contact Us">
            <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us:</p>
            <div className="mt-3 space-y-1">
              <p><strong className="text-gray-900">Company:</strong> Sahara IT</p>
              <p><strong className="text-gray-900">Email:</strong> saharait@gmail.com</p>
              <p><strong className="text-gray-900">Website:</strong> <a href="https://saharait.com/" className="text-primary-dark hover:underline" target="_blank" rel="noopener noreferrer">https://saharait.com/</a></p>
            </div>
          </PolicyBlock>

        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
