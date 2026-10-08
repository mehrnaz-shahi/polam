export const faNumber=(value:number|string)=>new Intl.NumberFormat('fa-IR').format(Number(value));
export const toman=(rial:number)=>`${faNumber(Math.round(rial/10))} تومان`;
export const rial=(tomanValue:number)=>faNumber(Math.round(tomanValue));
export const persianDate=(iso:string)=>new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'long',year:'numeric'}).format(new Date(iso));
export const shortDate=(iso:string)=>new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'short'}).format(new Date(iso));
export const monthName=(date=new Date())=>new Intl.DateTimeFormat('fa-IR-u-ca-persian',{month:'long'}).format(date);
