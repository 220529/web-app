const decimalTo2 = num => {
  let str = "";
  let next = num;
  while (next > 0) {
    str = (next % 2) + str;
    next = Math.floor(next / 2);
  }
  return str;
};

const t = 23;
console.log(t, decimalTo2(t));

const decimalTo10 = num => {
  let res = 0;
  let len = num.length;
  for (let i = 0; i < len; i++) {
    res += Number(num[i]) * Math.pow(2, len - 1 - i);
  }
  return res;
};

const t2 = "11111111";
console.log(t2, decimalTo10(t2));

function binaryToDecimal(str) {
  let result = 0;

  for (let i = 0; i < str.length; i++) {
    const bit = parseInt(str[i], 10);
    console.log("bit", bit);
    result = result * 2 + bit;
  }

  return result;
}

console.log(t2, binaryToDecimal(t2));
