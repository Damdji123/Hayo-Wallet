import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { SupportedLanguage } from '@/constants/translations';

// Pulsing dot
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
  return <Animated.View style={[styles.pulsingDot, { opacity }]} />;
}

// Language card
interface LangCardProps {
  flag: string;
  name: string;
  pill: string;
  pillBg: string;
  sub: string;
  footer: string;
  selected: boolean;
  onSelect: () => void;
  accessLabel: string;
}

function LangCard({ flag, name, pill, pillBg, sub, footer, selected, onSelect, accessLabel }: LangCardProps) {
  const borderAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(borderAnim, { toValue: selected ? 1 : 0, useNativeDriver: false }).start();
  }, [selected, borderAnim]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.SURFACE_LOWEST, Colors.PRIMARY],
  });

  return (
    <Pressable onPress={onSelect} accessibilityLabel={accessLabel}>
      <Animated.View
        style={[
          styles.langCard,
          Shadows.sm,
          { borderColor, borderWidth: 2 },
        ]}
      >
        {/* Row */}
        <View style={styles.langRow}>
          {/* Flag circle */}
          <View style={styles.flagCircle}>
            <Text style={{ fontSize: 22 }}>{flag}</Text>
          </View>

          {/* Labels */}
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Text style={styles.langName}>{name}</Text>
              <View style={[styles.smallPill, { backgroundColor: pillBg }]}>
                <Text style={styles.smallPillText}>{pill}</Text>
              </View>
            </View>
            <Text style={styles.langSub}>{sub}</Text>
          </View>

          {/* Check indicator */}
          <View style={[styles.checkCircle, { backgroundColor: selected ? Colors.PRIMARY : Colors.SURFACE_CONTAINER }]}>
            <Text style={{ color: selected ? Colors.ON_PRIMARY : 'transparent', fontSize: 14, fontWeight: '700' }}>✓</Text>
          </View>
        </View>

        {/* Footer strip */}
        <View style={styles.langFooterStrip}>
          <Text style={styles.langFooterText}>{footer}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

//  Main Screen
export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lang, setLang, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(lang);

  const btnScale = useRef(new Animated.Value(1)).current;

  const handleBtnPressIn = () => {
    Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handleBtnPressOut = () => {
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleSelectLang = (newLang: SupportedLanguage) => {
    setSelectedLang(newLang);
    setLang(newLang);
  };

  const handleContinue = () => {
    setLang(selectedLang);
    router.push({
      pathname: '/(auth)/sign-in',
      params: { lang: selectedLang },
    });
  };

  return (
    <ScrollView
      style={[styles.scroll, { paddingTop: insets.top }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* Language icon badge */}
        <View style={styles.langIconWrap}>
          <View style={styles.langIconCircle}>
            <Text style={{ fontSize: 28 }}>🌐</Text>
          </View>
          <View style={styles.langIconBadge}>
            <Text style={{ fontSize: 14 }}>🔄</Text>
          </View>
        </View>

        {/* GlobalWallet pill */}
        <View style={styles.globalPill}>
          <PulsingDot />
          <Text style={[styles.globalPillText]}>{t.language.globalBadge}</Text>
        </View>

        <Text style={styles.headerTitle}>{t.language.title}</Text>
        <Text style={styles.headerTitleFr}>{t.language.titleFr}</Text>
        <Text style={styles.headerSub}>{t.language.subtitle}</Text>
        <Text style={styles.headerSubFr}>{t.language.subtitleFr}</Text>
      </View>

      {/* Language cards */}
      <View style={{ gap: Spacing.md, marginTop: Spacing.xl }}>
        <LangCard
          flag="🇬🇧"
          name={t.language.enName}
          pill={t.language.enPill}
          pillBg={Colors.PRIMARY_FIXED}
          sub={t.language.enSub}
          footer={t.language.enFooter}
          selected={selectedLang === 'en'}
          onSelect={() => handleSelectLang('en')}
          accessLabel="Select English"
        />
        <LangCard
          flag="🇫🇷"
          name={t.language.frName}
          pill={t.language.frPill}
          pillBg={selectedLang === 'fr' ? Colors.PRIMARY_FIXED : Colors.SURFACE_CONTAINER}
          sub={t.language.frSub}
          footer={t.language.frFooter}
          selected={selectedLang === 'fr'}
          onSelect={() => handleSelectLang('fr')}
          accessLabel="Select French"
        />
      </View>

      {/*  Device auto-detect banner */}
      <View style={[styles.detectBanner, Shadows.sm]}>
        <View style={styles.detectIconWrap}>
          <Text style={{ fontSize: 16 }}>📱</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.detectLabel}>{t.language.deviceDetected}</Text>
          <Text style={styles.detectValue}>{t.language.deviceValue}</Text>
        </View>
        <Pressable accessibilityLabel="Auto-detect language">
          <Text style={{ fontSize: 18, color: Colors.PRIMARY }}>✨</Text>
        </Pressable>
      </View>

      {/*  Feature chips  */}
      <View style={styles.chipsGrid}>
        <View style={[styles.chip, Shadows.sm]}>
          <Text style={styles.chipIcon}>☁️</Text>
          <View>
            <Text style={[styles.chipTitle, { color: Colors.SECONDARY }]}>{t.language.offlineReady}</Text>
            <Text style={styles.chipSub}>{t.language.offlineSub}</Text>
          </View>
        </View>
        <View style={[styles.chip, Shadows.sm]}>
          <Text style={styles.chipIcon}>🧮</Text>
          <View>
            <Text style={[styles.chipTitle, { color: Colors.PRIMARY }]}>{t.language.multiCurrency}</Text>
            <Text style={styles.chipSub}>{t.language.multiCurrencySub}</Text>
          </View>
        </View>
      </View>

      {/* ── CTA button ── */}
      <View style={{ marginTop: Spacing.xl, alignItems: 'center' }}>
        <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%' }}>
          <Pressable
            style={styles.ctaButton}
            onPressIn={handleBtnPressIn}
            onPressOut={handleBtnPressOut}
            onPress={handleContinue}
            accessibilityLabel={t.language.continueBtn}
          >
            <Text style={styles.ctaButtonText}>
              {t.language.continueBtn}
            </Text>
            <Text style={{ color: Colors.ON_PRIMARY, fontSize: 18 }}> →</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.offlineFooter}>
          {t.language.offlineFooter}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.SURFACE,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  // Header
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  langIconWrap: {
    width: 64,
    height: 64,
  },
  langIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.PRIMARY_FIXED,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  langIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.SECONDARY_CONTAINER,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  globalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.SURFACE_CONTAINER,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.xs,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.SECONDARY,
  },
  globalPillText: {
    ...Typography.labelSm,
    color: Colors.ON_SURFACE_VARIANT,
    letterSpacing: 1.2,
  },
  headerTitle: {
    ...Typography.headlineLg,
    color: Colors.ON_SURFACE,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  headerTitleFr: {
    ...Typography.headlineSm,
    color: Colors.PRIMARY,
    fontWeight: '500',
    textAlign: 'center',
  },
  headerSub: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
    textAlign: 'center',
  },
  headerSubFr: {
    fontSize: 11,
    color: Colors.ON_SURFACE_VARIANT,
    textAlign: 'center',
    opacity: 0.8,
  },
  // Language card
  langCard: {
    backgroundColor: Colors.SURFACE_LOWEST,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  flagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.SURFACE_HIGH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langName: {
    ...Typography.headlineSm,
    color: Colors.ON_SURFACE,
    fontWeight: '600',
  },
  smallPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  smallPillText: {
    ...Typography.labelSm,
    color: Colors.ON_SURFACE,
  },
  langSub: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langFooterStrip: {
    backgroundColor: Colors.SURFACE_LOW,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
  },
  langFooterText: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
    lineHeight: 18,
  },
  // Detect banner
  detectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SURFACE_LOW,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  detectIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.PRIMARY_FIXED,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  detectLabel: {
    ...Typography.labelSm,
    color: Colors.ON_SURFACE_VARIANT,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  detectValue: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE,
    fontWeight: '500',
  },
  // Feature chips
  chipsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
    marginTop: Spacing.md,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SURFACE_LOWEST,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  chipIcon: {
    fontSize: 20,
  },
  chipTitle: {
    ...Typography.labelMd,
  },
  chipSub: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
  },
  // CTA button
  ctaButton: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaButtonText: {
    ...Typography.labelLg,
    color: Colors.ON_PRIMARY,
  },
  offlineFooter: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
