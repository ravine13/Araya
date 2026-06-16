export function formatLPA(min: number, max: number) {
  if (min === 0 && max === 0) return "Unpaid / Stipend";
  if (min === max) return `₹${min} LPA`;
  return `₹${min}–${max} LPA`;
}

export function formatExp(min: number, max: number) {
  if (min === max) return `${min} yr`;
  return `${min}–${max} yrs`;
}
