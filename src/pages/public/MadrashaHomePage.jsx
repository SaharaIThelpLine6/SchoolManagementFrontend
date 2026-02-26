import { Buffer } from 'buffer';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Counter from '../../components/Counter';
import { fetchWebsiteSettings } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import bnBijoy2Unicode from '../../utils/conveter';
import avaterImage from '/avatar.png';
const API_URL = import.meta.env.VITE_SERVER_URL;
const MadrashaHomePage = () => {
  const { schoolid } = useParams();
  const { schoolData, websiteSettings } = useSelector(
    (state) => state.studentResultPublicView
  );
  const dispatch = useDispatch();
  useEffect(() => {
    // console.log("Emon hasan");
    // console.log(schoolid);

    dispatch(fetchWebsiteSettings({ schoolId: schoolid }));
  }, [dispatch]);

  const settingsObject = React.useMemo(() => {
    if (!websiteSettings || websiteSettings.length === 0) return {};

    return websiteSettings.reduce((acc, item) => {
      acc[item.FieldKey] = item.FieldValue;
      return acc;
    }, {});
  }, [websiteSettings]);

  console.log(settingsObject, 'settingsObject');

  function toArray(value) {
    if (!value) return [];

    // Already an array
    if (Array.isArray(value)) return value;

    // Try JSON parsing
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // Fallback: comma-separated string
        return value.split(',').map((item) => item.trim());
      }
    }

    return [];
  }

  useEffect(() => {
    console.log(settingsObject);
  }, [settingsObject]);
  const bufferConveter = (bufferData) => {
    if (!bufferData) {
      return '/logo.png';
    }
    const buffer = Buffer.from(bufferData);
    const base64String = buffer.toString('base64');
    const imageSrc = `data:image/png;base64,${base64String}`;
    return imageSrc;
  };
  return (
    <div className="madrasha-home-page min-h-screen bg-[#f9f9f9] py-[50px] ">
      <div className="container mx-auto px-2 lg:px-0">
        <div className="flex items-center flex-wrap lg:flex-nowrap">
          <div className="text_area text-center md:text-start w-full lg:w-1/2 pr-2">
            <h1 className=" text-[28px] md:text-[40px] text-theme-color">
              {settingsObject?.primaryHeading}
            </h1>
            <h2 className="text-[18px] md:text-[22px] mt-2 mb-4">
              {schoolData?.InstitutionName}, {schoolData?.Address}{' '}
              {settingsObject.aboutText}
            </h2>
            {/* <Link to={`/${schoolid}/student_result`} className='py-4 px-4 bg-[#4154f1] text-white rounded-[5px] font-Poppins mt-4 inline-block shadow-xl'>Explore Our Result Section</Link> */}
          </div>
          <div className="image_section pt-[50px] w-full md:pt-0 lg:w-1/2">
            <img
              src={`${API_URL}/public/${settingsObject.BannerImage}`}
              alt="madrasha image"
              className="up_down_animation rounded-[5px]"
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-2 lg:px-0 py-[100px]">
        <div className="pb-[40px]">
          <div className="text_area text-center pr-2">
            <h2 className=" text-[28px] md:text-[40px] font-bold">
              {settingsObject.whyUsTitle}
            </h2>
          </div>
        </div>

        <div className="flex gap-[20px] flex-wrap lg:flex-nowrap">
          <div className="image w-full lg:w-1/2">
            <img
              src={`${API_URL}/public/${settingsObject.whyUsImage}`}
              alt=""
              className="rounded-[4px]"
            />
          </div>
          <div className="list_of_whychose_us w-full lg:w-1/2">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-[20px] items-center flex-wrap">
              {toArray(settingsObject.whyUsItems).map((whyUsItem, index) => (
                <li
                  className="flex bg-white px-2 py-4 gap-[15px] items-center rounded-[4px] shadow-md h-full"
                  key={whyUsItem.text}
                >
                  <div className="icon w-[30px] h-[30px] bg-[#ecf3ff] flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-check"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M5 12l5 5l10 -10" />
                    </svg>
                  </div>
                  <p className="font-bold text-theme-color">{whyUsItem.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div
        className="px-0 lg:px-0 py-[80px] pb-[100px] relative"
        style={{
          backgroundImage: `url("${API_URL}/public/${settingsObject.BannerImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="overly bg-[#00000080] absolute top-0 w-full h-full"></div>
        <div className="relative z-10">
          <div className="pb-[40px]">
            <div className="text_area text-center pr-2">
              <h2 className=" text-[28px] md:text-[40px] font-bold text-white">
                {' '}
                {settingsObject?.studentListHeading}{' '}
              </h2>
            </div>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-4 place-content-center container mx-auto px-2 lg:px-0`}>
            {settingsObject?.totalUser ? (
              <div className="count-box px-2 py-4 rounded-[4px] bg-[#00000080]">
                <div className="text-center">
                  <div className="text-white text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={40}
                      height={40}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-users-group mx-auto"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
                      <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M17 10h2a2 2 0 0 1 2 2v1" />
                      <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
                    </svg>
                  </div>
                  <Counter end={settingsObject?.totalUser} duration={2000} />
                  <p className="text-[20px] text-white">
                    মোট শিক্ষার্থী{' '}
                    {bnBijoy2Unicode(String(settingsObject?.totalUser))} জন।
                  </p>
                </div>
              </div>
            ) : null}
            {settingsObject?.active_session_student ? (
              <div className="count-box px-2 py-4 rounded-[4px] bg-[#00000080]">
                <div className="text-center">
                  <div className="text-white text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={40}
                      height={40}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-user-screen mx-auto"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M19.03 17.818a3 3 0 0 0 1.97 -2.818v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -3 3v8c0 1.317 .85 2.436 2.03 2.84" />
                      <path d="M10 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M8 21a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2" />
                    </svg>
                  </div>
                  <Counter
                    end={settingsObject?.active_session_student}
                    duration={2000}
                  />
                  <p className="text-[20px] text-white">
                    {' '}
                    এবছর মোট শিক্ষার্থী{' '}
                    {bnBijoy2Unicode(
                      String(settingsObject?.active_session_student)
                    )}{' '}
                    জন।
                  </p>
                </div>
              </div>
            ) : null}
            {settingsObject?.active_male_student ? (
              <div className="count-box px-2 py-4 rounded-[4px] bg-[#00000080]">
                <div className="text-center">
                  <div className="text-white text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={40}
                      height={40}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-user-screen mx-auto"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M19.03 17.818a3 3 0 0 0 1.97 -2.818v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -3 3v8c0 1.317 .85 2.436 2.03 2.84" />
                      <path d="M10 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M8 21a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2" />
                    </svg>
                  </div>
                  <Counter
                    end={settingsObject?.active_male_student}
                    duration={2000}
                  />
                  <p className="text-[20px] text-white">
                    {' '}
                    এবছর মোট ছাত্র{' '}
                    {bnBijoy2Unicode(
                      String(settingsObject?.active_male_student)
                    )}{' '}
                    জন।
                  </p>
                </div>
              </div>
            ) : null}
            {settingsObject?.active_female_student ? (
              <div className="count-box px-2 py-4 rounded-[4px] bg-[#00000080]">
                <div className="text-center">
                  <div className="text-white text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={40}
                      height={40}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-user-screen mx-auto"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M19.03 17.818a3 3 0 0 0 1.97 -2.818v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -3 3v8c0 1.317 .85 2.436 2.03 2.84" />
                      <path d="M10 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M8 21a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2" />
                    </svg>
                  </div>
                  <Counter
                    end={settingsObject?.active_female_student}
                    duration={2000}
                  />
                  <p className="text-[20px] text-white">
                    {' '}
                    এবছর মোট ছাত্রী {' '}
                    {bnBijoy2Unicode(
                      String(settingsObject?.active_female_student)
                    )}{' '}
                    জন।
                  </p>
                </div>
              </div>
            ) : null}
            {settingsObject?.teacherUser ? (
              <div className="count-box px-2 py-4 rounded-[4px] bg-[#00000080]">
                <div className="text-center">
                  <div className="text-white text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={40}
                      height={40}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-user-screen mx-auto"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M19.03 17.818a3 3 0 0 0 1.97 -2.818v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -3 3v8c0 1.317 .85 2.436 2.03 2.84" />
                      <path d="M10 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M8 21a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2" />
                    </svg>
                  </div>
                  <Counter
                    end={settingsObject?.teacherUser}
                    duration={2000}
                  />
                  <p className="text-[20px] text-white">
                    {' '}
                    মোট শিক্ষক{' '}
                    {bnBijoy2Unicode(String(settingsObject?.teacherUser))} জন।
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-2 lg:px-0 py-[60px]">
        <div className="pb-[40px]">
          <div className="text_area text-center pr-2">
            <h2 className="text-[28px] md:text-[40px] font-bold">
              {settingsObject.subjectListTitle}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
          {settingsObject?.accademicSubject
            ? settingsObject.accademicSubject.map((subject) =>
                subject.AcademicSubjects &&
                subject.AcademicSubjects.length > 0 ? (
                  <div className="card shadow-sm hover:shadow-xl transition-all linear duration-300 border rounded-[4px]">
                    <div className="header text-center py-2">
                      <p className="text-[20px] font-bold border-b border-black-600">
                        {subject.SubClass}
                      </p>
                    </div>
                    <ul className="px-2 py-2">
                      {subject.AcademicSubjects?.map((academicSubject) => (
                        <li
                          key={academicSubject.SubjectID}
                          className="text-[18px]"
                        >
                          {academicSubject.SubjectName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )
            : null}
        </div>
      </div>
      <div className="container mx-auto px-2 lg:px-0 py-[60px]">
        <div className="pb-[40px]">
          <div className="text_area text-center pr-2">
            <h2 className="text-[28px] md:text-[40px] font-bold">
              {settingsObject.teacherListTitle}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
          {settingsObject?.teachers?.map((teacher, index) => {
            const imageData = teacher?.Image?.data || avaterImage;
            // console.log(imageData);

            // if (!imageData) return null;

            return (
              <div
                key={teacher.UserID || index}
                className="card shadow-sm hover:shadow-xl transition-all duration-300 border rounded-[4px]"
              >
                <div
                  className="image h-[320px] relative
          after:bg-[url(/team-shape.ea006852.svg)]
          after:content-['']
          after:absolute
          after:bottom-0
          after:w-full
          after:bg-center
          after:block
          after:h-[80px]
          after:bg-no-repeat
          after:bg-cover"
                >
                  <img
                    src={bufferConveter(imageData)}
                    alt={teacher.UserName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="header text-center pt-0 pb-8 bg-white">
                  <h3 className="text-[20px] font-bold border-b border-black-600 pb-3">
                    {teacher.UserName}
                  </h3>
                  <p className="text-[#aaa] mt-2">{teacher.Designation}</p>
                  <p className="text-[#aaa] mt-1">
                    মোবাইল নং. {teacher.Mobile1}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MadrashaHomePage;
