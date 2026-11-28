// হাজিরা রিপোর্ট → Excel (.xlsx)
// প্রিভিউর মতোই: প্রতিষ্ঠানের নাম, শিরোনাম, সারসংক্ষেপ, টেবিল (ভাগের শিরোনামসহ) ও সংকেত।
// সংখ্যা Excel এ সংখ্যা হিসেবেই যায়, যাতে যোগফল / সর্ট করা যায়।
import { STATUS_META, excelValue, legendText, statText } from './reportEngine';

export async function exportExcel({ report, meta, settings, institution, fileName }) {
  const XLSX = await import('xlsx');
  const { columns, rows } = report;
  const width = Math.max(columns.length, 1);
  const excelSettings = { ...settings, digits: 'en' };
  const aoa = [];
  const merges = [];
  const line = (text) => {
    aoa.push([text]);
    if (width > 1) merges.push({ s: { r: aoa.length - 1, c: 0 }, e: { r: aoa.length - 1, c: width - 1 } });
  };

  if (settings.showHeader) {
    if (institution.name) line(institution.name);
    if (institution.address) line(institution.address);
  }
  line(meta.title);
  if (meta.subtitle) line(meta.subtitle);
  if (meta.info) line(meta.info.map(([label, value]) => `${label}: ${value}`).join('   |   '));
  if (settings.showStats && meta.stats.length) {
    line(meta.stats.map((s) => `${s.label}: ${statText(s, excelSettings)}`).join('   |   '));
  }
  aoa.push([]);

  aoa.push(
    columns.map((c) => (c.dayCol ? `${c.label} ${c.sub}` : c.iconOnly ? `${STATUS_META[c.status].symbol} ${c.label}` : c.label))
  );
  for (const row of rows) {
    if (row.kind === 'group') line(`${row.label} (${row.count})`);
    else aoa.push(columns.map((c) => excelValue(c, row[c.key], excelSettings)));
  }
  if (!rows.length) line(report.notice || 'এই ফিল্টারে দেখানোর মতো কোনো তথ্য নেই।');

  if (meta.legend) {
    aoa.push([]);
    line(`সংকেত:   ${legendText(meta.legend)}`);
  }
  if (settings.showGeneratedAt && meta.generatedAt) line(meta.generatedAt);

  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  sheet['!merges'] = merges;
  sheet['!cols'] = columns.map((c) => ({ wch: c.dayCol ? 5 : Math.max(6, Math.round(c.w * 8)) }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Attendance Report');
  XLSX.writeFile(book, fileName);
}
