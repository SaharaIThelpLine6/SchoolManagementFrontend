export function calcSheetTotals(details) {
  let grossAmount = 0;
  let deductionAmount = 0;

  for (const item of details) {
    const amt = Math.max(0, Number(item.amount) || 0);
    if (item.headType === 'EARNING') {
      grossAmount += amt;
    } else {
      deductionAmount += amt;
    }
  }

  const netAmount = Math.max(0, grossAmount - deductionAmount);
  return { grossAmount, deductionAmount, netAmount };
}

export function calcStructureTotals(structures, heads, userId) {
  const headMap = new Map(heads.map((h) => [h.headId, h]));
  let grossAmount = 0;
  let deductionAmount = 0;

  for (const s of structures) {
    if (s.userId !== userId) continue;
    const head = headMap.get(s.headId);
    if (!head || !head.isActive) continue;
    const amt = Math.max(0, Number(s.amount) || 0);
    if (head.headType === 'EARNING') {
      grossAmount += amt;
    } else {
      deductionAmount += amt;
    }
  }

  const netAmount = Math.max(0, grossAmount - deductionAmount);
  return { grossAmount, deductionAmount, netAmount };
}

/**
 * Sum of payment detail amounts for a teacher and month, ignoring reversed payments.
 */
export function getPaidForMonth(payments, userId, year, month) {
  let total = 0;
  for (const p of payments) {
    if (p.isReversed || p.userId !== userId) continue;
    for (const d of p.details) {
      if (d.year === year && d.month === month) {
        total += Number(d.amount) || 0;
      }
    }
  }
  return total;
}

/**
 * Computes remaining due for a month given net salary and already paid amount.
 */
export function getDueForMonth(net, paid) {
  return Math.max(0, (Number(net) || 0) - (Number(paid) || 0));
}

/**
 * Determines month status badge state.
 */
export function getMonthStatus(hasSheet, net, paid) {
  if (!hasSheet) {
    return paid > 0 ? 'ADVANCE' : 'NO_SHEET';
  }
  if (paid <= 0) return 'UNPAID';
  if (paid < net) return 'PARTIAL';
  return 'PAID';
}

/**
 * Allocates totalAmount across monthRows in chronological order (oldest due first),
 * never exceeding each month's due. Any remainder is returned as unallocated.
 */
export function autoDistribute(totalAmount, monthRows) {
  let remaining = Math.max(0, Math.round(Number(totalAmount) || 0));
  const sorted = [...monthRows].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  );

  const allocations = {};

  for (const row of sorted) {
    const key = `${row.year}-${row.month}`;
    if (!row.hasSheet || row.due <= 0 || remaining <= 0) {
      allocations[key] = 0;
      continue;
    }
    const alloc = Math.min(remaining, row.due);
    allocations[key] = alloc;
    remaining -= alloc;
  }

  return {
    allocations,
    unallocated: remaining,
  };
}

/**
 * Computes overall teacher summary (total due across all existing sheets,
 * total advance paid for months without sheets or overpaid, and last valid payment date).
 */
export function getTeacherPaymentSummary(userId, sheets, payments) {
  const teacherSheets = sheets.filter((s) => s.userId === userId);
  const sheetMap = new Map();
  for (const s of teacherSheets) {
    sheetMap.set(`${s.year}-${s.month}`, s);
  }

  // Gather all (year, month) keys where either a sheet exists or valid payment exists
  const paidByMonth = new Map();
  let lastPaymentDate = null;

  for (const p of payments) {
    if (p.userId !== userId || p.isReversed) continue;
    if (!lastPaymentDate || p.paymentDate > lastPaymentDate) {
      lastPaymentDate = p.paymentDate;
    }
    for (const d of p.details) {
      const key = `${d.year}-${d.month}`;
      paidByMonth.set(key, (paidByMonth.get(key) ?? 0) + (Number(d.amount) || 0));
    }
  }

  let totalDue = 0;
  let totalAdvance = 0;

  for (const sheet of teacherSheets) {
    const key = `${sheet.year}-${sheet.month}`;
    const paid = paidByMonth.get(key) ?? 0;
    if (paid < sheet.netAmount) {
      totalDue += sheet.netAmount - paid;
    } else if (paid > sheet.netAmount) {
      totalAdvance += paid - sheet.netAmount;
    }
  }

  for (const [key, paid] of paidByMonth.entries()) {
    if (!sheetMap.has(key) && paid > 0) {
      totalAdvance += paid;
    }
  }

  return { totalDue, totalAdvance, lastPaymentDate };
}

export function getMonthPayments(payments, userId, year, month) {
  const result = [];
  for (const p of payments) {
    if (p.isReversed || p.userId !== userId) continue;
    let monthAmount = 0;
    for (const d of p.details) {
      if (d.year === year && d.month === month) {
        monthAmount += d.amount;
      }
    }
    if (monthAmount > 0) {
      result.push({ payment: p, monthAmount });
    }
  }
  return result.sort((a, b) => a.payment.paymentDate.localeCompare(b.payment.paymentDate));
}