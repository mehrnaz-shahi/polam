import '../global.css';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { useFonts } from 'expo-font';
import { Vazirmatn_400Regular, Vazirmatn_500Medium, Vazirmatn_600SemiBold, Vazirmatn_700Bold } from '@expo-google-fonts/vazirmatn';
import * as SplashScreen from 'expo-splash-screen';
import { getDb } from '@/src/db/database';
import { useColorScheme } from 'nativewind';

SplashScreen.preventAutoHideAsync();
I18nManager.allowRTL(true); I18nManager.forceRTL(true);

export default function RootLayout(){
  const [loaded]=useFonts({Vazirmatn:Vazirmatn_400Regular,VazirmatnMedium:Vazirmatn_500Medium,VazirmatnSemiBold:Vazirmatn_600SemiBold,VazirmatnBold:Vazirmatn_700Bold});
  useEffect(()=>{if(loaded){getDb().then(()=>SplashScreen.hideAsync())}},[loaded]);
  if(!loaded)return null;
  return <Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:'#f7faf8'}}}/>;
}
