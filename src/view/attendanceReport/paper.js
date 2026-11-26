// কাগজের মাপ (মিমি) → স্ক্রিনের px (৯৬ dpi)
export const MM = 96 / 25.4;
export const MARGIN = Math.round(10 * MM);
export const PAPERS = {
  a4: { label: 'A4', w: 210, h: 297 },
  letter: { label: 'Letter', w: 215.9, h: 279.4 },
  legal: { label: 'Legal', w: 215.9, h: 355.6 },
};
export const pageSizeOf = (settings) => {
  const p = PAPERS[settings.paper] || PAPERS.a4;
  const [wMm, hMm] = settings.orientation === 'landscape' ? [p.h, p.w] : [p.w, p.h];
  return { wMm, hMm, w: Math.round(wMm * MM), h: Math.round(hMm * MM) };
};
