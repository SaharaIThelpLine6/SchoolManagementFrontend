import { useEffect } from "react";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
// import bnBijoy2Unicode from "../../../utils/conveter";
import PdfHeader from "./PdfHeader";

const AdmissionFormPdf = ({ student, admissionStatus, SubClassID, SessionID }) => {

   const { data: subClassListData } = useGetSubClassListQuery();
    const {
       data: institutionInfo,
       error: institutionInfoError,
       isLoading: institutionInfoLoading,
     } = useGetInstitutionInfoQuery();
    const subClasData = subClassListData?.find(
      (i) => i.SubClassID === Number(SubClassID)
    );
    const { data: sessionSData } = useGetSessionsQuery();

    const sessionData = sessionSData?.find(
      (i) => i.SessionID === Number(SessionID)
    );

  useEffect(() => {
    if (student) {
      console.log("🎓 AdmissionFormPdf student:", {
        StudentCode: student?.StudentCode,
        StudentName: student?.StudentName,
        FatherName: student?.FatherName,
        SubClass: student?.SubClass,
        SessionName: student?.SessionName,
        admissionStatus,
      });
    }
  }, [student, admissionStatus]);

  const conv = (val) => {
    if (val === null || val === undefined || val === "") return "";
    try {
      return (val);
    } catch {
      return val;
    }
  };

  // 🟢 admissionStatus ("IsActive" ফিল্টার) অনুযায়ী বিগত/বর্তমান বক্সের ডাটা ঠিক হবে:
  // "1" ভর্তির আগে -> শুধু "বিগত তথ্য" (ছাত্রের বিদ্যমান শ্রেণি/সেশন) দেখাবে, "বর্তমান" ফাঁকা
  // "2" ভর্তির পরে -> "বিগত তথ্য" (বিদ্যমান শ্রেণি) + "বর্তমান" (ফিল্টারে বাছাই করা নতুন শ্রেণি/সেশন) দুটোই
  // ""  খালি      -> সম্পূর্ণ ফাঁকা প্রিন্ট টেমপ্লেট
  const showPast = admissionStatus === "1" || admissionStatus === "2";
  const showCurrent = admissionStatus === "2";

  // বিগত তথ্য (LEFT) — সবসময় ছাত্রের নিজের রেকর্ড থেকে
  const pastSubClassName = showPast ? conv(student?.SubClass) : "";
  const pastSessionName = showPast ? conv(student?.SessionName) : "";
  const pastStudentCode = showPast ? conv(student?.StudentCode) : "";
  const pastResidentialStatus = showPast ? student?.ResidentialStatusId : undefined;

  // বর্তমান (RIGHT) — ফিল্টার সাইডবারে বাছাই করা SubClassID/SessionID থেকে
  const currentSubClassName = showCurrent ? conv(subClasData?.SubClass) : "";
  const currentSessionName = showCurrent ? conv(sessionData?.SessionName) : "";
  const currentStudentCode = showCurrent ? conv(student?.StudentCode) : "";
  const currentResidentialStatus = showCurrent ? student?.ResidentialStatusId : undefined;

  const studentName = conv(student?.StudentName);
  const fatherName = conv(student?.FatherName);
  const motherName = conv(student?.MotherName);

  const formatDob = (dob) => {
    if (!dob) return "";
    try {
      const d = new Date(dob);
      if (isNaN(d.getTime())) return String(dob);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return String(dob);
    }
  };

  const dateOfBirth = formatDob(student?.DateOfBirth);
  const nidNo = conv(student?.NIDNO);
  const mobile = conv(student?.Mobile1 || student?.Mobile2);

  const permanentVill = conv(student?.permanentVill);
  const permanentPost = conv(student?.permanentPost);
  const policeStation = conv(student?.PoliceStationName);
  const district = conv(student?.PermanentDistrictName);

  return (
    <>
      <style>
        {`
          .af-form * { box-sizing: border-box; }
          .af-form {
            font-family: 'SolaimanLipi', 'Bangla', sans-serif;
            color: #000;
          }
          .af-box { border: 1px solid #000; }
          .af-title-bar {
            border-bottom: 1px solid #000;
            text-align: center;
            font-weight: 700;
            padding: 3px 0;
            font-size: 13px;
          }
          .af-section-label {
            display: inline-block;
            border: 1px solid #000;
            padding: 2px 26px;
            font-weight: 700;
            font-size: 13px;
            background: #fff;
          }
          .af-row { display: flex; }
          .af-label { font-weight: 700; }
          // .af-pledge p { margin: 2px 0; text-align: justify; }
          .af-pledge p { text-align: justify; }
          .af-dotline {
            display: inline-block;
            border-bottom: 1px dotted #000;
            flex: 1;
            margin-left: 4px;
          }
          @media print {
            @page { size: A4 portrait; margin: 5mm; }
            html, body { margin: 0; padding: 0; }
            .admission-form-page {
              page-break-after: always;
              page-break-inside: avoid;
              break-after: page;
            }
            .admission-form-page:last-child {
              page-break-after: auto;
              break-after: auto;
            }
          }
          @media screen {
            .admission-form-page {
              margin-bottom: 24px;
              box-shadow: 0 0 6px rgba(0,0,0,0.15);
            }
          }
        `}
      </style>

      <div
        className="af-form w-full admission-form-page"
        style={{
          width: "210mm",
          height: "277mm",
          margin: "0 auto",
          padding: "6mm 6mm",
          fontSize: "12px",
          lineHeight: "1.35",
          background: "#fff",
        }}
      >
        {/* ================= HEADER ================= */}
        <PdfHeader compact={true} />
        <div style={{ borderBottom: "2px solid #000", margin: "4px 0 4px 0" }}></div>

        {/* ================= TOP INFO (Past | Form | Current) ================= */}
        <div className="af-row" style={{ marginTop: "6px", justifyContent: "space-between", alignItems: "flex-start" }}>

          {/* LEFT: বিগত তথ্য */}
          <div style={{ position: "relative", border: "1px solid #000", width: "38%", padding: "14px 8px 8px 8px", fontSize: "15px" }}>
            <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#fff", padding: "0 10px", border: "1px solid #000", fontWeight: "bold" }}>
              বিগত তথ্য
            </div>
            <div>
              <span className="">শ্রেণি/জামাত : </span>
              <span>{pastSubClassName}</span>
            </div>
            <div style={{ }}>
              <span className="">শিক্ষাবর্ষ : </span>
              <span>{pastSessionName}</span>
            </div>
            <div style={{ }}>
              <span className="">আইডি নং : </span>
              <span>{pastStudentCode}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className="">আবাসিক </span>
              <input
                type="checkbox"
                readOnly
                checked={pastResidentialStatus === 1}
                style={{ width: 12, height: 12, margin: "0 4px 0 6px", verticalAlign: "middle" }}
              />
              <span className="" style={{ marginLeft: 4 }}>অনাবাসিক </span>
              <input
                type="checkbox"
                readOnly
                checked={pastResidentialStatus === 2}
                style={{ width: 12, height: 12, margin: "0 4px 0 6px", verticalAlign: "middle" }}
              />
              <span className="" style={{ marginLeft: 4 }}>ডে কেয়ার </span>
              <input
                type="checkbox"
                readOnly
                checked={pastResidentialStatus === 3}
                style={{ width: 12, height: 12, margin: "0 4px 0 6px", verticalAlign: "middle" }}
              />
            </div>
          </div>

          {/* MIDDLE: ভর্তি ফরম */}
          <div style={{ width: "24%", display: "flex", justifyContent: "center", alignItems: "center", paddingTop: "10px" }}>
            <div style={{ border: "1px solid #000", padding: "8px 28px", fontSize: "18px", fontWeight: "bold", boxShadow: "4px 4px 0px #000", background: "#fff" }}>
              ভর্তি ফরম
            </div>
          </div>

          {/* RIGHT: বর্তমান তথ্য */}
          <div style={{ position: "relative", border: "1px solid #000", width: "38%", padding: "14px 8px 8px 8px", fontSize: "16px" }}>
            <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#fff", padding: "0 10px", border: "1px solid #000", fontWeight: "bold" }}>
              বর্তমান
            </div>
            <div>
              <span className="">শ্রেণি/জামাত : </span>
              <span>{currentSubClassName}</span>
            </div>
            <div style={{ }}>
              <span className="">শিক্ষাবর্ষ : </span>
              <span>{currentSessionName}</span>
            </div>
            <div style={{ }}>
              <span className="">আইডি নং : </span>
              <span>{currentStudentCode}</span>
            </div>
            {/* 🟢 ভর্তির পরে (IsActive === "2") অবস্থায় বর্তমান বক্সেও আবাসিক/অনাবাসিক/ডে-কেয়ার দেখাবে */}
            {showCurrent && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="">আবাসিক </span>
                <input
                  type="checkbox"
                  readOnly
                  checked={currentResidentialStatus === 1}
                  style={{ width: 12, height: 12, margin: "0 4px 0 6px", verticalAlign: "middle" }}
                />
                <span className="" style={{ marginLeft: 4 }}>অনাবাসিক </span>
                <input
                  type="checkbox"
                  readOnly
                  checked={currentResidentialStatus === 2}
                  style={{ width: 12, height: 12, margin: "0 4px 0 6px", verticalAlign: "middle" }}
                />
                <span className="" style={{ marginLeft: 4 }}>ডে কেয়ার </span>
                <input
                  type="checkbox"
                  readOnly
                  checked={currentResidentialStatus === 3}
                  style={{ width: 12, height: 12, margin: "0 4px 0 6px", verticalAlign: "middle" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ================= PLEDGE ================= */}
        <div className="af-pledge" style={{ fontSize: "14px" }}>
          <p style={{ marginLeft: 0 }}>
            <span >মুহতারাম,</span>
          </p>
          <p style={{ marginLeft: "30px" }}>হযরত মুহতামিম সাহেব (দা. বা.)</p>

          <p style={{ textAlign: "center" }}>
            আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ
          </p>

          <p style={{ }}>
            বিনীত নিবেদন এই যে, আমি{" "}
            {institutionInfo?.InstitutionName} এর যাবতীয়
            কানুন ও নীতিমালা মেনে চলার অঙ্গীকারে আবদ্ধ হয়ে ভর্তি হওয়ার জন্য
            বিনীত আবেদন করছি।
          </p>

          <p className=" text-2xs">
            হুজুরের খেলমতে আরজ এই যে, আমার আবেদন মঞ্জুর করতঃ অত্র মাদরাসা হতে
            দ্বীন হাসিল করার সুযোগ প্রদানের জন্য আপনার মর্জি হয়।
          </p>
        </div>

        {/* ================= STUDENT DETAILS ================= */}
        <div style={{ fontSize: "16px" }}>
          আমার বিস্তারিত তথ্যাদি নিম্নে প্রদান করা হলো-
        </div>

        {/* 🟢 Left & Right Boxes with Gap */}
        <div className="af-row" style={{ marginTop: "4px", gap: "8px", alignItems: "stretch" }}>

          {/* LEFT: Personal info */}
          <div style={{ width: "40%", border: "1px solid #000", padding: "0px 8px", fontSize: "16px" }}>
            {[
              { label: "নাম", value: studentName },
              { label: "পিতার নাম", value: fatherName },
              { label: "মাতার নাম", value: motherName },
              { label: "জন্ম তারিখ", value: dateOfBirth },
              { label: "NID/জন্ম নিবন্ধন নং", value: nidNo },
              { label: "অভিভাবকের মোবাইল", value: mobile },
            ].map((item, idx) => (
              <div
                key={idx}
                className="af-row"
                style={{
                  padding: "3px 0",
                  alignItems: "center",
                }}
              >
                <span className="af-label" style={{ width: "135px" }}>
                  {item.label}
                </span>
                <span style={{ width: "12px", textAlign: "center" }}>:</span>
                <span style={{ flex: 1, paddingLeft: "4px" }}>{item.value || ""}</span>
              </div>
            ))}
          </div>

          {/* RIGHT: Addresses */}
          <div style={{ width: "60%", border: "1px solid #000" }}>

            <div style={{ textAlign: "center", fontWeight: 700, borderBottom: "1px solid #000", padding: "2px 0", fontSize: "16px" }}>
              স্থায়ী ঠিকানা
            </div>

            <div className="af-row" style={{ padding: "4px 8px", alignItems: "center", fontSize: "16px" }}>
              <span className="af-label" style={{ width: "75px" }}>গ্রাম/মহল্লা</span>
              <span style={{ width: "8px", textAlign: "center" }}>:</span>
              <span style={{ width: "90px", paddingLeft: "4px" }}>{permanentVill}</span>
              <span className="af-label" style={{ width: "40px", paddingLeft: "8px" }}>থানা</span>
              <span style={{ width: "8px", textAlign: "center" }}>:</span>
              <span style={{ flex: 1, paddingLeft: "4px" }}>{policeStation}</span>
            </div>

            <div className="af-row" style={{ padding: "0 8px 4px 8px", alignItems: "center", fontSize: "16px" }}>
              <span className="af-label" style={{ width: "75px" }}>ডাক</span>
              <span style={{ width: "8px", textAlign: "center" }}>:</span>
              <span style={{ width: "90px", paddingLeft: "4px" }}>{permanentPost}</span>
              <span className="af-label" style={{ width: "40px", paddingLeft: "8px" }}>জেলা</span>
              <span style={{ width: "8px", textAlign: "center" }}>:</span>
              <span style={{ flex: 1, paddingLeft: "4px" }}>{district}</span>
            </div>

            <div style={{ textAlign: "center", fontWeight: 700, borderTop: "1px solid #000", borderBottom: "1px solid #000", padding: "2px 0", fontSize: "16px" }}>
              অস্থায়ী ঠিকানা
            </div>

            <div className="af-row" style={{ padding: "4px 8px", alignItems: "center", fontSize: "16px" }}>
              <span className="af-label" style={{ width: "75px" }}>গ্রাম/মহল্লা</span>
              <span style={{ width: "8px", textAlign: "center" }}>:</span>
              <span style={{ width: "90px", paddingLeft: "4px" }}></span>
              <span className="af-label" style={{ width: "40px", paddingLeft: "8px" }}>থানা</span>
              <span style={{ width: "8px", textAlign: "center" }}>:</span>
              <span style={{ flex: 1, paddingLeft: "4px" }}></span>
            </div>

            <div className="af-row" style={{ padding: "0 8px 4px 8px", alignItems: "center", fontSize: "16px" }}>
              <span className="af-label" style={{ width: "75px" }}>ডাক</span>
              <span style={{ width: "8px", textAlign: "center" }}>:</span>
              <span style={{ width: "90px", paddingLeft: "4px" }}></span>
              <span className="af-label" style={{ width: "40px", paddingLeft: "8px" }}>জেলা</span>
              <span style={{ width: "8px", textAlign: "center" }}>:</span>
              <span style={{ flex: 1, paddingLeft: "4px" }}></span>
            </div>
          </div>

          {/* Right Box */}
          <div className="w-1/2 border border-black p-2 h-40">
            <div className="text-center border-b border-black text-xs mb-1">
              <h2 className="font-bold">স্থায়ী ঠিকানা</h2>
            </div>
            <div className="grid grid-cols-2 text-2xs">
              <p className="font-bold">গ্রাম/মহল্লা: </p>
              <p className="font-bold">থানা: </p>
              <p className="font-bold">ডাক: </p>
              <p className="font-bold">জেলা: </p>
            </div>
            <div className="text-center border-b border-black text-xs mb-1 mt-1">
              <h2 className="font-bold">অস্থায়ী ঠিকানা</h2>
            </div>
            <div className="grid grid-cols-2 text-2xs">
              <p className="font-bold">গ্রাম/মহল্লা: </p>
              <p className="font-bold">থানা: </p>
              <p className="font-bold">ডাক: </p>
              <p className="font-bold">জেলা: </p>
            </div>
          </div>
        </div>

        {/* ================= GUARDIAN INFO ================= */}
        <div className="af-row" style={{ marginTop: "6px", gap: "16px", alignItems: "center", fontSize: "16px" }}>
          <div style={{ flex: 5, display: "flex", alignItems: "center" }}>
            <span style={{ whiteSpace: "nowrap" }}>অভিভাবকের নাম :</span>
            <span style={{ flex: 1, borderBottom: "1px dashed #000", marginLeft: "6px", transform: "translateY(-4px)" }} />
          </div>
          <div>
            <span>সম্পর্ক: ________________</span>
          </div>
          <div>
            <span>স্বাক্ষর: ________________</span>
          </div>
        </div>

        {/* ================= OFFICE SECTION ================= */}
        <div className="af-row" style={{ marginTop: "10px", alignItems: "center", fontSize: "16px" }}>
          <div style={{ flex: 1 }} />
          <span className="af-section-label !text-base">অফিসের অংশ</span>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div className="af-dotline" style={{ minWidth: "150px" }} />
            <div>আবেদনকারীর স্বাক্ষর</div>
          </div>
        </div>

        {/* ================= TALIMI MURUBBI ================= */}
        <div className="af-row" style={{ gap: "16px", alignItems: "center", fontSize: "16px" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <span style={{ whiteSpace: "nowrap" }}>তালিমি মুরুব্বির নাম :</span>
            <span style={{ flex: 1, borderBottom: "1px dashed #000", marginLeft: "6px", transform: "translateY(-4px)" }} />
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <span style={{ whiteSpace: "nowrap" }}>স্বাক্ষর :</span>
            <span style={{ flex: 1, borderBottom: "1px dashed #000", marginLeft: "6px", transform: "translateY(-4px)" }} />
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <span style={{ whiteSpace: "nowrap" }}>তারিখ :</span>
            <span style={{ flex: 1, borderBottom: "1px dashed #000", marginLeft: "6px", transform: "translateY(-4px)" }} />
          </div>
        </div>

        {/* ================= TEACHER COMMENTS ================= */}
        <div style={{ marginTop: "8px", fontSize: "16px" }}>
          <div>দারুল ইকামা/শ্রেণী শিক্ষকের মতামত:</div>
          <div className="af-row" style={{ marginTop: "4px", justifyContent: "space-between", gap: "16px" }}>
            <div style={{ flex: 1, display: "flex" }}>
              নিরীক্ষকের মন্তব্য : <span className="af-dotline" />
            </div>
            <div style={{ flex: 1, display: "flex" }}>
              স্বাক্ষর ও তারিখ : <span className="af-dotline" />
            </div>
          </div>
        </div>

        {/* ================= RESULT SECTION ================= */}
        <div style={{ textAlign: "center", marginTop: "8px", fontSize: "16px" }}>
          <span className="af-section-label !text-base">ফলাফল</span>
        </div>
        <div className="af-row" style={{ marginTop: "4px", alignItems: "center", gap: "6px", fontSize: "16px" }}>
          <div style={{ flex: 2 }}>বিগত পরীক্ষার ফলাফল :</div>
          <div className="af-box" style={{ flex: 1, textAlign: "left", padding: "2px 10px" }}>মোট :</div>
          <div className="af-box" style={{ flex: 1, textAlign: "left", padding: "2px 10px" }}>গড় :</div>
          <div className="af-box" style={{ flex: 1, textAlign: "left", padding: "2px 10px" }}>বিভাগ :</div>
          <div className="af-box" style={{ flex: 1, textAlign: "left", padding: "2px 10px" }}>স্থান :</div>
        </div>

        {/* ================= NAZIM COMMENTS ================= */}
        <div style={{ marginTop: "8px", fontSize: "16px" }}>
          <div style={{ fontWeight: 700 }}>* নাযিমে তালিমাতের মন্তব্য:</div>
          <p style={{ textAlign: "justify", marginTop: "2px" }}>
            আমি আবেদনকারীকে <span className="af-dotline" style={{ minWidth: "220px" }} />{" "}
            জামাআতে ভর্তি উপযুক্ত মনে করতেছি/করছি না। তাহাকে{" "}
            <span className="af-dotline" style={{ minWidth: "150px" }} /> জামাআতে
            ভর্তি হওয়ার পরামর্শ দিতেছি।
          </p>
        </div>

        {/* ================= FINANCIAL STATUS ================= */}
        <div className="af-row" style={{ marginTop: "8px", fontSize: "16px" }}>
          <div style={{ flex: 3 }}>
            <div style={{ fontWeight: 700 }}>আর্থিক অবস্থা :</div>
            <div className="af-row" style={{ alignItems: "center", marginTop: "4px", marginLeft: "100px" }}>
              <span style={{ marginRight: 4 }}>সচ্ছল :</span>
              <input type="checkbox" style={{ width: 10, height: 10 }} />
              <span style={{ marginLeft: 8, marginRight: 4 }}>এতিম :</span>
              <input type="checkbox" style={{ width: 10, height: 10 }} />
              <span style={{ marginLeft: 8, marginRight: 4 }}>গরিব :</span>
              <input type="checkbox" style={{ width: 10, height: 10 }} />
              <span style={{ marginLeft: 8, marginRight: 4 }}>অসহায় :</span>
              <input type="checkbox" style={{ width: 10, height: 10 }} />
            </div>
          </div>
          <div style={{ flex: 2, textAlign: "center", alignSelf: "flex-start", marginTop: "-20px" }}>
            <div className="af-dotline" style={{ minWidth: "150px" }} />
            <div><b>নাযিমে তালিমাতের স্বাক্ষর/সীল</b></div>
            <div style={{ marginTop: "4px" }}>
              তারিখ <span className="af-dotline" style={{ minWidth: "100px" }} />
            </div>
          </div>
        </div>

        {/* ================= PAYMENT SECTION ================= */}
        <div style={{ textAlign: "center", marginTop: "8px", fontSize: "16px" }}>
          <span className="af-section-label !text-base">প্রদেয় টাকার পরিমাণ</span>
        </div>
        <div className="af-row" style={{ marginTop: "2px", border: "1px solid #000", fontSize: "16px" }}>
          {["ভর্তি ফ্রি :", "মাসিক বেতন :", "আবাসিক ফ্রি :", "অন্যান্য ফ্রি :"].map(
            (label, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "left",
                  padding: "4px 6px",
                  borderRight: i < 3 ? "1px solid #000" : "none",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* ================= APPROVAL ================= */}
        <div style={{ marginTop: "8px", fontSize: "16px" }}>
          <div style={{ fontWeight: 700 }}>মুহতামিমের মঞ্জুরি:</div>
          <p style={{ textAlign: "justify", marginTop: "2px" }}>
            আবেদনকারীর <span className="af-dotline" style={{ minWidth: "280px" }} />{" "}
            জামাআতে ভর্তির আবেদন মঞ্জুর করা হলো।
          </p>
        </div>

        {/* ================= FINAL SIGNATURE ================= */}
        <div className="af-row" style={{ marginTop: "14px", justifyContent: "flex-end", fontSize: "16px" }}>
          <div style={{ textAlign: "center" }}>
            <div className="af-dotline" style={{ minWidth: "180px" }} />
            <div>মুহতামিম সাহেবের স্বাক্ষর/সীল</div>
            <div style={{ marginTop: "4px" }}>
              তারিখ <span className="af-dotline" style={{ minWidth: "100px" }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdmissionFormPdf;
