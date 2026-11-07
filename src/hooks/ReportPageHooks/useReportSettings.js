// hooks/ReportPageHooks/useReportSettings.js
//
// রিপোর্টের ⚙️ সেটিং — ডাটাবেস থেকে লোড ও ডাটাবেসে সেভ।
// ব্যাকএন্ড রুট (/report_settings) এখনো ডিপ্লয় না হলেও UI ভাঙবে না —
// তখন localStorage এ সেভ হবে, আর রুট চালু হলেই আবার DB তে যাবে।

import { useEffect, useMemo, useState } from "react";
import {
  useGetReportSettingsQuery,
  useSaveReportSettingsMutation,
} from "../../features/reports/reportQuerySlice";
import {
  DEFAULT_REPORT_SETTINGS,
  REPORT_SETTINGS_STORAGE_PREFIX,
  mergeReportSettings,
} from "../../view/students/reports/student-report-list/reportSettingsConstants";

const readLocal = (reportKey) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REPORT_SETTINGS_STORAGE_PREFIX + reportKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeLocal = (reportKey, value) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      REPORT_SETTINGS_STORAGE_PREFIX + reportKey,
      JSON.stringify(value)
    );
  } catch {
    /* ignore */
  }
};

export default function useReportSettings(reportKey = "student_report", defaults = {}) {
  const defaultsKey = JSON.stringify(defaults || {});
  const baseDefaults = useMemo(
    () => mergeReportSettings(null, JSON.parse(defaultsKey)),
    [defaultsKey]
  );

  const {
    data: serverData,
    isLoading,
    isError,
  } = useGetReportSettingsQuery(reportKey, { skip: !reportKey });

  const [saveReportSettings, { isLoading: saving }] = useSaveReportSettingsMutation();

  const [settings, setSettings] = useState(() =>
    mergeReportSettings(readLocal(reportKey), JSON.parse(defaultsKey))
  );

  // রিপোর্ট বদলালে / সার্ভার ডাটা এলে — সেটিং রিফ্রেশ
  useEffect(() => {
    const fromServer = serverData?.Settings;
    if (fromServer) {
      const merged = mergeReportSettings(fromServer, baseDefaults);
      setSettings(merged);
      writeLocal(reportKey, merged);
      return;
    }
    // সার্ভারে কিছু না থাকলে (বা রুট না থাকলে) — লোকাল/ডিফল্ট
    setSettings(mergeReportSettings(readLocal(reportKey), baseDefaults));
  }, [serverData, reportKey, baseDefaults]);

  // একটি ফিল্ড বদলানো
  const updateSetting = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  // সেভ — আগে লোকালে, তারপর DB তে
  const save = async (next) => {
    const value = mergeReportSettings(next || settings, baseDefaults);
    setSettings(value);
    writeLocal(reportKey, value);
    try {
      await saveReportSettings({ ReportKey: reportKey, Settings: value }).unwrap();
      return { ok: true, savedToDb: true };
    } catch (error) {
      console.error("Report settings save error:", error);
      return { ok: true, savedToDb: false };
    }
  };

  const resetSettings = () => {
    const value = mergeReportSettings(null, baseDefaults);
    setSettings(value);
    writeLocal(reportKey, value);
    return value;
  };

  return {
    settings,
    setSettings,
    updateSetting,
    save,
    saving,
    resetSettings,
    loading: isLoading,
    offline: isError, // true হলে DB তে না গিয়ে localStorage এ আছে
    DEFAULTS: DEFAULT_REPORT_SETTINGS,
  };
}
