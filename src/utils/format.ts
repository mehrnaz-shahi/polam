const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export const hasPersianDigits = (value: string) => /[۰-۹٠-٩]/.test(value);

export const toEnglishDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));

export const parseAmount = (value: string) => {
  const normalized = toEnglishDigits(value).replace(/[٬,\s]/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

export const faNumber=(value:number|string)=>new Intl.NumberFormat('fa-IR').format(Number(value));
export const toman=(rial:number)=>`${faNumber(Math.round(rial/10))} تومان`;
export const rial=(tomanValue:number)=>faNumber(Math.round(tomanValue));
export const persianDate=(iso:string)=>new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'long',year:'numeric'}).format(new Date(iso));
export const shortDate=(iso:string)=>new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'short'}).format(new Date(iso));
export const monthName=(date=new Date())=>new Intl.DateTimeFormat('fa-IR-u-ca-persian',{month:'long'}).format(date);
