const convertBanglaToEnglishDigit = (str) => {
  return str
    .split("")
    .map((char) => banglaDigitMap[char] ?? char)
    .join("");
};

export const autoConvertMonthName = (value) => {
  const numeric = parseInt(convertBanglaToEnglishDigit(value), 10);
  if (numeric >= 1 && numeric <= 12) {
    return {
      en: englishMonthMap[numeric],
      bn: banglaMonthMap[numeric],
    };
  }
  return null;
};
