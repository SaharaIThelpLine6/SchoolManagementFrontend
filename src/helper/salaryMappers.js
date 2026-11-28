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

export const mapMonthRow = (r) => {
  const yearValue =
    r.Year?.YearID ??
    r.YearID ??
    r.yearId ??
    r.yearID ??
    null;

  return {
    monthId: Number(r.MonthID ?? r.monthId ?? 0),
    monthName: r.MonthName ?? r.monthName ?? '',
    yearId: Number(yearValue) || 0,       // ✅ কখনো undefined হবে না
    yearValue: Number(r.Year?.YearValue ?? r.YearValue ?? 0),
    hasSheet: !!(r.SheetID ?? r.sheetId),
    sheetId: r.SheetID ?? r.sheetId ?? null,
    status: r.SheetStatus ?? r.status ?? null,
    gross: toNum(r.GrossAmount ?? r.gross),
    deduction: toNum(r.DeductionAmount ?? r.deduction),
    net: toNum(r.NetAmount ?? r.net),
    paid: toNum(r.PaidAmount ?? r.paid),
    due: toNum(r.DueAmount ?? r.due),
    paymentStatus: r.PaymentStatus ?? 'NO_SHEET',
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
