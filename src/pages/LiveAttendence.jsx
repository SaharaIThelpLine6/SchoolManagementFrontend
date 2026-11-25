import { useEffect, useMemo, useRef, useState } from "react";
import { Buffer } from "buffer";
import PropTypes from "prop-types";
import {
  useGetLiveAttendancePhotoQuery,
  useGetLiveAttendanceQuery,
} from "../features/attendance/attendanceSlice";
import { useGetInstitutionInfoQuery } from "../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../utils/conveter";
import { toBnDigits, toBnDisplay, toHHMM } from "../view/deviceTimeSettings/timeUtils";

const POLL_MS = 5000;

const AVATAR_FALLBACK = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e8f0ea'/%3E%3Ccircle cx='150' cy='112' r='58' fill='%2399b5a5'/%3E%3Cpath d='M48 292c8-75 47-112 102-112s94 37 102 112' fill='%2399b5a5'/%3E%3C/svg%3E`;

// ব্রাউজারের লোকাল তারিখ "YYYY-MM-DD"
const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const isLate = (r) => Boolean(r.LateTime) && r.LateTime !== "00:00:00";

// "01:21:48" → "১ ঘণ্টা ২১ মিনিট"
const lateText = (hms) => {
  const [h, m] = String(hms || "").split(":").map(Number);
  const parts = [];
  if (h) parts.push(`${toBnDigits(h)} ঘণ্টা`);
  if (m || !h) parts.push(`${toBnDigits(m || 0)} মিনিট`);
  return parts.join(" ");
};

const timeOf = (hms) => toBnDisplay(toHHMM(hms));
const classOf = (u) => u.ClassName || u.UserTypeName || "";

function StatCard({ label, value, tone, sub }) {
  return (
    <div className="relative min-h-[118px] overflow-hidden rounded-[20px] border border-[#e4ebe5] bg-white px-[17px] py-[18px] shadow-[0_5px_20px_#18352d08] max-[850px]:px-[12px] max-[850px]:py-[14px]">
      <div className="pointer-events-none absolute -bottom-[28px] -right-[22px] h-[70px] w-[70px] rounded-full bg-[#0b76580d]" />
      <div className="text-[15px] text-[#71827b]">{label}</div>
      <div className={`mt-[6px] text-[34px] font-bold leading-[1.3] max-[850px]:text-[28px] ${tone}`}>
        {toBnDigits(value)}
      </div>
      {sub && <div className="text-[12px] text-[#71827b]">{sub}</div>}
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  tone: PropTypes.string,
  sub: PropTypes.string,
};

function LatestCard({ latest, isToday }) {
  const { data: photoData } = useGetLiveAttendancePhotoQuery(latest?.UserID, { skip: !latest?.UserID });
  const photo = photoData?.photo || AVATAR_FALLBACK;

  if (!latest) {
    return (
      <div className="flex flex-col items-center text-center text-[#71827b]">
        <img className="mb-[18px] h-[160px] w-[160px] rounded-[24px] opacity-70" alt="" src={AVATAR_FALLBACK} />
        <p className="m-0 text-[20px] font-semibold text-[#18352d]">এখনও কোনো হাজিরা আসেনি</p>
        <p className="m-0 mt-[6px] text-[15px]">
          {isToday ? "ডিভাইসে আঙুল / কার্ড দিলেই এখানে দেখা যাবে" : "এই দিনে কোনো হাজিরা নেই"}
        </p>
      </div>
    );
  }

  const late = isLate(latest);
  return (
    <div key={latest.ID} className="flex w-full flex-col items-center animate-[liveIn_.5s_ease-out]">
      <div className="aspect-square w-[min(330px,70%)] rounded-[24px] bg-gradient-to-br from-[#d6b76e] to-[#087354] p-[7px] shadow-[0_12px_28px_#075b4620]">
        <img
          className="block h-full w-full rounded-[19px] bg-[#eaf1ec] object-cover"
          alt="ছবি"
          src={photo}
          onError={(e) => {
            e.currentTarget.src = AVATAR_FALLBACK;
          }}
        />
      </div>
      <h2 className="mb-[3px] mt-[20px] text-center text-[30px] font-bold max-[480px]:text-[24px]">
        {latest.UserName}
      </h2>
      <p className="m-0 text-center text-[20px] text-[#71827b] max-[480px]:text-[16px]">
        আইডি নং: <strong>{toBnDigits(latest.UserCode)}</strong>
        {classOf(latest) && (
          <>
            {" "}&nbsp;|&nbsp; <strong>{classOf(latest)}</strong>
          </>
        )}
      </p>
      <p className="m-0 mt-[8px] text-center text-[16px] text-[#71827b]">
        {[latest.ShiftName, latest.SwitchName].filter(Boolean).join(" · ")}
        {" — "}
        <strong className="text-[#075b46]">{timeOf(latest.Time)}</strong>
      </p>
      <div className="mt-[16px] flex flex-wrap justify-center gap-[8px]">
        <span className="rounded-[30px] bg-[#e7f7ee] px-[22px] py-[8px] font-bold text-[#087849]">✓ উপস্থিত</span>
        {late ? (
          <span className="rounded-[30px] bg-[#fdf0e6] px-[18px] py-[8px] font-bold text-[#c06a1e]">
            দেরি: {lateText(latest.LateTime)}
          </span>
        ) : (
          <span className="rounded-[30px] bg-[#eef4fb] px-[18px] py-[8px] font-bold text-[#2c6aa8]">সময়মতো</span>
        )}
      </div>
    </div>
  );
}

LatestCard.propTypes = {
  latest: PropTypes.shape({
    ID: PropTypes.number,
    UserID: PropTypes.number,
    UserCode: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    UserName: PropTypes.string,
    ShiftName: PropTypes.string,
    SwitchName: PropTypes.string,
    Time: PropTypes.string,
    LateTime: PropTypes.string,
  }),
  isToday: PropTypes.bool,
};

function Avatar({ name, tone = "bg-[#e8f1eb] text-[#075b46]" }) {
  return (
    <div className={`grid h-[43px] w-[43px] flex-none place-items-center rounded-full font-bold ${tone}`}>
      {String(name || "?").trim().charAt(0)}
    </div>
  );
}

Avatar.propTypes = { name: PropTypes.string, tone: PropTypes.string };

export default function LiveAttendence() {
  const [date, setDate] = useState(localDate);
  const [tab, setTab] = useState("present");
  const [typeId, setTypeId] = useState("");
  const [search, setSearch] = useState("");
  const isToday = date === localDate();

  const { data, isLoading, isError, isFetching, fulfilledTimeStamp } = useGetLiveAttendanceQuery(date, {
    pollingInterval: isToday ? POLL_MS : 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // প্রতিষ্ঠানের তথ্য
  const { data: institution } = useGetInstitutionInfoQuery();
  const logo = useMemo(() => {
    if (!institution?.Logo?.data) return null;
    return `data:image/png;base64,${Buffer.from(institution.Logo.data).toString("base64")}`;
  }, [institution]);
  const institutionName = institution?.InstitutionName ? bnBijoy2Unicode(institution.InstitutionName) : "";
  const institutionAddress = institution?.Address ? bnBijoy2Unicode(institution.Address) : "";

  // ইউজার টাইপ (ডেটা থেকেই)
  const userTypes = useMemo(() => {
    const map = new Map();
    [...(data?.present || []), ...(data?.absent || [])].forEach((u) => {
      if (u.UserTypeID && !map.has(u.UserTypeID)) map.set(u.UserTypeID, u.UserTypeName || `টাইপ ${u.UserTypeID}`);
    });
    return [...map.entries()].map(([id, name]) => ({ id: String(id), name }));
  }, [data]);

  const byType = (u) => !typeId || String(u.UserTypeID) === typeId;
  const present = useMemo(() => (data?.present || []).filter(byType), [data, typeId]); // eslint-disable-line react-hooks/exhaustive-deps
  const absent = useMemo(() => (data?.absent || []).filter(byType), [data, typeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const presentUsers = new Set(present.map((r) => r.UserID));
    const lateUsers = new Set(present.filter(isLate).map((r) => r.UserID));
    return {
      total: presentUsers.size + absent.length,
      present: presentUsers.size,
      late: lateUsers.size,
      absent: absent.length,
    };
  }, [present, absent]);

  const latest = present[0];

  // নতুন হাজিরা এলে তালিকায় হাইলাইট
  const seenIds = useRef(null);
  const [freshIds, setFreshIds] = useState(() => new Set());
  useEffect(() => {
    seenIds.current = null;
  }, [date]);
  useEffect(() => {
    if (!data?.present) return;
    const ids = new Set(data.present.map((r) => r.ID));
    if (seenIds.current) {
      const fresh = [...ids].filter((id) => !seenIds.current.has(id));
      if (fresh.length) {
        setFreshIds(new Set(fresh));
        const t = setTimeout(() => setFreshIds(new Set()), 6000);
        seenIds.current = ids;
        return () => clearTimeout(t);
      }
    }
    seenIds.current = ids;
  }, [data]);

  const q = search.trim().toLowerCase();
  const matches = (u) =>
    !q || String(u.UserName || "").toLowerCase().includes(q) || String(u.UserCode || "").includes(q);
  const list = (tab === "present" ? present : absent).filter(matches);

  const dateText = useMemo(
    () =>
      new Date(`${date}T00:00:00`).toLocaleDateString("bn-BD", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [date]
  );
  const updatedAt = fulfilledTimeStamp
    ? new Date(fulfilledTimeStamp).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="min-h-screen bg-[#f4f7f3] text-[#18352d] antialiased font-default">
      <style>{`
        @keyframes liveIn { from { opacity: 0; transform: translateY(10px) scale(.98) } to { opacity: 1; transform: none } }
        @keyframes liveFlash { 0% { background: #d9f5e6 } 100% { background: transparent } }
      `}</style>
      <div className="mx-auto max-w-[1440px] p-[28px] max-[850px]:p-[15px]">
        {/* Header */}
        <header className="relative flex items-center justify-center gap-[20px] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#064b3b] to-[#087354] px-[32px] py-[25px] text-white shadow-[0_12px_32px_#064b3b20] max-[480px]:gap-[11px] max-[480px]:rounded-[16px] max-[480px]:px-[12px] max-[480px]:py-[20px]">
          <div className="pointer-events-none absolute -right-[80px] -top-[170px] h-[300px] w-[300px] rounded-full border border-white/10 shadow-[0_0_0_25px_#ffffff08,0_0_0_55px_#ffffff06]" />
          <div
            className="grid h-[76px] w-[76px] flex-none place-items-center overflow-hidden rounded-full border-2 border-[#e8c879] bg-white max-[480px]:h-[56px] max-[480px]:w-[56px]"
            aria-label="প্রতিষ্ঠানের লোগো"
          >
            {logo ? (
              <img src={logo} alt="লোগো" className="h-full w-full object-contain p-[4px]" />
            ) : (
              <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-[48px] w-[48px] max-[480px]:h-[37px] max-[480px]:w-[37px]">
                <path d="M32 5 38 20 54 21 42 32 46 48 32 39 18 48 22 32 10 21 26 20 32 5Z" stroke="#087354" strokeWidth="2.2" />
                <path d="M20 28h24v17H20z" stroke="#087354" strokeWidth="2" />
              </svg>
            )}
          </div>
          <div className="z-[1] text-center">
            <h1 className="m-0 mb-[5px] text-[clamp(22px,3vw,36px)] font-bold tracking-[0.2px] max-[480px]:text-[20px]">
              {institutionName || "লাইভ হাজিরা"}
            </h1>
            {institutionAddress && (
              <p className="m-0 text-[17px] text-[#d8eee5] max-[480px]:text-[13px]">{institutionAddress}</p>
            )}
          </div>
        </header>

        {/* Topline */}
        <div className="mx-[2px] mb-[15px] mt-[22px] flex flex-wrap items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[9px] font-semibold text-[#075b46]">
            {isToday ? (
              <>
                <span
                  className={`h-[10px] w-[10px] rounded-full ${isError ? "bg-[#d05a4c]" : "animate-pulse bg-[#20b978] shadow-[0_0_0_5px_#20b97820]"}`}
                />
                লাইভ হাজিরা মনিটরিং
                <span className="text-[13px] font-normal text-[#71827b]">
                  {isError
                    ? "— সার্ভারে সংযোগ হচ্ছে না"
                    : updatedAt
                      ? `— সর্বশেষ আপডেট ${updatedAt}${isFetching ? " …" : ""}`
                      : ""}
                </span>
              </>
            ) : (
              <>
                <span className="h-[10px] w-[10px] rounded-full bg-[#b6c4bc]" />
                হাজিরার তালিকা
                <button
                  type="button"
                  onClick={() => setDate(localDate())}
                  className="rounded-[20px] bg-[#eaf5ee] px-[11px] py-[3px] text-[13px] text-[#075b46] hover:bg-[#d9eee1]"
                >
                  আজকের লাইভে ফিরুন
                </button>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-[10px]">
            <span className="text-[15px] text-[#71827b]">{dateText}</span>
            {userTypes.length > 1 && (
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="h-[38px] rounded-[10px] border border-[#dbe5de] bg-white px-[10px] text-[14px] text-[#18352d] outline-none focus:border-[#087354]"
              >
                <option value="">সকল ইউজার</option>
                {userTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="date"
              value={date}
              max={localDate()}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="h-[38px] rounded-[10px] border border-[#dbe5de] bg-white px-[10px] text-[14px] text-[#18352d] outline-none focus:border-[#087354]"
            />
          </div>
        </div>

        {/* Dashboard */}
        <main className="grid grid-cols-[minmax(300px,0.92fr)_minmax(420px,1.35fr)] items-stretch gap-[22px] max-[850px]:grid-cols-1">
          {/* Latest */}
          <section className="relative flex min-h-[590px] flex-col items-center justify-center overflow-hidden rounded-[20px] border border-[#e4ebe5] bg-white p-[25px] shadow-[0_5px_20px_#18352d08] max-[850px]:min-h-[460px]">
            <div className="absolute inset-x-0 top-0 h-[8px] bg-gradient-to-r from-[#075b46] to-[#d7ad58]" />
            <div className="absolute left-[18px] top-[22px] rounded-[20px] bg-[#eaf5ee] px-[11px] py-[4px] text-[13px] font-semibold text-[#075b46]">
              সর্বশেষ হাজিরা
            </div>
            {isLoading ? (
              <p className="text-[#71827b]">লোড হচ্ছে…</p>
            ) : (
              <LatestCard latest={latest} isToday={isToday} />
            )}
          </section>

          {/* Right Column */}
          <section className="flex min-w-0 flex-col gap-[20px]">
            <div className="grid grid-cols-4 gap-[14px] max-[850px]:gap-[9px] max-[600px]:grid-cols-2">
              <StatCard label="মোট" value={stats.total} tone="text-[#075b46]" sub="শিফটে যুক্ত" />
              <StatCard label="উপস্থিত" value={stats.present} tone="text-[#13945e]" />
              <StatCard label="দেরিতে" value={stats.late} tone="text-[#c06a1e]" />
              <StatCard label="অনুপস্থিত" value={stats.absent} tone="text-[#d05a4c]" />
            </div>

            {/* Day list */}
            <div className="flex min-h-[440px] flex-1 flex-col rounded-[20px] border border-[#e4ebe5] bg-white px-[22px] pb-[16px] pt-[20px] shadow-[0_5px_20px_#18352d08] max-[480px]:px-[14px] max-[480px]:pt-[16px]">
              <div className="mb-[14px] flex flex-wrap items-center justify-between gap-[10px]">
                <div className="flex rounded-[12px] bg-[#f0f5f1] p-[4px]">
                  {[
                    { key: "present", label: "উপস্থিত", count: present.length, tone: "text-[#087849]" },
                    { key: "absent", label: "অনুপস্থিত", count: absent.length, tone: "text-[#d05a4c]" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTab(t.key)}
                      className={`rounded-[9px] px-[14px] py-[7px] text-[15px] font-semibold transition ${
                        tab === t.key ? `bg-white shadow-sm ${t.tone}` : "text-[#71827b] hover:text-[#18352d]"
                      }`}
                    >
                      {t.label} <span className="text-[13px]">({toBnDigits(t.count)})</span>
                    </button>
                  ))}
                </div>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="নাম বা আইডি দিয়ে খুঁজুন"
                  className="h-[38px] w-[220px] rounded-[10px] border border-[#dbe5de] px-[12px] text-[14px] outline-none focus:border-[#087354] max-[480px]:w-full"
                />
              </div>

              <div className="max-h-[520px] flex-1 overflow-y-auto pr-[5px] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[#cbd9d0] [&::-webkit-scrollbar]:w-[6px]">
                {isLoading ? (
                  <p className="py-[40px] text-center text-[#71827b]">লোড হচ্ছে…</p>
                ) : isError && !data ? (
                  <p className="py-[40px] text-center text-[#d05a4c]">তথ্য আনা যায়নি</p>
                ) : list.length === 0 ? (
                  <p className="py-[40px] text-center text-[#71827b]">
                    {q
                      ? "কাউকে পাওয়া যায়নি"
                      : tab === "present"
                        ? "এই দিনে এখনও কেউ হাজিরা দেয়নি"
                        : "কেউ অনুপস্থিত নেই"}
                  </p>
                ) : tab === "present" ? (
                  list.map((r) => (
                    <div
                      key={r.ID}
                      className={`flex items-center gap-[12px] rounded-[10px] border-b border-[#edf1ed] px-[6px] py-[11px] last:border-b-0 ${
                        freshIds.has(r.ID) ? "animate-[liveFlash_3s_ease-out]" : ""
                      }`}
                    >
                      <Avatar name={r.UserName} />
                      <div className="min-w-0 flex-1">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-semibold">
                          {r.UserName}
                        </div>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#71827b]">
                          আইডি: {toBnDigits(r.UserCode)}
                          {classOf(r) && ` · ${classOf(r)}`}
                          {r.SwitchName && ` · ${r.SwitchName}`}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-[4px]">
                        <div className="whitespace-nowrap rounded-[9px] bg-[#f0f7f2] px-[9px] py-[5px] text-[13px] font-semibold text-[#075b46]">
                          {timeOf(r.Time)}
                        </div>
                        {isLate(r) && (
                          <div className="whitespace-nowrap text-[12px] font-semibold text-[#c06a1e]">
                            দেরি {lateText(r.LateTime)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  list.map((u) => (
                    <div
                      key={u.UserID}
                      className="flex items-center gap-[12px] border-b border-[#edf1ed] px-[6px] py-[11px] last:border-b-0"
                    >
                      <Avatar name={u.UserName} tone="bg-[#fdf0ee] text-[#d05a4c]" />
                      <div className="min-w-0 flex-1">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-semibold">
                          {u.UserName}
                        </div>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#71827b]">
                          আইডি: {toBnDigits(u.UserCode)}
                          {classOf(u) && ` · ${classOf(u)}`}
                          {u.ShiftName && ` · ${u.ShiftName}`}
                        </div>
                      </div>
                      <div className="whitespace-nowrap rounded-[9px] bg-[#fdf0ee] px-[9px] py-[5px] text-[13px] font-semibold text-[#d05a4c]">
                        অনুপস্থিত
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
