// view/students/reports/student-report-list/ReportSettingsModal.jsx
//
// ⚙️ রিপোর্ট সেটিং — লেখার আকার (লাইভ প্রিভিউ সহ), জলছাপ ও প্রতি পেজে রো।
// "সেভ করুন" চাপলে সেটিং ডাটাবেসে চলে যায় এবং SweetAlert2 দিয়ে মেসেজ দেখায়।

import Swal from "sweetalert2";
import { FONT_FIELDS } from "./reportSettingsConstants";
import {
  GearIcon,
  CheckIcon,
  RefreshIcon,
  DocIcon,
  LayoutIcon,
  CloseIcon,
} from "./ReportIcons";

const bn = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (x) => d[x]);
};

// পুরনো import পথ ঠিক রাখতে GearIcon এখান থেকেও পাওয়া যাবে
export { GearIcon };

function Row({ label, hint, value, unit = "px", min, max, step = 1, onChange }) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[13px] font-semibold text-slate-700">{label}</label>
        <span className="text-[12px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5 min-w-[56px] text-center">
          {bn(value)} {unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, Number(value) - step))}
          className="w-7 h-7 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 text-sm font-bold shrink-0"
        >
          −
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-indigo-600"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, Number(value) + step))}
          className="w-7 h-7 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 text-sm font-bold shrink-0"
        >
          +
        </button>
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Section({ icon, iconNode, title, children }) {
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white">
      <div className="flex items-center gap-2 mb-1 pb-2 border-b border-slate-100">
        <span className="text-indigo-600 flex items-center">
          {iconNode || icon}
        </span>
        <h4 className="text-[14px] font-bold text-slate-800">{title}</h4>
      </div>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   🔍 লাইভ প্রিভিউ — স্লাইডার নাড়ালেই এখানে লেখা ছোট/বড় হবে
--------------------------------------------------------- */
function FontPreview({ settings, institutionName, address, logoSrc }) {
  return (
    <div className="sticky top-0 z-10 -mx-3 -mt-3 mb-2 px-3 pt-3 pb-2 bg-white border-b border-slate-100">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
          প্রিভিউ
        </span>
        <span className="text-[10.5px] text-slate-400">আসল রিপোর্টে এভাবেই দেখাবে</span>
      </div>

      <div
        className="border border-slate-300 rounded-lg bg-white px-3 py-2.5 overflow-hidden"
        style={{ fontFamily: "'Noto Sans Bengali','Kalpurush','SolaimanLipi',sans-serif" }}
      >
        <div className="flex items-start gap-2">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="w-9 h-9 object-contain shrink-0" />
          ) : (
            <div className="w-9 h-9 shrink-0" />
          )}
          <div className="flex-1 text-center min-w-0">
            <div
              className="font-extrabold text-black leading-tight truncate"
              style={{ fontSize: `${settings.InstitutionFontSize}px` }}
            >
              {institutionName || "প্রতিষ্ঠানের নাম"}
            </div>
            <div
              className="text-black truncate"
              style={{ fontSize: `${settings.BodyFontSize}px` }}
            >
              {address || "ঠিকানা, জেলা"}
            </div>
            <div className="mt-1 inline-block border border-black rounded-full px-3 py-[2px]">
              <span
                className="font-bold text-black"
                style={{ fontSize: `${settings.TitleFontSize}px` }}
              >
                রিপোর্টের শিরোনাম
              </span>
            </div>
          </div>
          <div className="w-9 shrink-0" />
        </div>

        <table className="w-full border-collapse mt-2 table-fixed">
          <thead>
            <tr>
              {["ক্র:", "আইডি নং", "শিক্ষার্থীর নাম", "পিতার নাম"].map((h, i) => (
                <th
                  key={i}
                  className="border border-black text-center font-bold text-black px-1 py-0.5"
                  style={{ fontSize: `${settings.TableHeadFontSize}px` }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["১", "৪৪০০৫১", "মুহাম্মদ আব্দুল্লাহ", "আব্দুর রহমান"],
              ["২", "৪৪০০৫২", "মুহাম্মদ ইউসুফ", "আব্দুল করিম"],
            ].map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="border border-black text-black px-1 py-0.5 truncate"
                    style={{ fontSize: `${settings.TableBodyFontSize}px` }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportSettingsModal({
  open,
  onClose,
  settings,
  updateSetting,
  onSave,
  onReset,
  saving,
  logoSrc,
  reportLabel,
  institutionName,
  address,
}) {
  if (!open) return null;

  /* -------- সেভ — SweetAlert2 দিয়ে মেসেজ -------- */
  const handleSave = async () => {
    try {
      const result = await onSave();

      if (result?.savedToDb) {
        await Swal.fire({
          icon: "success",
          title: "সেভ হয়েছে!",
          text: "রিপোর্ট সেটিং ডাটাবেসে সংরক্ষণ করা হয়েছে।",
          confirmButtonText: "ঠিক আছে",
          confirmButtonColor: "#4F46E5",
          timer: 2200,
          timerProgressBar: true,
        });
        return;
      }

      // DB তে যায়নি — কিন্তু এই ব্রাউজারে সেভ আছে
      await Swal.fire({
        icon: "warning",
        title: "ডাটাবেসে সেভ হয়নি",
        text: "সেটিং আপাতত এই ব্রাউজারে সংরক্ষিত আছে। সার্ভার সংযোগ ঠিক হলে আবার সেভ করুন।",
        confirmButtonText: "ঠিক আছে",
        confirmButtonColor: "#4F46E5",
      });
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "ভুল হয়েছে!",
        text: "সেটিং সেভ করা যায়নি। আবার চেষ্টা করুন।",
        confirmButtonText: "ঠিক আছে",
        confirmButtonColor: "#4F46E5",
      });
    }
  };

  /* -------- ডিফল্টে ফেরানো — আগে কনফার্ম -------- */
  const handleReset = async () => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "ডিফল্টে ফেরাবেন?",
      text: "লেখার আকার, জলছাপ ও পেজ সেটিং — সব আগের ডিফল্ট মানে ফিরে যাবে।",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, ফেরাও",
      cancelButtonText: "না",
      confirmButtonColor: "#4F46E5",
      cancelButtonColor: "#64748B",
    });

    if (!confirm.isConfirmed) return;

    onReset();
    Swal.fire({
      icon: "success",
      title: "ডিফল্টে ফেরানো হয়েছে",
      text: "সংরক্ষণ করতে 'সেভ করুন' চাপুন।",
      confirmButtonText: "ঠিক আছে",
      confirmButtonColor: "#4F46E5",
      timer: 2200,
      timerProgressBar: true,
    });
  };

  return (
    <div className="print:hidden fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-[580px] my-6 overflow-hidden">
        {/* হেডার */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ background: "linear-gradient(90deg,#4338CA 0%,#5B21B6 55%,#7C3AED 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <GearIcon size={18} />
            </div>
            <div>
              <h3 className="text-white font-bold text-[16px] leading-tight">রিপোর্ট সেটিং</h3>
              <p className="text-white/75 text-[11.5px]">
                {reportLabel || "এই রিপোর্টের জন্য আলাদা সেটিং সেভ হবে"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold leading-none"
            title="বন্ধ করুন"
          >
            <CloseIcon size={16} className="mx-auto" />
          </button>
        </div>

        {/* বডি */}
        <div className="p-4 space-y-3 max-h-[72vh] overflow-y-auto">
          {/* -------- লেখার আকার + লাইভ প্রিভিউ -------- */}
          <Section icon={<DocIcon size={16} />} title="লেখার আকার (ফন্ট সাইজ)">
            <FontPreview
              settings={settings}
              institutionName={institutionName}
              address={address}
              logoSrc={logoSrc}
            />
            {FONT_FIELDS.map((f) => (
              <Row
                key={f.key}
                label={f.label}
                min={f.min}
                max={f.max}
                value={settings[f.key]}
                onChange={(v) => updateSetting(f.key, v)}
              />
            ))}
          </Section>

          {/* -------- জলছাপ -------- */}
          <Section icon={<LayoutIcon size={16} />} title="জলছাপ (প্রতিষ্ঠানের লোগো)">
            <label className="flex items-center gap-2 py-2 cursor-pointer">
              <span
                onClick={() => updateSetting("WatermarkEnabled", !settings.WatermarkEnabled)}
                className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                  settings.WatermarkEnabled
                    ? "bg-indigo-600 border-indigo-600"
                    : "bg-white border-slate-300"
                }`}
              >
                {settings.WatermarkEnabled && (
                  <span className="text-white">
                    <CheckIcon size={11} />
                  </span>
                )}
              </span>
              <span className="text-[13px] font-semibold text-slate-700">
                রিপোর্টের পেছনে লোগো জলছাপ আকারে বসবে
              </span>
            </label>

            {!logoSrc && (
              <p className="text-[11.5px] text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 mb-2">
                প্রতিষ্ঠানের লোগো পাওয়া যায়নি। সেটিংস → প্রতিষ্ঠানের তথ্য থেকে লোগো আপলোড করুন।
              </p>
            )}

            {settings.WatermarkEnabled && (
              <>
                <Row
                  label="কতটুকু দেখা যাবে"
                  unit="%"
                  min={3}
                  max={40}
                  value={settings.WatermarkOpacity}
                  onChange={(v) => updateSetting("WatermarkOpacity", v)}
                  hint="৫–১০% সাধারণত প্রিন্টে সবচেয়ে ভালো দেখায়।"
                />
                <Row
                  label="জলছাপের আকার"
                  unit="%"
                  min={20}
                  max={95}
                  value={settings.WatermarkSize}
                  onChange={(v) => updateSetting("WatermarkSize", v)}
                />

                {logoSrc && (
                  <div className="mt-2 border border-dashed border-slate-300 rounded-lg h-28 flex items-center justify-center bg-white relative overflow-hidden">
                    <span className="text-[12px] text-slate-400">জলছাপের প্রিভিউ</span>
                    <img
                      src={logoSrc}
                      alt=""
                      className="absolute object-contain"
                      style={{
                        height: `${settings.WatermarkSize}%`,
                        opacity: settings.WatermarkOpacity / 100,
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </Section>

          {/* -------- পেজ -------- */}
          <Section icon={<LayoutIcon size={16} />} title="পেজ সেটিং">
            <Row
              label="প্রতি পেজে কয়টি রো"
              unit="টি"
              min={1}
              max={60}
              value={settings.RowsPerPage}
              onChange={(v) => updateSetting("RowsPerPage", v)}
              hint="রিপোর্ট ভেদে নিজস্ব সীমা থাকতে পারে (যেমন বিষয়ওয়ারী হাজিরা)।"
            />
          </Section>
        </div>

        {/* ফুটার */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-white border-t border-slate-200">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-[13px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5"
          >
            <RefreshIcon size={14} />
            ডিফল্টে ফেরাও
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50"
            >
              বন্ধ
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg text-[13px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-1.5"
            >
              <CheckIcon size={15} />
              {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
