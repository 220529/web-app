const arr = [2, 1, 0, 4, 6, 2, 10, 7, 11, 23];

function searchSecond(arr) {
  let m1 = arr[1];
  let m2 = arr[0];
  let tamp = 0;
  if (m2 > m1) {
    tamp = m2;
    m2 = m1;
    m1 = tamp;
  }
  for (let i = 2; i < arr.length; i++) {
    const e = arr[i];
    if (e > m2) {
      if (e > m1) {
        m2 = m1;
        m1 = e;
      } else if (e < m1) {
        m2 = e;
      }
    }
  }
  return m2;
}

const m2 = searchSecond(arr);
console.log("m2", m2);
