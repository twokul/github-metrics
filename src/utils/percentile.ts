function validateNumbers(arr: number[]) {
  for (let number of arr) {
    if (!Number.isFinite(number)) {
      throw new Error(`Unexpected non-numeric value: ${number}`);
    }
  }
}

function validateNumbersInRange(arr: number[], min: number, max: number) {
  for (let number of arr) {
    if (number < min) {
      throw new Error(`Unexpected number ${number} < ${min}`);
    }
    if (number > max) {
      throw new Error(`Unexpected number ${number} > ${max}`);
    }
  }
}

function validatePercentiles(arr: number[]) {
  validateNumbers(arr);
  validateNumbersInRange(arr, 0, 100);
}

function validateData(arr: number[]) {
  validateNumbers(arr);
}

function getPercentileValue(p: number, sortedData: number[]) {
  if (p === 0) {
    return sortedData[0];
  }
  let kIndex = Math.ceil(sortedData.length * (p / 100)) - 1;
  return sortedData[kIndex];
}

export default function percentiles(
  ps: number[],
  unsortedData: number[]
): number[] {
  validateData(unsortedData);
  validatePercentiles(ps);
  let sortedData = unsortedData.slice().sort();
  return ps.map((p) => getPercentileValue(p, sortedData));
}
