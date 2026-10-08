export const toman=(n:number)=>`${new Intl.NumberFormat('fa-IR').format(Math.round(n/10))} تومان`;
export const rial=(n:number)=>new Intl.NumberFormat('fa-IR').format(Math.round(n));
export const persianDate=(iso:string)=>new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'long',year:'numeric'}).format(new Date(iso));
export const shortDate=(iso:string)=>new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'short'}).format(new Date(iso));
