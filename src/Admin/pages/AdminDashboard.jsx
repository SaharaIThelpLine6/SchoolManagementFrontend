// src/Admin/pages/AdminDashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import ReactApexChart from "react-apexcharts";
import useTranslate from '../../utils/Translate';

const API_URL = import.meta.env.VITE_SERVER_URL || ""; // 🌟 API URL

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

// ১২ ঘণ্টা ফরম্যাটে সময় রূপান্তরের ফাংশন
const formatHour = (hour) => {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
};

// পরিবর্তন করুন: ৮ থেকে ২২ পর্যন্ত ঘণ্টা (সকাল ৮টা থেকে রাত ১০টা)
const startHour = 8;   // সকাল ৮টা
const endHour = 22;    // রাত ১০টা
const hourNumbers = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
const formattedHours = hourNumbers.map((h) => formatHour(h));

const days = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র"];

const AdminDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const translate = useTranslate(); // 🌟 translation hook

  // ফিল্টার স্টেটস
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // ড্যাশবোর্ড ডেটা স্টেট
  const [dashboardData, setDashboardData] = useState({
    active: 0,
    inactive: 0,
    online: 0,
    offline: 0,
    quotaSold: 0,
    quotaSoldTotal: 0,
    quotaUnused: 0,
    newMadrasasMonthly: [],
    complaintCategory: {
      interested: 0,
      notReceiving: 0,
      complained: 0,
      notInterested: 0,
    },
    totalSupportLastMonth: 0,
    activeInRange: 0,
    inactiveInRange: 0,
    allTimeActive: 0,
    allTimeInactive: 0,
    renewed: 0, 
    notRenewed: 0,  
    allTimeQuotaSold: 0,
  });
  const [loading, setLoading] = useState(true);

  // ================= Date Range Picker State & Logic =================
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activePreset, setActivePreset] = useState("Custom");
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");
  const datePickerRef = useRef(null);

  // 🌟 সাপোর্ট লিস্ট পপআপ স্টেট
  const [isSupportListOpen, setIsSupportListOpen] = useState(false);
  const [activeSupportTab, setActiveSupportTab] = useState("team"); // "team" | "madrasa"
  const [supportList, setSupportList] = useState([]);
  const [supportListLoading, setSupportListLoading] = useState(false);
  const [supportSearchQuery, setSupportSearchQuery] = useState("");
  // প্যাজিনেশন স্টেট (দুই ট্যাবের জন্য আলাদা)
  const [supportPagination, setSupportPagination] = useState({
    team: { page: 1, limit: 10, total: 0, totalPages: 1 },
    madrasa: { page: 1, limit: 10, total: 0, totalPages: 1 }
  });

  // 🌟 Heatmap স্টেট
  const [heatmapData, setHeatmapData] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🌟 Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return; 
      
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await fetch(`${API_URL}/api/admin/dashboard/dashboard_info?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, token]);

  // 🌟 Fetch support list (ট্যাব ও পেজ পরিবর্তনের সময়)
  useEffect(() => {
    if (!isSupportListOpen || !token) return;

    const fetchSupportList = async () => {
      setSupportListLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        params.append("page", supportPagination[activeSupportTab].page);
        params.append("limit", supportPagination[activeSupportTab].limit);

        const endpoint = activeSupportTab === "team" ? "support_list" : "madrasa_support_list";
        const response = await fetch(`${API_URL}/api/admin/dashboard/${endpoint}?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setSupportList(data.list || []);
        setSupportPagination(prev => ({
          ...prev,
          [activeSupportTab]: {
            ...prev[activeSupportTab],
            total: data.pagination?.total || 0,
            totalPages: data.pagination?.totalPages || 1,
            page: data.pagination?.page || 1,
            limit: data.pagination?.limit || 10
          }
        }));
      } catch (error) {
        console.error("❌ Error fetching support list:", error);
        setSupportList([]);
      } finally {
        setSupportListLoading(false);
      }
    };

    fetchSupportList();
  }, [isSupportListOpen, token, startDate, endDate, activeSupportTab, supportPagination[activeSupportTab].page]);

  // 🌟 Fetch heatmap data
  useEffect(() => {
    const fetchHeatmapData = async () => {
      if (!token) return;
      setHeatmapLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await fetch(`${API_URL}/api/admin/dashboard/heatmap_data?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setHeatmapData(data.heatmapData || []);
      } catch (error) {
        console.error("❌ Error fetching heatmap data:", error);
        setHeatmapData([]);
      } finally {
        setHeatmapLoading(false);
      }
    };

    fetchHeatmapData();
  }, [startDate, endDate, token]);

  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handlePresetClick = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    let start, end;

    switch (preset) {
      case 'Today':
        start = today; end = today; break;
      case 'Yesterday':
        start = new Date(today); start.setDate(today.getDate() - 1); end = new Date(start); break;
      case 'Last 7 days':
        start = new Date(today); start.setDate(today.getDate() - 6); end = today; break;
      case 'Last 30 days':
        start = new Date(today); start.setDate(today.getDate() - 29); end = today; break;
      case 'This month':
        start = new Date(today.getFullYear(), today.getMonth(), 1); end = today; break;
      case 'Custom': return; 
      default: return;
    }
    
    setTempStart(formatDate(start));
    setTempEnd(formatDate(end));
  };

  const applyDateRange = () => {
    setStartDate(tempStart);
    setEndDate(tempEnd);
    setIsDatePickerOpen(false);
    setSelectedMonth("");
    setSelectedYear(new Date().getFullYear());
    // পপআপ খোলা থাকলে পেজ 1 এ রিসেট
    setSupportPagination(prev => ({
      team: { ...prev.team, page: 1 },
      madrasa: { ...prev.madrasa, page: 1 }
    }));
  };

  const handleMonthChange = (e) => {
    const m = e.target.value;
    setSelectedMonth(m);
    
    if (m) {
      const year = selectedYear;
      const start = new Date(year, parseInt(m) - 1, 1);
      const end = new Date(year, parseInt(m), 0);
      
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
      setActivePreset("Custom");
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleYearChange = (e) => {
    const y = parseInt(e.target.value, 10);
    setSelectedYear(y);
    
    if (selectedMonth) {
      const start = new Date(y, parseInt(selectedMonth) - 1, 1);
      const end = new Date(y, parseInt(selectedMonth), 0);
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
      setActivePreset(translate("Custom"));
    }
  };

  const handleResetAllFilters = () => {
    setStartDate("");
    setEndDate("");
    setTempStart("");
    setTempEnd("");
    setSelectedMonth("");
    setSelectedYear(new Date().getFullYear());
    setActivePreset("Custom");
    setSupportPagination(prev => ({
      team: { ...prev.team, page: 1 },
      madrasa: { ...prev.madrasa, page: 1 }
    }));
  };

  const getDisplayDateRange = () => {
    if (startDate && endDate) return `${startDate} - ${endDate}`;
    return translate("Custom Date Range");
  };
  // ================= End Date Range Picker Logic =================

  // 🌟 Dynamic date label for chart titles
  const chartDateLabel = (startDate && endDate) 
    ? `(${startDate} ${translate("to")} ${endDate})` 
    : "";

  // 🌟 সাপোর্ট লিস্ট সার্চ ফিল্টার (client-side)
  const filteredSupportList = supportList.filter((item) => {
    const searchField = activeSupportTab === "team" ? item.fullName : item.instituteName;
    return (searchField || "").toLowerCase().includes(supportSearchQuery.toLowerCase());
  });

  // পেজ পরিবর্তন হ্যান্ডলার
  const handleSupportPageChange = (newPage) => {
    setSupportPagination(prev => ({
      ...prev,
      [activeSupportTab]: { ...prev[activeSupportTab], page: newPage }
    }));
  };

  // ================= Chart Options =================
  const newMadrasaSeries = [{
      name: translate("New Madrasah"),
      data: dashboardData.newMadrasasMonthly?.length 
            ? dashboardData.newMadrasasMonthly.map((item) => Number(item.count) || 0) 
            : [0], 
  }];

  const newMadrasaCategories = dashboardData.newMadrasasMonthly?.length 
    ? dashboardData.newMadrasasMonthly.map((item) => {
        const [year, month] = item.month.split("-");
        const monthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
        return monthNames[parseInt(month, 10) - 1];
      })
    : [translate("No Data")]; 

  const newMadrasaOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#3b82f6"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.8, opacityTo: 0, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: { categories: newMadrasaCategories, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: "#6b7280", fontSize: "12px" } } },
    yaxis: { labels: { style: { colors: "#6b7280", fontSize: "12px" } } },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 3, yaxis: { lines: { show: true } } },
    tooltip: { theme: "light" },
  };

  // ✅ Renewal Status চার্ট এখন backend এর renewed / notRenewed ভ্যালু ব্যবহার করবে
  const renewData = [
    { name: translate("Renewed"), value: Number(dashboardData.renewed) || 0 }, 
    { name: translate("Not Renewed"), value: Number(dashboardData.notRenewed) || 0 },
  ];

  const quotaData = [
    { name: translate("In Use"), value: Number(dashboardData.quotaSold) || 0 }, 
    { name: translate("Unused"), value: Number(dashboardData.quotaUnused) || 0 },
  ];

  // ✅ Madrasah Status চার্ট 
  const activeInactiveData = [
    { name: translate("Active"), value: Number(dashboardData.allTimeActive) || 0 }, 
    { name: translate("Inactive"), value: Number(dashboardData.allTimeInactive) || 0 },
  ];

  const loginData = [
    { name: translate("Logged In"), value: Number(dashboardData.online) || 0 }, 
    { name: translate("Not Logged In"), value: Number(dashboardData.offline) || 0 },
  ];

  // 🌟 অভিযোগের ক্যাটাগরি — এখন InventoryNode.Status থেকে (আগে mock data ছিল)
  const complaintCategoryData = [
    { name: translate("Interested"), count: Number(dashboardData.complaintCategory?.interested) || 0 },
    { name: translate("Does Not Receive"), count: Number(dashboardData.complaintCategory?.notReceiving) || 0 },
    { name: translate("Complained"), count: Number(dashboardData.complaintCategory?.complained) || 0 },
    { name: translate("Not Interested"), count: Number(dashboardData.complaintCategory?.notInterested) || 0 },
  ];

  const complaintSeries = [{ name: translate("Complain"), data: complaintCategoryData.map((item) => item.count) }];
  const complaintOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#f59e0b"],
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "50%" } },
    dataLabels: { enabled: false },
    xaxis: { categories: complaintCategoryData.map((item) => item.name), axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: "#6b7280", fontSize: "12px" } } },
    yaxis: { labels: { style: { colors: "#6b7280", fontSize: "12px" } } },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 3, xaxis: { lines: { show: true } } },
    tooltip: { theme: "light" },
  };

  // 🔥 ডাইনামিক হিটম্যাপ ডেটা
  const dayNameMap = {
    Saturday: "শনি",
    Sunday: "রবি",
    Monday: "সোম",
    Tuesday: "মঙ্গল",
    Wednesday: "বুধ",
    Thursday: "বৃহঃ",
    Friday: "শুক্র"
  };

  const heatmapSeries = heatmapData.map((row) => ({
    name: dayNameMap[row.day] || row.day,
    data: hourNumbers.map((hour) => ({
      x: formatHour(hour),
      y: row.hours[hour] || 0   // hour = ৮,৯,১০,...২২ → সঠিক ইনডেক্স
    }))
  }));

  const heatmapOptions = {
    chart: { type: "heatmap", toolbar: { show: false }, fontFamily: "inherit" },
    dataLabels: { enabled: false },
    colors: ["#fff7ed", "#fed7aa", "#fb923c", "#f97316", "#ea580c"],
    plotOptions: { heatmap: { shadeIntensity: 0.5, radius: 1, useFillColorAsStroke: true, colorScale: { ranges: [ { from: 0, to: 0, color: "#fff7ed" }, { from: 1, to: 5, color: "#fed7aa" }, { from: 6, to: 12, color: "#fb923c" }, { from: 13, to: 25, color: "#f97316" }, { from: 26, to: 60, color: "#ea580c" } ] } } },
    xaxis: { categories: formattedHours, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: "#6b7280", fontSize: "10px" }, rotate: -45 } },
    yaxis: { labels: { style: { colors: "#6b7280", fontSize: "12px" } } },
    tooltip: { theme: "light" },
    legend: { show: false },
  };

  const createPieOptions = (data, colorOffset = 0) => ({
    chart: { type: "donut", fontFamily: "inherit" },
    labels: data.map((item) => item.name),
    colors: COLORS.slice(colorOffset).concat(COLORS.slice(0, colorOffset)),
    legend: { position: "bottom", fontSize: "12px", labels: { colors: "#6b7280" } },
    dataLabels: { enabled: false },
    plotOptions: { 
      pie: { 
        donut: { 
          size: "70%",
          labels: {
            show: true,
            name: { show: true, fontSize: "12px" },
            value: { show: true, fontSize: "16px", fontWeight: "bold" },
            total: { show: true, label: translate("Total"), fontSize: "14px", color: "#373d3f" }
          }
        } 
      } 
    },
    tooltip: { theme: "light" },
  });

  return (
    <div className="font-default bg-gray-50 min-h-screen pb-10">
      {/* ২. ফিল্টার সেকশন (sticky) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 sticky top-0 z-30">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800 flex-shrink-0">{translate("Filter")}:</h2>
          <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
            
            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => {
                  setTempStart(startDate);
                  setTempEnd(endDate);
                  setIsDatePickerOpen(!isDatePickerOpen);
                }}
                className="flex items-center justify-between min-w-[220px] bg-white border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-3 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-gray-500 font-normal mr-2">{translate("Custom")}</span>
                {getDisplayDateRange()}
                <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {isDatePickerOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-2xl rounded-lg z-50 flex flex-col sm:flex-row w-[280px] sm:w-[350px] overflow-hidden">
                  <div className="w-full sm:w-[140px] bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 flex flex-col py-2">
                    {["Custom", "Today", "Yesterday", "Last 7 days", "Last 30 days", "This month"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handlePresetClick(preset)}
                        className={`text-left px-4 py-2 text-sm transition-colors ${
                          activePreset === preset ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {translate(preset)}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 p-4 flex flex-col justify-between bg-white">
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="w-full">
                        <label className="block text-xs text-blue-600 font-semibold mb-1">{translate("Start date")}</label>
                        <input
                          type="date"
                          value={tempStart}
                          onChange={(e) => { setTempStart(e.target.value); setActivePreset("Custom"); }}
                          className="w-full border border-gray-300 rounded-md p-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="w-full">
                        <label className="block text-xs text-gray-600 font-medium mb-1">{translate("End date")}</label>
                        <input
                          type="date"
                          value={tempEnd}
                          onChange={(e) => { setTempEnd(e.target.value); setActivePreset("Custom"); }}
                          className="w-full border border-gray-300 rounded-md p-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 mt-2 pt-3 flex justify-end gap-2">
                      <button 
                        onClick={() => { setTempStart(""); setTempEnd(""); setActivePreset("Custom"); }} 
                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        {translate("Reset")}
                      </button>
                      <button onClick={() => setIsDatePickerOpen(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">{translate("Cancel")}</button>
                      <button onClick={applyDateRange} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors">{translate("Apply")}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block py-2 px-3 cursor-pointer"
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block py-2 px-3 cursor-pointer"
            >
              <option value="">{translate("Select Month")}</option>
              {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                <option key={m} value={m}>{new Date(`2000-${m}-01`).toLocaleString('bn-BD', { month: 'long' })}</option>
              ))}
            </select>

            {(startDate || endDate || selectedMonth) && (
              <button 
                onClick={handleResetAllFilters}
                className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {translate("Reset Filter")}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* ৩. হাইলাইট কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Card 1: Support */}
        <div className="bg-blue-600 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border-none p-6 flex flex-col justify-start">
          <p className="text-blue-100 font-medium text-sm mb-2">{translate("Support Provided in Last 1 Month")}</p>
          <h3 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {loading ? "..." : dashboardData.totalSupportLastMonth}
          </h3>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-semibold border border-white/30 backdrop-blur-sm">
              {translate("Successfully Resolved")}
              <button
                onClick={() => setIsSupportListOpen(true)}
                className="hover:bg-white/30 transition-colors focus:outline-none flex items-center justify-center p-1 rounded-full -mr-1"
                title={translate("View Support List")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </span>
          </div>
        </div>

        {/* Card 2: Active Madrasahs */}
        <div className="bg-emerald-500 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border-none p-6 flex flex-col justify-start">
          <p className="text-emerald-100 font-medium text-sm mb-2">{translate("Total Active Madrasahs")}</p>
          <h3 className="text-4xl lg:text-5xl font-bold text-white">
            {loading ? "..." : dashboardData.allTimeActive}
          </h3>
        </div>

        {/* Card 3: Sold Quota */}
        <div className="bg-purple-500 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border-none p-6 flex flex-col justify-start">
          <p className="text-purple-100 font-medium text-sm mb-2">{translate("Total Sold Quota")}</p>
          <h3 className="text-4xl lg:text-5xl font-bold text-white">
            {loading ? "..." : dashboardData.allTimeQuotaSold}
          </h3>
        </div>

      </div>

      {/* ৪. চার্টস গ্রিড */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{translate("Complaint Categories (Last 1 Month)")}</h2>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">{translate("Loding...")}</div>
            ) : (
              <ReactApexChart options={complaintOptions} series={complaintSeries} type="bar" height="100%" width="100%" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{translate('New Madrasah (Last 1 Month)')}</h2>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">{translate("Loading...")}</div>
            ) : (
              <ReactApexChart options={newMadrasaOptions} series={newMadrasaSeries} type="area" height="100%" width="100%" />
            )}
          </div>
        </div>
      </div>

      {/* পাই চার্টস গ্রিড */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
          <h2 className="text-md font-semibold text-gray-800 mb-2 text-center">{translate("Renewal Status (Last 12 Months)")}</h2>
          <div className="h-48 w-full">
            <ReactApexChart
              options={createPieOptions(renewData, 0)}
              series={renewData.map(i => i.value)}
              type="donut" height="100%" width="100%"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
          <h2 className="text-md font-semibold text-gray-800 mb-2 text-center">{translate("Quota Status (Last 12 Months)")}</h2>
          <div className="h-48 w-full">
            <ReactApexChart
              options={createPieOptions(quotaData, 2)}
              series={quotaData.map(i => i.value)}
              type="donut" height="100%" width="100%"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
          <h2 className="text-md font-semibold text-gray-800 mb-2 text-center">{translate("Madrasah Status (Last 12 Months)")}</h2>
          <div className="h-48 w-full">
            <ReactApexChart
              options={createPieOptions(activeInactiveData, 0)}
              series={activeInactiveData.map(i => i.value)}
              type="donut" height="100%" width="100%"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
          <h2 className="text-md font-semibold text-gray-800 mb-2 text-center">{translate("Login Status (Last 1 Month)")}</h2>
          <div className="h-48 w-full">
            <ReactApexChart
              options={createPieOptions(loginData, 3)}
              series={loginData.map(i => i.value)}
              type="donut" height="100%" width="100%"
            />
          </div>
        </div>
      </div>

      {/* 🌟 সাপোর্ট লিস্ট পপআপ */}
      {isSupportListOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setIsSupportListOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{translate("Support List (Last 1 Month)")}</h3>
              <button onClick={() => setIsSupportListOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ট্যাব বাটন */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveSupportTab("team");
                  setSupportSearchQuery("");
                  handleSupportPageChange(1);
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  activeSupportTab === "team"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {translate("Support Team")}
              </button>
              <button
                onClick={() => {
                  setActiveSupportTab("madrasa");
                  setSupportSearchQuery("");
                  handleSupportPageChange(1);
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  activeSupportTab === "madrasa"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {translate("Madrasah")}
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <input
                  type="text"
                  value={supportSearchQuery}
                  onChange={(e) => setSupportSearchQuery(e.target.value)}
                  placeholder={activeSupportTab === "team" ? translate("Search by Name...") : translate("Search by Madrasah Name...")}
                  className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {supportListLoading ? (
                <div className="text-center text-gray-500 py-8 text-sm">{translate("Loading...")}</div>
              ) : filteredSupportList.length === 0 ? (
                <div className="text-center text-gray-500 py-8 text-sm">{translate("No Data Found")}</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredSupportList.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-md"
                    >
                      <span className="text-sm text-gray-700">
                        {activeSupportTab === "team" ? item.fullName : item.instituteName}
                      </span>
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {item.supportCount} 
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* প্যাজিনেশন */}
            {!supportListLoading && supportPagination[activeSupportTab].totalPages > 1 && (
              <div className="p-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {translate("Total")} {supportPagination[activeSupportTab].total}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={supportPagination[activeSupportTab].page <= 1}
                    onClick={() => handleSupportPageChange(supportPagination[activeSupportTab].page - 1)}
                    className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    {translate("Previous")}
                  </button>
                  <span className="text-sm text-gray-700">
                    {translate("Page")} {supportPagination[activeSupportTab].page} / {supportPagination[activeSupportTab].totalPages}
                  </span>
                  <button
                    disabled={supportPagination[activeSupportTab].page >= supportPagination[activeSupportTab].totalPages}
                    onClick={() => handleSupportPageChange(supportPagination[activeSupportTab].page + 1)}
                    className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    {translate("Next")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔥 হিটম্যাপ — ডাইনামিক */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{translate("Complaint Time Limit (Every 7 Days - 24 Hours)")}</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {heatmapLoading ? (
              <div className="flex items-center justify-center h-64 text-gray-500">{translate("Loading...")}</div>
            ) : (
              <ReactApexChart options={heatmapOptions} series={heatmapSeries} type="heatmap" height={350} width="100%" />
            )}
            <div className="flex justify-end items-center gap-2 mt-4 text-xs text-gray-500">
              <span>{translate("Low Complaints")}</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-orange-50 rounded-sm"></div>
                <div className="w-4 h-4 bg-orange-200 rounded-sm"></div>
                <div className="w-4 h-4 bg-orange-400 rounded-sm"></div>
                <div className="w-4 h-4 bg-orange-600 rounded-sm"></div>
              </div>
              <span>{translate("High Complaints")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
