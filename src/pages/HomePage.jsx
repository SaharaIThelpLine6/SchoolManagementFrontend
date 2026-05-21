import React, { useState, useEffect } from "react";

export default function HomePage() {

  return (
    <div className="">

      <div className="banner-four overflow-hidden pb-[15px] max-xl:pb-0 max-xl:mb-[-50px] max-sm:!pb-2.5 max-sm:!mb-0 bg-[url('https://samar-tailwind.vercel.app/assets/images/main-slider/slider4/background2.png')] bg-cover bg-no-repeat">
        <div className="container banner-inner flex items-center pt-[200px] min-h-[800px] max-xl:pt-[120px] max-xl:min-h-[750px] max-lg:!pt-[80px] max-lg:!min-h-full">

          <div className=" flex row items-center">
            <div className="md:w-7/12">
              <div className="banner-content -mt-16 max-md:mt-0 max-sm:pb-7.5">
                <h6
                  data-wow-delay="0.5s"
                  data-wow-duration="3s"
                  className="wowInUp text-base max-sm:text-[0.8rem] pb-1 !text-primary border-b-2 border-primary inline-block"
                >
                  We Are Product Designer From India
                </h6>
                <h1
                  data-wow-delay="1s"
                  data-wow-duration="3s"
                  className="wowInUp title mb-[15px] text-[3.2rem] max-xl:text-[2.5rem] max-sm:!text-[1.8rem] font-bold"
                >
                  We Design Interfaces That Users Love
                </h1>
                <p
                  data-wow-delay="1.5s"
                  data-wow-duration="3s"
                  className="wowInUp description mb-5 pt-2 ltr:pr-16 rtl:pl-16 ltr:max-md:pr-8 rtl:max-md:pl-8"
                >
                  Nunc vel ligula ut erat scelerisque vehicula sit amet porttitor
                  magna. Donec malesuada quis diam quis pellentesque. Mauris mollis
                  ligula magna.Nunc vel ligula ut erat scelerisque vehicula sit
                </p>
                <ul className="mb-7.5">
                  <li
                    className="flex items-center mb-[3px] gap-x-5 max-lg:gap-x-2.5 wowInUp"
                    data-wow-delay="1.5s"
                  >
                    <svg
                      className="text-primary"
                      width={18}
                      height={18}
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {" "}
                      <circle cx={9} cy={9} r={6} fill="currentColor" />{" "}
                      <circle
                        cx={9}
                        cy={9}
                        r="7.5"
                        stroke="currentColor"
                        strokeOpacity="0.3"
                        strokeWidth={3}
                      />
                    </svg>
                    Master's degree in designing
                  </li>
                  <li
                    className="flex items-center mb-[3px] gap-x-5 max-lg:gap-x-2.5 wowInUp"
                    data-wow-delay="1.5s"
                  >
                    <svg
                      className="text-primary"
                      width={18}
                      height={18}
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {" "}
                      <circle cx={9} cy={9} r={6} fill="currentColor" />{" "}
                      <circle
                        cx={9}
                        cy={9}
                        r="7.5"
                        stroke="currentColor"
                        strokeOpacity="0.3"
                        strokeWidth={3}
                      />
                    </svg>
                    Outstanding mobile design
                  </li>
                </ul>
                <a
                  href="about-us-3.html"
                  className="py-5 px-[35px] max-xl:py-3 max-xl:px-[25px] text-[15px] max-xl:text-sm inline-block font-medium leading-[1.2] uppercase bg-primary hover:bg-primaryhover text-white rounded duration-700"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="md:w-5/12">
              <div
                className="dz-media relative ltr:-ml-20 rtl:-mr-20 ltr:max-lg:ml-0 rtl:max-lg:mr-0 max-sm:mt-[60px] wowIn"
                data-wow-delay="1s"
                data-wow-duration="3s"
              >
                <svg
                  className="text-primary max-xl:w-[600px] ltr:max-xl:ml-[-70px] rtl:max-xl:mr-[-70px] max-lg:!w-[450px] ltr:max-lg:!ml-[-100px] rtl:max-lg:!mr-[-100px]"
                  width={679}
                  height={680}
                  viewBox="0 0 679 680"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g filter="url(#filter0_d_16_993)">
                    <path
                      d="M169.962 120.407C185.63 60.8492 259.895 40.5862 303.64 83.9334L590.514 368.2C634.259 411.548 614.674 485.995 555.262 502.205L165.643 608.512C106.23 624.722 51.5496 570.538 67.217 510.98L169.962 120.407Z"
                      fill="currentColor"
                    />
                  </g>
                  <defs>
                    <filter
                      id="filter0_d_16_993"
                      x="0.501526"
                      y="0.708908"
                      width="677.75"
                      height="678.711"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity={0} result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy={4} />
                      <feGaussianBlur stdDeviation={32} />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.45098 0 0 0 0 0.333333 0 0 0 0 0.968627 0 0 0 0.4 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_16_993"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_16_993"
                        result="shape"
                      />
                    </filter>
                    <linearGradient
                      id="paint0_linear_16_993"
                      x1="205.214"
                      y1="-13.5979"
                      x2="412.198"
                      y2="745.011"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset={1} stopColor="#7355F7" />
                      <stop offset={1} stopColor="#1A008A" />
                    </linearGradient>
                  </defs>
                </svg>
                <img
                  src="https://samar-tailwind.vercel.app/assets/images/main-slider/slider4/hero.png"
                  alt=""
                  className="absolute top-[-58px] ltr:left-[52%] rtl:right-[52%] ltr:-translate-x-1/2 rtl:[transform:translateX(50%)_rotateY(180deg)] min-w-[580px] max-xl:top-[-52px] ltr:max-xl:left-[40%] rtl:max-xl:right-[40%]  max-xl:min-w-[550px] max-lg:!min-w-[400px] max-lg:!top-[54px] ltr:max-sm:!left-[44%] rtl:max-sm:!right-[44%]"
                />
                <ul>
                  <li className="absolute animate-move ltr:left-[-60px] rtl:right-[-60px] max-xl:-left-7.5 max-lg:!-left-20 top-[40%] max-xl:w-[180px] max-lg:w-[200px]">
                    <img
                      src="assets/images/main-slider/slider4/pic3.png"
                      className="max-sm:w-[150px] wow zoomIn"
                      data-wow-delay="2.2s"
                      alt=""
                    />
                  </li>
                  <li className="absolute animate-move ltr:left-[55%] rtl:right-[55%] top-[70%] ltr:max-xl:left-1/2 rtl:max-xl:right-1/2 max-xl:top-[65%] max-lg:!top-[60%] ltr:max-lg:!left-[40%] rtl:max-lg:!right-[40%] min-w-[300px] max-xl:min-w-[200px]">
                    <img
                      src="assets/images/main-slider/slider4/pic2.png"
                      className="max-md:w-[300px] max-sm:w-[200%] wow zoomIn"
                      data-wow-delay="1.6s"
                      alt=""
                    />
                  </li>
                  <li className="absolute animate-move ltr:left-[70%] rtl:right-[70%] ltr:max-2xl:left-1/2 rtl:max-2xl:right-1/2 ltr:max-lg:!left-[40%] rtl:max-lg:!right-[40%] top-[26%] max-lg:top-[30%] max-md:!top-[24%] min-w-[300px] max-xl:min-w-[220px] max-sm:!min-w-[160px]">
                    <img
                      src="assets/images/main-slider/slider4/pic1.png"
                      className="wow zoomIn"
                      data-wow-delay="0.8s"
                      alt=""
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>


      <section
        className="section-wrap bg-[#191919] md:pb-[60px] overflow-hidden z-50 relative"
        id="about"
      >
        <div className="wraper">
          <div className="grid grid-cols-2 md:grid-cols-1 grid-rows-1 items-center">

            {/* Left Content */}
            <div className="relative z-20 md:max-w-[480px]">
              <div className="max-w-[350px] col:max-w-[350px] text-center rounded-[10px] pb-[180px] bg-gradient-to-b to-[#1B1B19] from-[#2E2C1F] xl:ml-[20px] col:ml-0">
                <h2 className="text-[140px] col:text-[90px] text-[#FFE600] font-bold base-font">
                  08
                </h2>

                <span className="text-white text-[18px] font-normal">
                  Years of Experience
                </span>
              </div>

              {/* Satisfaction Card */}
              <div
                className="absolute right-[170px] lg:right-[80px] col:right-0 bottom-10 
          max-w-[300px] col:max-w-[350px] px-[20px] py-[20px] rounded-[12px] 
          z-10 bg-transparent flex items-center justify-center
          before:absolute before:content-[''] before:left-0 before:top-0 
          before:w-full before:h-full before:opacity-[1] before:-z-20 
          before:rounded-[12px] before:bg-gradient-to-l 
          before:to-[#939393] before:from-[#1c1a1a4d]
          after:absolute after:left-[2px] after:top-[2px] after:w-[98%] 
          after:h-[98%] after:content-[''] after:bg-[#2D2B1F] 
          after:opacity-[.85] after:-z-10 after:rounded-[12px]"
              >
                <h3 className="mr-[15px] w-[50%] text-[45px] text-[#59C378] font-bold base-font flex items-center">
                  <span className="odometer" data-count="100">
                    100
                  </span>
                  %
                </h3>

                <p className="text-[15px] w-[50%] text-white font-normal base-font">
                  Clients Satisfections
                </p>
              </div>
            </div>

            {/* Right Content */}
            <div className="about-right z-20 md:mt-7">
              <div className="max-w-[640px] mx-auto text-left text-white mb-[60px] md:mb-[40px]">
                <h2 className="heading-font font-bold text-5xl md:text-[35px] sm:text-[22px] mb-[15px]">
                  My Advantage
                </h2>

                <p className="base-font text-lg font-normal">
                  Must explain to you how all this mistaken idea of denouncing
                  pleasure and praising pain was born and I will give you a complete
                  account the system and expound the actual and praising pain was
                  born.
                </p>
              </div>

              {/* Skills */}
              <ul className="flex flex-wrap mx-[-15px]">

                {/* Skill Item */}
                <li className="mx-[15px] rounded-[12px] mb-7 bg-gradient-to-t to-[#acac39] from-[#1f1e1c99] basis-[28.33%] lg:basis-[26%] col:basis-[40%]">
                  <div className="rounded-[12px] bg-[#1F1E1D] mt-[3px] mr-[3px] ml-[3px] p-10 lg:p-[20px] text-center">
                    <h3 className="font-bold text-[35px] text-white flex items-center justify-center">
                      <span className="odometer" data-count="98">
                        98
                      </span>
                      %
                    </h3>

                    <p className="font-normal text-[16px] text-[#FFE600]">
                      Figma
                    </p>
                  </div>
                </li>

                <li className="mx-[15px] rounded-[12px] mb-7 bg-gradient-to-t to-[#59c37899] from-[#1f1e1c99] basis-[28.33%] lg:basis-[26%] col:basis-[40%]">
                  <div className="rounded-[12px] bg-[#1F1E1D] mt-[3px] mr-[3px] ml-[3px] p-10 lg:p-[20px] text-center">
                    <h3 className="font-bold text-[35px] text-white flex items-center justify-center">
                      <span className="odometer" data-count="92">
                        92
                      </span>
                      %
                    </h3>

                    <p className="font-normal text-[16px] text-[#59C378]">
                      Sketch
                    </p>
                  </div>
                </li>

                <li className="mx-[15px] rounded-[12px] mb-7 bg-gradient-to-t to-[#dd584f99] from-[#1f1e1c99] basis-[28.33%] lg:basis-[26%] col:basis-[40%]">
                  <div className="rounded-[12px] bg-[#1F1E1D] mt-[3px] mr-[3px] ml-[3px] p-10 lg:p-[20px] text-center">
                    <h3 className="font-bold text-[35px] text-white flex items-center justify-center">
                      <span className="odometer" data-count="88">
                        88
                      </span>
                      %
                    </h3>

                    <p className="font-normal text-[16px] text-[#DD584F]">
                      Photoshop
                    </p>
                  </div>
                </li>

                <li className="mx-[15px] rounded-[12px] mb-7 bg-gradient-to-t to-[#ff9a0099] from-[#1f1e1c99] basis-[28.33%] lg:basis-[26%] col:basis-[40%]">
                  <div className="rounded-[12px] bg-[#1F1E1D] mt-[3px] mr-[3px] ml-[3px] p-10 lg:p-[20px] text-center">
                    <h3 className="font-bold text-[35px] text-white flex items-center justify-center">
                      <span className="odometer" data-count="72">
                        72
                      </span>
                      %
                    </h3>

                    <p className="font-normal text-[16px] text-[#FF9A00]">
                      Illustrator
                    </p>
                  </div>
                </li>

                <li className="mx-[15px] rounded-[12px] mb-7 bg-gradient-to-t to-[#00a9ff99] from-[#1f1e1c99] basis-[28.33%] lg:basis-[26%] col:basis-[40%]">
                  <div className="rounded-[12px] bg-[#1F1E1D] mt-[3px] mr-[3px] ml-[3px] p-10 lg:p-[20px] text-center">
                    <h3 className="font-bold text-[35px] text-white flex items-center justify-center">
                      <span className="odometer" data-count="43">
                        43
                      </span>
                      %
                    </h3>

                    <p className="font-normal text-[16px] text-[#00A9FF]">
                      WordPress
                    </p>
                  </div>
                </li>

                <li className="mx-[15px] rounded-[12px] mb-7 bg-gradient-to-t to-[#9e00ff99] from-[#1f1e1c99] basis-[28.33%] lg:basis-[26%] col:basis-[40%]">
                  <div className="rounded-[12px] bg-[#1F1E1D] mt-[3px] mr-[3px] ml-[3px] p-10 lg:p-[20px] text-center">
                    <h3 className="font-bold text-[35px] text-white flex items-center justify-center">
                      <span className="odometer" data-count="40">
                        40
                      </span>
                      %
                    </h3>

                    <p className="font-normal text-[16px] text-[#AD00FF]">
                      ReactJS
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Shape 1 */}
        <div className="absolute top-[50px] left-0 z-0">
          <img
            src="https://elito-tailwind.wpocean.com/static/media/shape1.e16bb922100675e291e3.png"
            alt=""
          />
        </div>

        {/* Shape 2 */}
        <div className="absolute right-0 bottom-0 z-0">
          <img
            src="https://elito-tailwind.wpocean.com/static/media/shape2.5401b75612d2af6041d5.png"
            alt=""
          />
        </div>

        {/* Background Glow 1 */}
        <div className="absolute bottom-[-95%] left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2 z-0">
          <svg
            className="fill-[#FFE500]"
            width="995"
            height="1495"
            viewBox="0 0 995 1495"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.3" filter="url(#filter0_f_39_4267)">
              <circle cx="247.5" cy="747.5" r="247.5" fill="#FFE500" />
            </g>

            <defs>
              <filter
                id="filter0_f_39_4267"
                x="-500"
                y="0"
                width="1495"
                height="1495"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="250"
                  result="effect1_foregroundBlur_39_4267"
                />
              </filter>
            </defs>
          </svg>
        </div>

        {/* Background Glow 2 */}
        <div className="absolute bottom-[-95%] right-[-10%] z-10">
          <svg
            className="fill-[#AD00FF]"
            width="1252"
            height="1901"
            viewBox="0 0 1252 1901"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.15" filter="url(#filter0_f_39_4265)">
              <circle cx="950" cy="950.004" r="450" />
            </g>

            <defs>
              <filter
                id="filter0_f_39_4265"
                x="-0.00012207"
                y="0.00402832"
                width="1900"
                height="1900"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="250"
                  result="effect1_foregroundBlur_39_4265"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </section>

    </div>
  );
}

