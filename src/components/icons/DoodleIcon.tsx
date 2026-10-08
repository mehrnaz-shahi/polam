import { Image, ImageStyle, StyleProp } from "react-native";

const icons = {
  card: require("../../../assets/icons/card.png"),
  cash: require("../../../assets/icons/cash.png"),
  bank: require("../../../assets/icons/bank.png"),
  banknote: require("../../../assets/icons/banknote.png"),
  target: require("../../../assets/icons/target.png"),
  coin: require("../../../assets/icons/coin.png"),
  bulb: require("../../../assets/icons/bulb.png"),
  briefcase: require("../../../assets/icons/briefcase.png"),
  handshake: require("../../../assets/icons/handshake.png"),
  wallet: require("../../../assets/icons/wallet.png"),
  trend: require("../../../assets/icons/trend.png"),
  pie: require("../../../assets/icons/pie.png"),
  bars: require("../../../assets/icons/bars.png"),
  purse: require("../../../assets/icons/purse.png"),
  clipboard: require("../../../assets/icons/clipboard.png"),
  scales: require("../../../assets/icons/scales.png"),
  piggy: require("../../../assets/icons/piggy.png"),
  puzzle: require("../../../assets/icons/puzzle.png"),
  calendar: require("../../../assets/icons/calendar.png"),
  bag: require("../../../assets/icons/bag.png"),
} as const;

export type DoodleName = keyof typeof icons;

export function DoodleIcon({
  name,
  size = 40,
  style,
}: {
  name: DoodleName;
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={icons[name]}
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}
