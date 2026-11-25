import { useEffect, useMemo, useRef, useState } from "react";
import { Buffer } from "buffer";
import PropTypes from "prop-types";
import { useGetLiveAttendancePhotoQuery, useGetLiveAttendanceQuery } from "../features/attendance/attendanceSlice";
import { useGetInstitutionInfoQuery } from "../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../utils/conveter";
import { toBnDigits, toBnDisplay, toHHMM } from "../view/deviceTimeSettings/timeUtils";

const POLL_MS = 5000;

const AVATAR_FALLBACK = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e8f0ea'/%3E%3Ccircle cx='150' cy='112' r='58' fill='%2399b5a5'/%3E%3Cpath d='M48 292c8-75 47-112 102-112s94 37 102 112' fill='%2399b5a5'/%3E%3C/svg%3E`;

const CARD = "rounded-2xl border border-[#e4ebe5] bg-white shadow-[0_5px_20px_#18352d08] sm:rounded-[20px]";
const FIELD =
  "h-[38px] min-w-0 rounded-[10px] border border-[#dbe5de] bg-white px-[10px] text-[14px] text-[#18352d] outline-none focus:border-[#087354]";

// ব্রাউজারের লোকাল তারিখ "YYYY-MM-DD"
const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const isLate = (r) => Boolean(r.LateTime) && r.LateTime !== "00:00:00";

// "01:21:48" → "১ ঘণ্টা ২১ মিনিট" 
const lateText = (hms) => {
  const [h, m] = String(hms || "")
    .split(":")
    .map(Number);
  const parts = [];
  if (h) parts.push(`${toBnDigits(h)} ঘণ্টা`);
  if (m || !h) parts.push(`${toBnDigits(m || 0)} মিনিট`);
  return parts.join(" ");
};

const timeOf = (hms) => toBnDisplay(toHHMM(hms));
const classOf = (u) => u.ClassName || u.UserTypeName || "";

function StatCard({ label, value, tone, sub }) {
  return (
    <div
      className={`${CARD} relative min-w-0 overflow-hidden px-[14px] py-[12px] sm:min-h-[118px] sm:px-[17px] sm:py-[18px]`}
    >
      <div className="pointer-events-none absolute -bottom-[28px] -right-[22px] h-[70px] w-[70px] rounded-full bg-[#0b76580d]" />
      <div className="truncate text-[14px] text-[#71827b] sm:text-[15px]">{label}</div>
      <div className={`mt-[4px] text-[26px] font-bold leading-[1.3] sm:mt-[6px] sm:text-[34px] ${tone}`}>
        {toBnDigits(value)}
      </div>
      {sub && <div className="truncate text-[12px] text-[#71827b]">{sub}</div>}
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  tone: PropTypes.string,
  sub: PropTypes.string,
};
/*


*/
function LatestCard({ latest, isToday }) {
  const { data: photoData } = useGetLiveAttendancePhotoQuery(latest?.UserID, { skip: !latest?.UserID });
  const photo = photoData?.photo || AVATAR_FALLBACK;

  if (!latest) {
    return (
      <div className="flex flex-col items-center py-[10px] text-center text-[#71827b]">
        <img
          className="mb-[14px] h-[110px] w-[110px] rounded-[20px] opacity-70 sm:mb-[18px] sm:h-[160px] sm:w-[160px] sm:rounded-[24px]"
          alt=""
          src={AVATAR_FALLBACK}
        />
        <p className="m-0 text-[17px] font-semibold text-[#18352d] sm:text-[20px]">এখনও কোনো হাজিরা আসেনি</p>
        <p className="m-0 mt-[6px] text-[14px] sm:text-[15px]">
          {isToday ? "ডিভাইসে আঙুল / কার্ড দিলেই এখানে দেখা যাবে" : "এই দিনে কোনো হাজিরা নেই"}
        </p>
      </div>
    );
  }

  const late = isLate(latest);
  return (
    <div
      key={latest.ID}
      className="flex w-full animate-live-in items-center gap-[14px] text-left flex-col sm:gap-0 sm:text-center"
    >
      <div className="aspect-square w-[96px] flex-none rounded-[18px] bg-gradient-to-br from-[#d6b76e] to-[#087354] p-[4px] shadow-[0_12px_28px_#075b4620] sm:w-[min(240px,55%)] sm:rounded-[24px] sm:p-[7px] xl:w-[min(380px,75%)]">
        <img
          className="block h-full w-full rounded-[14px] bg-[#eaf1ec] object-cover sm:rounded-[19px]"
          alt="ছবি"
          src={photo}
          onError={(e) => {
            e.currentTarget.src = AVATAR_FALLBACK;
          }}
        />
      </div>
      <div className="min-w-0 flex-1 sm:flex-none">
        <h2 className="mb-[3px] break-words text-[20px] font-bold leading-[1.3] sm:mt-[18px] sm:text-[26px] xl:mt-[20px] xl:text-[30px]">
          {latest.UserName}
        </h2>
        <p className="m-0 text-[14px] text-[#71827b] sm:text-[17px] xl:text-[20px]">
          আইডি নং: <strong>{toBnDigits(latest.UserCode)}</strong>
          {classOf(latest) && (
            <>
              {" "}
              &nbsp;|&nbsp; <strong>{classOf(latest)}</strong>
            </>
          )}
        </p>
        <p className="m-0 mt-[6px] text-[13px] text-[#71827b] sm:text-[18px]">
          {[latest.ShiftName, latest.SwitchName].filter(Boolean).join(" · ")}
          {" — "}
          <strong className="text-[#075b46]">{timeOf(latest.Time)}</strong>
        </p>
        <div className="mt-[10px] flex flex-wrap justify-start gap-[8px] text-[13px] sm:mt-[16px] sm:justify-center sm:text-[16px]">
          <span className="rounded-[30px] bg-[#e7f7ee] px-[12px] py-[5px] font-bold text-[#087849] sm:px-[22px] sm:py-[8px]">
            ✓ উপস্থিত
          </span>
          {late ? (
            <span className="rounded-[30px] bg-[#fdf0e6] px-[12px] py-[5px] font-bold text-[#c06a1e] sm:px-[18px] sm:py-[8px]">
              দেরি: {lateText(latest.LateTime)}
            </span>
          ) : (
            <span className="rounded-[30px] bg-[#eef4fb] px-[12px] py-[5px] font-bold text-[#2c6aa8] sm:px-[18px] sm:py-[8px]">
              সময়মতো
            </span>
          )}
        </div>
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
    <div
      className={`grid h-[38px] w-[38px] flex-none place-items-center rounded-full font-bold sm:h-[43px] sm:w-[43px] ${tone}`}
    >
      {String(name || "?")
        .trim()
        .charAt(0)}
    </div>
  );
}

Avatar.propTypes = { name: PropTypes.string, tone: PropTypes.string };

function Row({ name, meta, avatarTone, flash, children }) {
  return (
    <div
      className={`flex items-center gap-[10px] rounded-[10px] border-b border-[#edf1ed] px-[2px] py-[10px] last:border-b-0 sm:gap-[12px] sm:px-[6px] sm:py-[11px] ${
        flash ? "animate-live-flash" : ""
      }`}
    >
      <Avatar name={name} tone={avatarTone} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold sm:text-[16px]">{name}</div>
        <div className="truncate text-[13px] text-[#71827b]">{meta}</div>
      </div>
      <div className="flex flex-none flex-col items-end gap-[4px]">{children}</div>
    </div>
  );
}

Row.propTypes = {
  name: PropTypes.string,
  meta: PropTypes.string,
  avatarTone: PropTypes.string,
  flash: PropTypes.bool,
  children: PropTypes.node,
};

const TIME_BADGE =
  "whitespace-nowrap rounded-[9px] px-[8px] py-[4px] text-[12px] font-semibold sm:px-[9px] sm:py-[5px] sm:text-[13px]";

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
    !q ||
    String(u.UserName || "")
      .toLowerCase()
      .includes(q) ||
    String(u.UserCode || "").includes(q);
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

  const metaOf = (u, extra) => [`আইডি: ${toBnDigits(u.UserCode)}`, classOf(u), extra].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-[#f4f7f3] font-default text-[#18352d] antialiased">
      <div className="mx-auto max-w-[1440px] p-[12px] sm:p-[20px] xl:p-[28px]">
        {/* Header */}
        <header className="relative flex flex-col items-center justify-center gap-[10px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#064b3b] to-[#087354] px-[14px] py-[18px] text-white shadow-[0_12px_32px_#064b3b20] sm:flex-row sm:gap-[20px] sm:rounded-[22px] sm:px-[32px] sm:py-[25px]">
          <div className="pointer-events-none absolute -right-[80px] -top-[170px] h-[300px] w-[300px] rounded-full border border-white/10 shadow-[0_0_0_25px_#ffffff08,0_0_0_55px_#ffffff06]" />
          <div
            className="z-[1] grid h-[58px] w-[58px] flex-none place-items-center overflow-hidden rounded-full border-2 border-[#e8c879] bg-white sm:h-[76px] sm:w-[76px]"
            aria-label="প্রতিষ্ঠানের লোগো"
          >
            {logo ? (
              <img src={logo} alt="লোগো" className="h-full w-full object-contain p-[4px]" />
            ) : (
              <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-[65%] w-[65%]">
                <path
                  d="M32 5 38 20 54 21 42 32 46 48 32 39 18 48 22 32 10 21 26 20 32 5Z"
                  stroke="#087354"
                  strokeWidth="2.2"
                />
                <path d="M20 28h24v17H20z" stroke="#087354" strokeWidth="2" />
              </svg>
            )}
          </div>
          <div className="z-[1] min-w-0 text-center">
            <h1 className="m-0 mb-[5px] break-words text-[21px] font-bold leading-[1.3] tracking-[0.2px] sm:text-[28px] xl:text-[36px]">
              {institutionName || "লাইভ হাজিরা"}
            </h1>
            {institutionAddress && (
              <p className="m-0 break-words text-[13px] text-[#d8eee5] sm:text-[17px]">{institutionAddress}</p>
            )}
          </div>
        </header>

        {/* Topline */}
        <div className="mx-[2px] mb-[15px] mt-[14px] flex flex-col gap-[12px] sm:mt-[22px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-[9px] gap-y-[4px] font-semibold text-[#075b46]">
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
          <div className="flex w-full flex-wrap items-center gap-[10px] sm:w-auto">
            <span className="basis-full text-[15px] text-[#71827b] sm:basis-auto">{dateText}</span>
            {userTypes.length > 1 && (
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className={`${FIELD} flex-1 sm:flex-none`}
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
              className={`${FIELD} flex-1 sm:flex-none`}
            />
          </div>
        </div>

        {/* Dashboard */}
        <main className="grid grid-cols-1 items-stretch gap-[14px] sm:gap-[20px] xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.35fr)] xl:gap-[22px]">
          {/* Latest */}
          <section
            className={`${CARD} relative flex min-w-0 flex-col items-center justify-center overflow-hidden px-[14px] pb-[16px] pt-[52px] sm:p-[25px] sm:pt-[60px] xl:min-h-[590px] xl:pt-[25px]`}
          >
            <div className="absolute inset-x-0 top-0 h-[6px] bg-gradient-to-r from-[#075b46] to-[#d7ad58] sm:h-[8px]" />
            <div className="absolute left-[14px] top-[18px] rounded-[20px] bg-[#eaf5ee] px-[11px] py-[4px] text-[13px] font-semibold text-[#075b46] sm:left-[18px] sm:top-[22px]">
              সর্বশেষ হাজিরা
            </div>
            {isLoading ? (
              <p className="text-[#71827b]">লোড হচ্ছে…</p>
            ) : (
              <LatestCard latest={latest} isToday={isToday} />
            )}
          </section>

          {/* Right Column */}
          <section className="flex min-w-0 flex-col gap-[14px] sm:gap-[20px]">
            <div className="grid grid-cols-2 gap-[9px] sm:grid-cols-4 sm:gap-[14px]">
              <StatCard label="মোট" value={stats.total} tone="text-[#075b46]" sub="শিফটে যুক্ত" />
              <StatCard label="উপস্থিত" value={stats.present} tone="text-[#13945e]" />
              <StatCard label="দেরিতে" value={stats.late} tone="text-[#c06a1e]" />
              <StatCard label="অনুপস্থিত" value={stats.absent} tone="text-[#d05a4c]" />
            </div>

            {/* Day list */}
            <div
              className={`${CARD} flex min-w-0 flex-1 flex-col px-[12px] pb-[10px] pt-[14px] sm:min-h-[440px] sm:px-[22px] sm:pb-[16px] sm:pt-[20px]`}
            >
              <div className="mb-[14px] flex flex-col gap-[10px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex w-full rounded-[12px] bg-[#f0f5f1] p-[4px] sm:w-auto">
                  {[
                    { key: "present", label: "উপস্থিত", count: present.length, tone: "text-[#087849]" },
                    { key: "absent", label: "অনুপস্থিত", count: absent.length, tone: "text-[#d05a4c]" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTab(t.key)}
                      className={`flex-1 whitespace-nowrap rounded-[9px] px-[8px] py-[7px] text-[14px] font-semibold transition sm:flex-none sm:px-[14px] sm:text-[15px] ${
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
                  className={`${FIELD} w-full px-[12px] sm:w-[220px]`}
                />
              </div>

              <div className="max-h-[70vh] flex-1 overflow-y-auto pr-[5px] scrollbar-thin scrollbar-thumb-[#cbd9d0] scrollbar-thumb-rounded-full sm:max-h-[65vh] xl:max-h-[520px]">
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
                    <Row key={r.ID} name={r.UserName} meta={metaOf(r, r.SwitchName)} flash={freshIds.has(r.ID)}>
                      <div className={`${TIME_BADGE} bg-[#f0f7f2] text-[#075b46]`}>{timeOf(r.Time)}</div>
                      {isLate(r) && (
                        <div className="whitespace-nowrap text-[12px] font-semibold text-[#c06a1e]">
                          দেরি {lateText(r.LateTime)}
                        </div>
                      )}
                    </Row>
                  ))
                ) : (
                  list.map((u) => (
                    <Row
                      key={u.UserID}
                      name={u.UserName}
                      meta={metaOf(u, u.ShiftName)}
                      avatarTone="bg-[#fdf0ee] text-[#d05a4c]"
                    >
                      <div className={`${TIME_BADGE} bg-[#fdf0ee] text-[#d05a4c]`}>অনুপস্থিত</div>
                    </Row>
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
