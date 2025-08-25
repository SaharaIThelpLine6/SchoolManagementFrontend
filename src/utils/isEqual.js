export function isEqual(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;

  return arr1.every((obj1, index) => {
    const obj2 = arr2[index];
    if (!obj2) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;

    return keys1.every((key) => obj1[key] === obj2[key]);
  });
}
