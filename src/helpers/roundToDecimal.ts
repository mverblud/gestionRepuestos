export const roundToDecimal = (
  number: number,
  decimalPlaces: number
): number => {
  const roundedNumber = Number(number.toFixed(decimalPlaces));
  return roundedNumber;
};
