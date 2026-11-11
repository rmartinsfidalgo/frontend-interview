// [todo] make it more dynamic for other locals
export const isoToLocalDateTime = (isoString?: string | null) => {
  if (!isoString) return "-";

  const isoDate = new Date(isoString);
  // `new Date()` doesn't throw on bad input — it returns an Invalid Date (NaN time)
  if (Number.isNaN(isoDate.getTime())) return "-";

  return isoDate.toLocaleString("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
