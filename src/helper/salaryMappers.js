// salaryMappers.js — PaymentsPage ও ReportsPage দুটোই এটা ব্যবহার করে

export const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
export const round2 = (n) => Math.round(toNum(n) * 100) / 100;

export const mapTeacher = (t) => ({
  userId: t.userId ?? t.UserID,
  userCode: t.userCode ?? t.UserCode ?? '',
  name: t.name ?? t.UserName ?? '',
  designation: (t.designation ?? t.Designation ?? '').trim(),
  mobile: t.mobile ?? t.Mobile ?? '',
});

// backend payment → frontend
// details এ year/month (সংখ্যা) রাখা হয়েছে যাতে পুরনো ReceiptView ও কাজ করে,
// সাথে monthName (ডাটাবেসের মাসের নাম) — নতুন কোডে এটাই দেখান।
export const mapPayment = (p) => ({
  paymentId: p.PaymentID ?? p.paymentId,
  receiptNo: p.ReceiptNo ?? p.receiptNo,
  userId: p.UserID ?? p.userId,
  paymentDate: String(p.PaymentDate ?? p.paymentDate ?? '').slice(0, 10),
  method: p.PaymentMethod ?? p.method ?? 'CASH',
  note: p.Note ?? p.note ?? '',
  totalAmount: toNum(p.TotalAmount ?? p.totalAmount),
  inWord: p.InWord ?? p.inWord ?? '',
  isReversed: Boolean(p.IsReversed ?? p.isReversed),
  reverseReason: p.ReverseReason ?? p.reverseReason ?? null,
  details: (p.Details ?? p.details ?? []).map((d) => ({
    yearId: d.YearID ?? d.yearId,
    monthId: d.MonthID ?? d.monthId,
    year: toNum(d.Year?.YearValue ?? d.year),
    month: toNum(d.Month?.MonthValue ?? d.month),
    monthName: d.Month?.MonthName ?? d.monthName ?? '',
    amount: toNum(d.Amount ?? d.amount),
  })),
});

// /month-status বা report এর months রো → frontend
export const mapMonthRow = (r) => {
  const hasSheet = Boolean(r.SheetID);
  const net = toNum(r.NetAmount);
  const paid = toNum(r.PaidAmount);
  return {
    monthId: Number(r.MonthID),
    monthValue: Number(r.MonthValue),
    monthName: r.MonthName,
    hasSheet,
    sheetStatus: r.SheetStatus ?? null,
    net,
    paid,
    due: hasSheet ? Math.max(0, round2(net - paid)) : 0,
    status: r.PaymentStatus ?? (hasSheet ? 'UNPAID' : 'NO_SHEET'),
  };
};

// শুধু বাকি থাকা মাসে ক্রমানুসারে টাকা ভাগ করা
export const distributeToDue = (total, rows) => {
  let remaining = round2(total);
  const allocations = {};
  for (const r of rows) {
    if (remaining <= 0) break;
    if (!r.hasSheet || r.due <= 0) continue;
    const take = Math.min(remaining, r.due);
    allocations[r.monthId] = round2(take);
    remaining = round2(remaining - take);
  }
  return { allocations, unallocated: remaining };
};
