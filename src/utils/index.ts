export const isoToday = () => new Date().toISOString().slice(0, 10);
export const money = (n: number) =>
  new Intl.NumberFormat("fa-IR").format(Math.round(n / 10)) + " تومان";
export const num = (s: string) => Number(s.replace(/[^0-9]/g, ""));
