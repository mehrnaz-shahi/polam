import { create } from 'zustand';
import { useColorScheme } from 'nativewind';

type Theme='light'|'dark'|'system';
type State={theme:Theme; setTheme:(theme:Theme)=>void};
export const useAppStore=create<State>((set)=>({theme:'system',setTheme:(theme)=>set({theme})}));
