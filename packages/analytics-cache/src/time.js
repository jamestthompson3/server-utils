export function minToMs(min) {
  return min * 60 * 1000;
}

export function minToS(min) {
  return min * 60;
}

export function hoursToMs(hours) {
  return minToMs(hours * 60);
}
