const { withAndroidManifest } = require("expo/config-plugins");

const PERMISSIONS = ["android.permission.READ_SMS", "android.permission.RECEIVE_SMS"];

module.exports = function withPolamSms(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const current = manifest["uses-permission"] ?? [];
    for (const name of PERMISSIONS) {
      const exists = current.some((item) => item.$?.["android:name"] === name);
      if (!exists) current.push({ $: { "android:name": name } });
    }
    manifest["uses-permission"] = current;
    return config;
  });
};
