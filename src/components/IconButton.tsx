import { Pressable, Text } from 'react-native';
export function IconButton({icon,onPress}:{icon:string;onPress:()=>void}){return <Pressable onPress={onPress} className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 active:opacity-70 dark:bg-slate-800"><Text className="text-xl">{icon}</Text></Pressable>}
