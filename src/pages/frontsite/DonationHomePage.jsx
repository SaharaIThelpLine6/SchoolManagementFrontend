import React, { useState, useEffect } from "react";
import "../../DonationDashboard.css";

export default function DonationHomePage() {
  const [activePage, setActivePage] = useState("home");
  const [balance, setBalance] = useState(0);
  const [taken, setTaken] = useState(0);
  const [myContrib, setMyContrib] = useState(0);
  const [paidCount, setPaidCount] = useState("0/12");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [paidStatus, setPaidStatus] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawNumber, setWithdrawNumber] = useState("");

  const members = [
    { name: "Rafiq (You)", loc: "Dhaka", paid: true, av: "রা", clr: "#9FE1CB", tc: "#085041" },
    { name: "Karim", loc: "Chittagong", paid: true, av: "কা", clr: "#FAC775", tc: "#633806" },
    { name: "Nasrin", loc: "Dhaka", paid: true, av: "না", clr: "#F4C0D1", tc: "#72243E" },
    { name: "Hasan", loc: "Sylhet", paid: true, av: "হা", clr: "#B5D4F4", tc: "#0C447C" },
    { name: "Rina", loc: "Rajshahi", paid: true, av: "রি", clr: "#C0DD97", tc: "#27500A" },
    { name: "Arif", loc: "Khulna", paid: true, av: "আ", clr: "#9FE1CB", tc: "#085041" },
    { name: "Mitu", loc: "Dhaka", paid: true, av: "মি", clr: "#FAC775", tc: "#633806" },
    { name: "Sumon", loc: "Barishal", paid: true, av: "সু", clr: "#B5D4F4", tc: "#0C447C" },
    { name: "Tania", loc: "Mymensingh", paid: true, av: "তা", clr: "#F4C0D1", tc: "#72243E" },
    { name: "Raju", loc: "Cumilla", paid: false, av: "রা", clr: "#D3D1C7", tc: "#444441" },
    { name: "Shakil", loc: "Dhaka", paid: false, av: "শা", clr: "#D3D1C7", tc: "#444441" },
    { name: "Priya", loc: "Narayanganj", paid: false, av: "প্র", clr: "#D3D1C7", tc: "#444441" },
  ];

  const txs = [
    { icon: "💚", name: "You contributed", detail: "May 2025", amt: "+৳2,000", clr: "#085041", bg: "#E1F5EE" },
    { icon: "💚", name: "You contributed", detail: "April 2025", amt: "+৳2,000", clr: "#085041", bg: "#E1F5EE" },
    { icon: "🔴", name: "Karim withdrawal", detail: "March 2025 · Medical", amt: "−৳15,000", clr: "#A32D2D", bg: "#FCEBEB" },
    { icon: "💚", name: "You contributed", detail: "March 2025", amt: "+৳2,000", clr: "#085041", bg: "#E1F5EE" },
    { icon: "💚", name: "You contributed", detail: "Feb 2025", amt: "+৳2,000", clr: "#085041", bg: "#E1F5EE" },
    { icon: "🔴", name: "Nasrin withdrawal", detail: "Jan 2025 · House repair", amt: "−৳10,000", clr: "#A32D2D", bg: "#FCEBEB" },
    { icon: "💚", name: "You contributed", detail: "Jan 2025", amt: "+৳2,000", clr: "#085041", bg: "#E1F5EE" },
  ];

  useEffect(() => {
    const countUp = (setter, target, prefix = "৳") => {
      let cur = 0;
      const steps = 50;
      const inc = target / steps;
      const interval = setInterval(() => {
        cur = Math.min(cur + inc, target);
        setter(prefix + Math.round(cur).toLocaleString("en-IN"));
        if (cur >= target) clearInterval(interval);
      }, 20);
    };

    setTimeout(() => {
      countUp(setBalance, 112000);
      countUp(setTaken, 25000);
      countUp(setMyContrib, 18000);
      setPaidCount("9/12");
    }, 300);
  }, []);

  const showPage = (page) => {
    setActivePage(page);
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2800);
  };

  const markPaid = () => {
    setPaidStatus(true);
    showToast("✅ ধন্যবাদ! Your ৳2,000 payment recorded.");
  };

  const submitRequest = () => {
    const amt = parseInt(withdrawAmount);
    if (!amt || amt < 100) {
      showToast("⚠️ Please enter a valid amount");
      return;
    }
    if (amt > 18000) {
      showToast("⚠️ Exceeds your limit of ৳18,000");
      return;
    }
    showToast("📨 Request sent! Admin will review shortly.");
    setWithdrawAmount("");
    setWithdrawReason("");
    setWithdrawNumber("");
  };

  return (
    <div className="app">
      <div className="nav">
        <button
          className={`nav-btn ${activePage === "home" ? "active" : ""}`}
          onClick={() => showPage("home")}
        >
          Home
        </button>
        <button
          className={`nav-btn ${activePage === "members" ? "active" : ""}`}
          onClick={() => showPage("members")}
        >
          Members
        </button>
        <button
          className={`nav-btn ${activePage === "withdraw" ? "active" : ""}`}
          onClick={() => showPage("withdraw")}
        >
          Withdraw
        </button>
        <button
          className={`nav-btn ${activePage === "history" ? "active" : ""}`}
          onClick={() => showPage("history")}
        >
          History
        </button>
      </div>

      {/* HOME PAGE */}
      <div className={`page ${activePage === "home" ? "active" : ""}`} id="page-home">
        <div className="hero">
          <div className="hero-top">
            <h2>
              বন্ধু তহবিল<small>Friends Mutual Fund · 12 Members</small>
            </h2>
            <div className="badge-you">👤 You: Rafiq</div>
          </div>
          <div className="hero-nums">
            <div className="hn">
              <div className="hn-val">{balance}</div>
              <div className="hn-lbl">Total Balance</div>
            </div>
            <div className="hn">
              <div className="hn-val">{paidCount}</div>
              <div className="hn-lbl">Paid This Month</div>
            </div>
            <div className="hn">
              <div className="hn-val">{taken}</div>
              <div className="hn-lbl">Total Withdrawn</div>
            </div>
          </div>
        </div>

        <div className="sgrid">
          <div className="scard">
            <div className="scard-top">
              <div className="scard-icon" style={{ background: "#E1F5EE" }}>
                💰
              </div>
              <div className="scard-lbl">Monthly Pool</div>
            </div>
            <div className="scard-val" style={{ color: "#085041" }}>
              ৳24,000
            </div>
            <div className="scard-sub" style={{ color: "#1D9E75" }}>
              12 × ৳2,000
            </div>
          </div>
          <div className="scard">
            <div className="scard-top">
              <div className="scard-icon" style={{ background: "#FAEEDA" }}>
                📅
              </div>
              <div className="scard-lbl">Your Status</div>
            </div>
            <div className="scard-val" style={{ color: "#BA7517" }}>
              Due
            </div>
            <div className="scard-sub" style={{ color: "#BA7517" }}>
              This month: ৳2,000
            </div>
          </div>
          <div className="scard">
            <div className="scard-top">
              <div className="scard-icon" style={{ background: "#E6F1FB" }}>
                📈
              </div>
              <div className="scard-lbl">You Contributed</div>
            </div>
            <div className="scard-val" style={{ color: "#185FA5" }}>
              {myContrib}
            </div>
            <div className="scard-sub" style={{ color: "#185FA5" }}>
              Over 9 months
            </div>
          </div>
          <div className="scard">
            <div className="scard-top">
              <div className="scard-icon" style={{ background: "#FCEBEB" }}>
                🤝
              </div>
              <div className="scard-lbl">Your Withdrawals</div>
            </div>
            <div className="scard-val" style={{ color: "#A32D2D" }}>
              ৳0
            </div>
            <div className="scard-sub" style={{ color: "#A32D2D" }}>
              Never withdrawn
            </div>
          </div>
        </div>

        <div className="my-status">
          <div className="sec-title">Your Account Summary</div>
          <div className="status-row">
            <span className="sl">Fixed monthly amount</span>
            <span className="sv">৳2,000</span>
          </div>
          <div className="status-row">
            <span className="sl">Months contributed</span>
            <span className="sv">9 months</span>
          </div>
          <div className="status-row">
            <span className="sl">This month (June)</span>
            <span className="pill pill-amber">⏳ Pending</span>
          </div>
          <div className="status-row">
            <span className="sl">Next due date</span>
            <span className="sv">30 June 2025</span>
          </div>
          <div className="status-row">
            <span className="sl">Can withdraw up to</span>
            <span className="sv" style={{ color: "#085041" }}>
              ৳18,000
            </span>
          </div>
        </div>

        <div className="contribute-wrap">
          <div className="contrib-label">Your fixed contribution this month</div>
          <div className="contrib-amount">৳2,000</div>
          <div className="ring-wrap">
            <div className="ring r1"></div>
            <div className="ring r2"></div>
            <div className="ring r3"></div>
            <button
              className="btn-contribute"
              onClick={markPaid}
              disabled={paidStatus}
            >
              {paidStatus ? "🎉 Marked as Paid!" : "✅ আমি দিয়েছি — Mark as Paid"}
            </button>
          </div>
          <div className="contrib-note">
            Tap after you transfer ৳2,000 to the group account · bKash / Nagad / Bank
          </div>
        </div>
      </div>

      {/* MEMBERS PAGE */}
      <div className={`page ${activePage === "members" ? "active" : ""}`} id="page-members">
        <div className="members-card">
          <div className="sec-title">All Members — June 2025</div>
          <div>
            {members.map((m, i) => (
              <div key={i} className="member-row">
                <div className="av" style={{ background: m.clr, color: m.tc }}>
                  {m.av}
                </div>
                <div className="minfo">
                  <div className="mname">{m.name}</div>
                  <div className="msub">{m.loc}</div>
                </div>
                <span className={`pill ${m.paid ? "pill-green" : "pill-red"}`}>
                  {m.paid ? "✅ Paid" : "⏳ Pending"}
                </span>
                <div
                  className="mpaid"
                  style={{ color: m.paid ? "#085041" : "#A32D2D", marginLeft: "8px" }}
                >
                  {m.paid ? "৳2,000" : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="sgrid">
          <div className="scard">
            <div className="scard-top">
              <div className="scard-icon" style={{ background: "#E1F5EE" }}>
                ✅
              </div>
              <div className="scard-lbl">Paid</div>
            </div>
            <div className="scard-val" style={{ color: "#085041" }}>
              9 / 12
            </div>
            <div className="scard-sub" style={{ color: "#1D9E75" }}>
              ৳18,000 collected
            </div>
          </div>
          <div className="scard">
            <div className="scard-top">
              <div className="scard-icon" style={{ background: "#FCEBEB" }}>
                ⏳
              </div>
              <div className="scard-lbl">Pending</div>
            </div>
            <div className="scard-val" style={{ color: "#A32D2D" }}>
              3 / 12
            </div>
            <div className="scard-sub" style={{ color: "#A32D2D" }}>
              ৳6,000 remaining
            </div>
          </div>
        </div>
      </div>

      {/* WITHDRAW PAGE */}
      <div className={`page ${activePage === "withdraw" ? "active" : ""}`} id="page-withdraw">
        <div className="withdraw-card">
          <div className="sec-title">Request a Withdrawal</div>
          <div className="wd-info">
            Current fund balance: <strong>৳1,12,000</strong>
            <br />
            You can request up to <strong>৳18,000</strong> (your total contribution).
            <br />
            Requests need approval from the group admin.
          </div>
          <div className="field">
            <label>Amount (৳)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Reason for withdrawal</label>
            <textarea
              placeholder="e.g. Medical emergency, house repair..."
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
            ></textarea>
          </div>
          <div className="field">
            <label>Your bKash / Nagad number</label>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={withdrawNumber}
              onChange={(e) => setWithdrawNumber(e.target.value)}
            />
          </div>
          <button className="btn-request" onClick={submitRequest}>
            📨 Submit Request
          </button>
        </div>
        <div className="history-card">
          <div className="sec-title">Past Withdrawal Requests</div>
          <div className="tx-row">
            <div className="tx-icon" style={{ background: "#E1F5EE" }}>
              ✅
            </div>
            <div>
              <div className="tx-name">Karim — Medical</div>
              <div className="tx-date">March 2025 · Approved</div>
            </div>
            <div className="tx-amt" style={{ color: "#085041" }}>
              −৳15,000
            </div>
          </div>
          <div className="tx-row">
            <div className="tx-icon" style={{ background: "#E1F5EE" }}>
              ✅
            </div>
            <div>
              <div className="tx-name">Nasrin — House repair</div>
              <div className="tx-date">Jan 2025 · Approved</div>
            </div>
            <div className="tx-amt" style={{ color: "#085041" }}>
              −৳10,000
            </div>
          </div>
        </div>
      </div>

      {/* HISTORY PAGE */}
      <div className={`page ${activePage === "history" ? "active" : ""}`} id="page-history">
        <div className="history-card">
          <div className="sec-title">Transaction History</div>
          {txs.map((t, i) => (
            <div key={i} className="tx-row">
              <div className="tx-icon" style={{ background: t.bg }}>
                {t.icon}
              </div>
              <div>
                <div className="tx-name">{t.name}</div>
                <div className="tx-date">{t.detail}</div>
              </div>
              <div className="tx-amt" style={{ color: t.clr }}>
                {t.amt}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`toast ${toast.show ? "show" : ""}`}>{toast.message}</div>
    </div>
  );
}