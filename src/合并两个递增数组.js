// ### 合并两个递增数组

// 给两个递增数组，将他们拼接为一个新的递增数组，要考虑时间复杂度。

const arr1 = [1, 3, 5, 7, 9, 10];
const arr2 = [2, 4, 6, 8];

const concatArray = (arr1, arr2) => {
  const arr = [];
  let l = 0;
  let r = 0;
  while (arr1[l] || arr2[r]) {
    const m = arr1[l];
    const n = arr2[r];

    if (m < n) {
      m && arr.push(m);
      l++;
    } else if (m > n) {
      n && arr.push(n);
      r++;
    } else {
      m && arr.push(m);
      n && arr.push(n);
      l++;
      r++;
    }
  }
  return arr;
};

console.log("concatArray", concatArray(arr1, arr2));

// 得到结果：[1, 2, 3, 4, 5, 6, 7, 8, 9]
