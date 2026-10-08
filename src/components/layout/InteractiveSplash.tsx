import { useEffect, useRef } from "react";
import { Image, Pressable, Text, useWindowDimensions, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePalette } from "@/src/theme/colors";

const ART = require("../../../assets/splash.png");
const CANVAS = { width: 941, height: 1672 };
const CONTENT = { x: 83, y: 389, width: 809, height: 849 };

export function InteractiveSplash({ onDone }: { onDone: () => void }) {
  const colors = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const artWidth = Math.min(width * 0.86, 380);
  const artScale = artWidth / CONTENT.width;
  const floatY = useSharedValue(0);
  const pressed = useSharedValue(1);
  const opacity = useSharedValue(1);
  const leaving = useRef(false);

  useEffect(() => {
    floatY.value = withRepeat(
      withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [floatY]);

  const artStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value * -12 }, { scale: pressed.value }],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const enter = () => {
    if (leaving.current) return;
    leaving.current = true;
    opacity.value = withTiming(0, { duration: 320 }, (finished) => {
      if (finished) runOnJS(onDone)();
    });
  };

  return (
    <Animated.View
      onLayout={() => {
        SplashScreen.hideAsync().catch(() => undefined);
      }}
      style={[
        {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 20,
          backgroundColor: colors.background,
        },
        screenStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="شروع"
        onPress={enter}
        onPressIn={() => {
          pressed.value = withSpring(0.96, { damping: 14, stiffness: 220 });
        }}
        onPressOut={() => {
          pressed.value = withSpring(1, { damping: 12, stiffness: 180 });
        }}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 24,
        }}
      >
        <Animated.View style={artStyle}>
          <View
            style={{
              width: artWidth,
              height: CONTENT.height * artScale,
              overflow: "hidden",
            }}
          >
            <Image
              source={ART}
              accessibilityIgnoresInvertColors
              style={{
                position: "absolute",
                width: CANVAS.width * artScale,
                height: CANVAS.height * artScale,
                left: -CONTENT.x * artScale,
                top: -CONTENT.y * artScale,
              }}
            />
          </View>
        </Animated.View>
        <View className="mt-8 h-14 w-full items-center justify-center rounded-2xl bg-brand-700">
          <Text className="font-sans-bold text-base text-white text-left">شروع</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
