import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  ScrollViewProps,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePalette } from "@/src/theme/colors";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isTablet: width >= 768,
    isLandscape: width > height,
    isWide: width >= 768 || (width > height && width >= 680),
  };
}

export function Content({
  children,
  className = "",
  ...props
}: ViewProps & { children: ReactNode; className?: string }) {
  const { isWide } = useResponsive();
  return (
    <View
      {...props}
      className={`w-full self-center px-5 ${isWide ? "max-w-[1080px] px-8" : ""} ${className}`}
    >
      {children}
    </View>
  );
}

export function Screen({
  children,
  className = "",
  header,
}: {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
}) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-surface">
      <View style={{ flex: 1, direction: "rtl" }}>
        {header ? <Content className="bg-surface pt-4">{header}</Content> : null}
        <View className={`flex-1 ${className}`}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

let nudgeFocusedFieldImpl: (() => void) | null = null;

export function nudgeFocusedField() {
  nudgeFocusedFieldImpl?.();
}

export function ScreenScroll({
  children,
  contentContainerClassName = "",
  keyboard = false,
  ...props
}: ScrollViewProps & {
  children: ReactNode;
  contentContainerClassName?: string;
  keyboard?: boolean;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const keyboardTop = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const revealFocusedField = () => {
    if (keyboardTop.current <= 0) return;
    const input = TextInput.State.currentlyFocusedInput();
    if (!input) return;
    requestAnimationFrame(() => {
      input.measureInWindow((_x, y, _width, height) => {
        const overlap = y + height + 20 - keyboardTop.current;
        if (overlap > 0) {
          scrollRef.current?.scrollTo({
            y: scrollY.current + overlap,
            animated: true,
          });
        }
      });
    });
  };

  useEffect(() => {
    if (!keyboard) return;
    nudgeFocusedFieldImpl = revealFocusedField;
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (event) => {
      keyboardTop.current = event.endCoordinates.screenY;
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardTop.current = 0;
      setKeyboardHeight(0);
    });
    return () => {
      if (nudgeFocusedFieldImpl === revealFocusedField) nudgeFocusedFieldImpl = null;
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboard]);

  useEffect(() => {
    if (keyboardHeight === 0) return;
    const timer = setTimeout(revealFocusedField, 50);
    return () => clearTimeout(timer);
  }, [keyboardHeight]);

  const bottomPad = keyboardHeight > 0 ? keyboardHeight + 24 : 0;
  return (
    <ScrollView
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets={false}
      {...props}
      onScroll={(event) => {
        scrollY.current = event.nativeEvent.contentOffset.y;
        props.onScroll?.(event);
      }}
      scrollEventThrottle={16}
      className={`flex-1 ${props.className ?? ""}`}
      style={[{ flex: 1, direction: "rtl" }, props.style]}
      contentContainerStyle={[
        { direction: "rtl" },
        bottomPad > 0 ? { paddingBottom: bottomPad } : null,
        props.contentContainerStyle,
      ]}
      contentContainerClassName={`${bottomPad > 0 || contentContainerClassName.includes("pb-") ? "" : "pb-12"} ${contentContainerClassName}`}
    >
      {children}
    </ScrollView>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  trailing,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  trailing?: ReactNode;
}) {
  const colors = usePalette();
  return (
    <View className="mb-5 flex-row items-center">
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="بازگشت"
          className="h-11 w-11 items-center justify-center rounded-2xl border border-line bg-panel active:opacity-70"
        >
          <Ionicons name="arrow-forward" size={21} color={colors.textSecondary} />
        </Pressable>
      ) : null}
      <View className={onBack ? "ms-4 flex-1 items-start" : "flex-1 items-start"}>
        <Text className="font-sans-bold text-2xl text-ink text-left pt-1">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 font-sans text-sm text-muted text-left">{subtitle}</Text>
        ) : null}
      </View>
      {trailing ?? (onBack ? <View className="w-11" /> : null)}
    </View>
  );
}
