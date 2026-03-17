export function numberToBanglaWords(num) {
  // ভ্যালিডেশন চেক
  if (typeof num !== 'number' || num < 1 || num > 100000) {
    return "";
  }

  const ones = ["", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়"];
  const tens = ["", "দশ", "বিশ", "তিরিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বই"];
  const teens = ["দশ", "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোল", "সতেরো", "আঠারো", "উনিশ"];
  const hundreds = ["", "একশত", "দুইশত", "তিনশত", "চারশত", "পাঁচশত", "ছয়শত", "সাতশত", "আটশত", "নয়শত"];

  const specialNumbers = {
    11: "এগারো",
    12: "বারো",
    13: "তেরো",
    14: "চৌদ্দ",
    15: "পনেরো",
    16: "ষোল",
    17: "সতেরো",
    18: "আঠারো",
    19: "উনিশ",
    20: "বিশ",
    21: "একুশ",
    22: "বাইশ",
    23: "তেইশ",
    24: "চব্বিশ",
    25: "পঁচিশ",
    26: "ছাব্বিশ",
    27: "সাতাশ",
    28: "আঠাশ",
    29: "ঊনত্রিশ",
    30: "তিরিশ",
    31: "একত্রিশ",
    40: "চল্লিশ",
    41: "একচল্লিশ",
    50: "পঞ্চাশ",
    51: "একান্ন",
    60: "ষাট",
    61: "একষট্টি",
    70: "সত্তর",
    71: "একাত্তর",
    80: "আশি",
    81: "একাশি",
    90: "নব্বই",
    91: "একানব্বই",
    100: "একশ",
    1000: "এক হাজার",
    10000: "দশ হাজার",
    100000: "এক লক্ষ"
  };

  if (specialNumbers[num]) {
    return specialNumbers[num] + " টাকা মাত্র";
  }

  let words = [];

  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    if (lakh > 0) {
      words.push(numberToBanglaWords(lakh).replace(" টাকা মাত্র", "") + " লক্ষ");
      num %= 100000;
    }
  }

  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    if (thousand > 0) {
      words.push(numberToBanglaWords(thousand).replace(" টাকা মাত্র", "") + " হাজার");
      num %= 1000;
    }
  }

  if (num >= 100) {
    const hundred = Math.floor(num / 100);
    if (hundred > 0) {
      words.push(hundreds[hundred]);
      num %= 100;
    }
  }

  if (num > 0) {
    if (num >= 20) {
      const ten = Math.floor(num / 10);
      words.push(tens[ten]);
      num %= 10;
    } else if (num >= 10) {
      words.push(teens[num - 10]);
      num = 0;
    }

    if (num > 0) {
      words.push(ones[num]);
    }
  }

  return words.join(" ") + " টাকা মাত্র";
}
// export function numberToBanglaWords(num) {
//   // ভ্যালিডেশন চেক
//   if (typeof num !== 'number' || num < 1 || num > 100000) {
//     return "";
//   }

//   // বেসিক শব্দসমূহ
//   const ones = ["", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়"];
//   const tens = ["", "দশ", "বিশ", "তিরিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বই"];
//   const teens = ["দশ", "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোল", "সতেরো", "আঠারো", "উনিশ"];
//   const hundreds = ["", "একশত", "দুইশত", "তিনশত", "চারশত", "পাঁচশত", "ছয়শত", "সাতশত", "আটশত", "নয়শত"];

//   // বিশেষ সংখ্যার নাম
//   const specialNumbers = {
//     11: "এগারো",
//     12: "বারো",
//     13: "তেরো",
//     14: "চৌদ্দ",
//     15: "পনেরো",
//     16: "ষোল",
//     17: "সতেরো",
//     18: "আঠারো",
//     19: "উনিশ",
//     20: "বিশ",
//     21: "একুশ",
//     22: "বাইশ",
//     23: "তেইশ",
//     24: "চব্বিশ",
//     25: "পঁচিশ",
//     26: "ছাব্বিশ",
//     27: "সাতাশ",
//     28: "আঠাশ",
//     29: "ঊনত্রিশ",
//     30: "তিরিশ",
//     31: "একত্রিশ",
//     40: "চল্লিশ",
//     41: "একচল্লিশ",
//     50: "পঞ্চাশ",
//     51: "একান্ন",
//     60: "ষাট",
//     61: "একষট্টি",
//     70: "সত্তর",
//     71: "একাত্তর",
//     80: "আশি",
//     81: "একাশি",
//     90: "নব্বই",
//     91: "একানব্বই",
//     100: "একশ",
//     1000: "এক হাজার",
//     10000: "দশ হাজার",
//     100000: "এক লক্ষ"
//   };

//   // যদি সংখ্যাটি বিশেষ সংখ্যার তালিকায় থাকে
//   if (specialNumbers[num]) {
//     return specialNumbers[num];
//   }

//   let words = [];

//   // লক্ষ অংশ
//   if (num >= 100000) {
//     const lakh = Math.floor(num / 100000);
//     if (lakh > 0) {
//       words.push(numberToBanglaWords(lakh) + " লক্ষ");
//       num %= 100000;
//     }
//   }

//   // হাজার অংশ
//   if (num >= 1000) {
//     const thousand = Math.floor(num / 1000);
//     if (thousand > 0) {
//       words.push(numberToBanglaWords(thousand) + " হাজার");
//       num %= 1000;
//     }
//   }

//   // শতক অংশ
//   if (num >= 100) {
//     const hundred = Math.floor(num / 100);
//     if (hundred > 0) {
//       words.push(hundreds[hundred]);
//       num %= 100;
//     }
//   }

//   // দশক ও একক অংশ
//   if (num > 0) {
//     if (num >= 20) {
//       const ten = Math.floor(num / 10);
//       words.push(tens[ten]);
//       num %= 10;
//     }
//     else if (num >= 10) {
//       words.push(teens[num - 10]);
//       num = 0;
//     }

//     if (num > 0) {
//       words.push(ones[num]);
//     }
//   }

//   // শব্দগুলোকে যুক্ত করা
//   return words.join(" ");
// }
