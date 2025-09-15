export const calculateInterest = (
  installments: number,
  value: number,
): number => {
  let totalInterest = 0;

  // Caso para valores <= 70
  if (installments === 1 && value >= 50 && value <= 70) {
    totalInterest = value * (12 / 100);
  } else if (installments === 2 && value >= 50 && value <= 70) {
    totalInterest = value * (24 / 100);
  }

  // Caso para valores entre 71 y 100
  if (installments === 1 && value >= 71 && value <= 100) {
    totalInterest = value * (7.4 / 100);
  } else if (installments === 2 && value >= 71 && value <= 100) {
    totalInterest = value * (14.79 / 100);
  } else if (installments === 3 && value >= 71 && value <= 100) {
    totalInterest = value * (22.19 / 100);
  }

  return totalInterest;
};
