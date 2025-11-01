// utils/bdMobileValidator.js
export const BD_PREFIXES = ['013', '014', '015', '016', '017', '018', '019'];

export default function validateBDMobile(input) {
  if (!input) return false;
  let s = String(input)
    .trim()
    .replace(/[\s\-()]/g, '');
  if (s.startsWith('+88')) s = s.slice(3);
  if (s.startsWith('88')) s = s.slice(2);
  if (s.length !== 11 || !s.startsWith('01')) return false;
  return BD_PREFIXES.includes(s.slice(0, 3));
}
