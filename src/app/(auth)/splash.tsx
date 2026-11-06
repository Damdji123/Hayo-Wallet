import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';

// ─── Pulsing dot component ────────────────────────────────────────────────────
function PulsingDot() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.pulsingDot, { opacity }]} />
  );
}

// ─── Loading dots component ───────────────────────────────────────────────────
function LoadingDots() {
  const dot1 = useRef(new Animated.Value(1)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );

    Animated.parallel([
      animate(dot1, 0),
      animate(dot2, 200),
      animate(dot3, 400),
    ]).start();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.loadingDot, { opacity: dot1 }]} />
      <Animated.View style={[styles.loadingDot, { opacity: dot2 }]} />
      <Animated.View style={[styles.loadingDot, { opacity: dot3 }]} />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Mount animation
  const mountAnim = useRef(new Animated.Value(0)).current;
  const mountTranslate = useRef(new Animated.Value(20)).current;

  // Press feedback
  const pressOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(mountAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 120 }),
      Animated.spring(mountTranslate, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }),
    ]).start();
  }, [mountAnim, mountTranslate]);

  const handlePress = () => {
    Animated.timing(pressOpacity, { toValue: 0.9, duration: 100, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        router.push('/(auth)/language');
      }, 100);
    });
  };

  return (
    <Pressable
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      onPress={handlePress}
      accessibilityLabel="Tap to enter the app"
    >
      {/* ── Ambient blobs ── */}
      <View style={styles.blobTopLeft} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />

      <Animated.View
        style={[
          styles.content,
          { opacity: Animated.multiply(mountAnim, pressOpacity), transform: [{ translateY: mountTranslate }] },
        ]}
      >
        {/* ── Top badge ── */}
        <View style={[styles.badge, Shadows.sm]}>
          <PulsingDot />
          <Text style={styles.badgeText}>Fintech Sync v1.0</Text>
        </View>

        {/* ── Hero section ── */}
        <View style={styles.heroSection}>
          {/* Glow halo */}
          <View style={styles.haloOuter} />
          {/* Rotated tile */}
          <View style={styles.iconTileRotated} />
          {/* Icon card */}
          <View style={[styles.iconCard, Shadows.md]}>
            <Image
              source={require('@/assets/images/Shared-Logo.jpeg')}
              style={{ width: 80, height: 80, borderRadius: Radius.full }}
              resizeMode="contain"
            />
          </View>

          {/* Wordmark */}
          <Text style={styles.wordmark}>
            <Text style={{ color: Colors.ON_SURFACE }}>Shared</Text>
            <Text style={{ color: Colors.PRIMARY }}>Wallet</Text>
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Shared Finance Management</Text>

          {/* Value pill */}
          <View style={styles.valuePill}>
            <Text style={styles.valuePillText}>Simple • Fair • Transparent</Text>
          </View>

          {/* Bilingual description */}
          <View style={styles.descriptionBlock}>
            <Text style={styles.descEn}>Manage shared finances with ease</Text>
            <Text style={styles.descFr}>Gérez vos finances partagées en toute sérénité</Text>
          </View>

          <LoadingDots />
        </View>

        {/* ── Bottom section ── */}
        <View style={styles.bottomSection}>
          <View style={[styles.complianceCard, Shadows.sm]}>
            <View style={styles.complianceLeft}>
              <Text style={styles.shieldIcon}>✓</Text>
              <Text style={styles.complianceText}>Secured &amp; Offline-Ready</Text>
            </View>
            <View style={styles.currencyRow}>
              <View style={[styles.currencyPill, { backgroundColor: Colors.PRIMARY_FIXED }]}>
                <Text style={[styles.currencyText, { color: Colors.PRIMARY }]}>UGX</Text>
              </View>
              <View style={[styles.currencyPill, { backgroundColor: Colors.SURFACE_CONTAINER }]}>
                <Text style={styles.currencyText}>USD</Text>
              </View>
              <View style={[styles.currencyPill, { backgroundColor: Colors.SURFACE_CONTAINER }]}>
                <Text style={styles.currencyText}>EUR</Text>
              </View>
            </View>
          </View>

          <Text style={styles.tapHint}>Tap anywhere to enter</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.SURFACE,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // ── Blobs ──────────────────────────────────────────────────────────────────
  blobTopLeft: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.PRIMARY_FIXED,
    opacity: 0.4,
    top: -128,
    left: -128,
  },
  blobRight: {
    position: 'absolute',
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: Colors.SURFACE_HIGH,
    opacity: 0.5,
    right: -128,
    top: '40%',
  },
  blobBottom: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.PRIMARY_FIXED_DIM,
    opacity: 0.3,
    bottom: -96,
    left: '25%',
  },
  // ── Content ────────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  // ── Badge ─────────────────────────────────────────────────────────────────
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SURFACE_LOWEST,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.SECONDARY,
  },
  badgeText: {
    ...Typography.labelSm,
    color: Colors.ON_SURFACE_VARIANT,
  },
  // ── Hero ───────────────────────────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  haloOuter: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: Colors.PRIMARY,
    opacity: 0.25,
  },
  iconTileRotated: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 24,
    backgroundColor: Colors.PRIMARY_FIXED,
    opacity: 0.6,
    transform: [{ rotate: '6deg' }],
  },
  iconCard: {
    width: 96,
    height: 96,
    borderRadius: Radius.lg,
    backgroundColor: Colors.SURFACE_LOWEST,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wordmark: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.labelLg,
    color: Colors.PRIMARY,
    textAlign: 'center',
  },
  valuePill: {
    backgroundColor: Colors.SURFACE_LOW,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  valuePillText: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
  },
  descriptionBlock: {
    alignItems: 'center',
    gap: 4,
  },
  descEn: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
    textAlign: 'center',
  },
  descFr: {
    ...Typography.bodySm,
    color: Colors.OUTLINE,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.PRIMARY_FIXED,
  },
  // ── Bottom ─────────────────────────────────────────────────────────────────
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
  },
  complianceCard: {
    width: '100%',
    backgroundColor: Colors.SURFACE_LOWEST,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  complianceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  shieldIcon: {
    fontSize: 14,
    color: Colors.SECONDARY,
    fontWeight: '700',
  },
  complianceText: {
    ...Typography.labelSm,
    color: Colors.ON_SURFACE,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  currencyPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  currencyText: {
    ...Typography.labelSm,
    color: Colors.ON_SURFACE,
  },
  tapHint: {
    ...Typography.labelSm,
    color: Colors.OUTLINE,
    textAlign: 'center',
  },
});
