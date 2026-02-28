import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fafimba.stellarswarm',
  appName: 'Space Survivor',
  webDir: 'www',
  server: {
    allowNavigation: [],
    // Use https scheme (default) — required for modern WebView features
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: true,
    overrideUserAgent: 'StellarSwarm/1.0',
    // WebView rendering optimizations
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
  },
};

export default config;
