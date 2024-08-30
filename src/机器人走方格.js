const arr = [];
const m = 5;
const n = 5;

for (let y = 0; y < m; y++) {
  const tamp = new Array(m).fill(0);
  tamp[0] = y;
  arr.push(tamp);
}

for (let x = 1; x < n; x++) {
  arr[0][x] = x;
}

for (let y = 1; y < m; y++) {
  for (let x = 1; x < n; x++) {
    arr[y][x] = arr[y][x - 1] + arr[y - 1][x];
  }
}

console.log("arr", arr);
