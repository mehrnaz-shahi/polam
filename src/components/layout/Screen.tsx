import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  ScrollViewProps,
  Text,
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
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className={`flex-1 bg-surface ${className}`}
    >
      {children}
    </SafeAreaView>
  );
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
  const body = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...props}
      className={`flex-1 ${props.className ?? ""}`}
      contentContainerClassName={`${contentContainerClassName.includes("pb-") ? "" : "pb-12"} ${contentContainerClassName}`}
    >
      {children}
    </ScrollView>
  );
  return keyboard ? (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
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
      <View className={onBack ? "mr-4 flex-1" : "flex-1"}>
        <Text className="font-sans-bold text-2xl text-ink">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 font-sans text-sm text-muted">{subtitle}</Text>
        ) : null}
      </View>
      {trailing ?? (onBack ? <View className="w-11" /> : null)}
    </View>
  );
}
