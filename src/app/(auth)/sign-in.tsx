import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSignIn, useSSO } from '@clerk/expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { SupportedLanguage } from '@/constants/translations';
import { RateLimiter } from '@/utils/rate-limiter';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, anim, translateY]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { opacity: anim, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      <Text style={{ fontSize: 16, color: Colors.ON_SECONDARY_CONTAINER }}>✓</Text>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

// ─── Divider with label ───────────────────────────────────────────────────────
function OrDivider({ label }: { label: string }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lang?: string }>();
  const { lang, setLang, t } = useLanguage();

  // Clerk hooks
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Sync route param with context if provided
  useEffect(() => {
    if (params.lang === 'en' || params.lang === 'fr') {
      setLang(params.lang as SupportedLanguage);
    }
  }, [params.lang, setLang]);

  // Sign in button press scale
  const signInScale = useRef(new Animated.Value(1)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  const handleSignIn = async () => {
    if (isLoading) return;

    if (!email.trim() || !password) {
      showToast(t.signIn.invalidCredentials);
      return;
    }

    // Rate Limiting check (anti-brute-force defense)
    const rateCheck = RateLimiter.check('signin_email');
    if (!rateCheck.allowed) {
      if (rateCheck.waitSeconds > 1) {
        showToast(t.signIn.rateLimitLocked.replace('{seconds}', String(rateCheck.waitSeconds)));
      } else {
        showToast(t.signIn.rateLimitWarning);
      }
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn.password({
        emailAddress: email.trim(),
        password,
      });

      if (error) {
        RateLimiter.record('signin_email', false);
        const remaining = RateLimiter.getRemainingLockout('signin_email');
        if (remaining > 0) {
          showToast(t.signIn.rateLimitLocked.replace('{seconds}', String(remaining)));
        } else {
          const msg = (error as any).errors?.[0]?.message || error.message || t.signIn.invalidCredentials;
          showToast(msg);
        }
        setIsLoading(false);
        return;
      }

      RateLimiter.record('signin_email', true);

      if (signIn.status === 'complete') {
        showToast(t.signIn.toastSuccess);
        await signIn.finalize({
          navigate: () => {
            router.replace('/explore');
          },
        });
      }
    } catch (err: any) {
      RateLimiter.record('signin_email', false);
      const msg = err?.errors?.[0]?.message || err?.message || t.signIn.invalidCredentials;
      showToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSO = async (strategy: 'oauth_google' | 'oauth_facebook') => {
    if (isLoading) return;

    // Rate check to throttle fast repeated popup triggers
    const rateCheck = RateLimiter.check(`sso_${strategy}`);
    if (!rateCheck.allowed) {
      showToast(t.signIn.rateLimitWarning);
      return;
    }

    let timedOut = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const redirectUrl = AuthSession.makeRedirectUri({ path: 'sso-callback' });

    try {
      setIsLoading(true);
      const flow = (async () => {
        const {
          createdSessionId,
          setActive,
          signUp: ssoSignUp,
          authSessionResult,
        } = await startSSOFlow({ strategy, redirectUrl });

        if (timedOut) return;

        if (createdSessionId && setActive) {
          RateLimiter.record(`sso_${strategy}`, true);
          await setActive({ session: createdSessionId });
          if (timedOut) return;
          showToast(t.signIn.toastSuccess);
          router.replace('/explore');
          return;
        }

        if (ssoSignUp?.status === 'missing_requirements') {
          const missingFields = ssoSignUp.missingFields?.join(', ');
          showToast(missingFields
            ? `${t.signIn.toastSSOIncomplete}: ${missingFields}`
            : t.signIn.toastSSOIncomplete);
          return;
        }

        // A successful browser return without a session usually means Clerk
        // needs another sign-in/sign-up step; only report cancellation for a
        // browser session the user actually dismissed.
        if (authSessionResult?.type === 'cancel' || authSessionResult?.type === 'dismiss') {
          showToast(t.signIn.toastSSOCancelled);
        } else {
          showToast(t.signIn.toastSSOIncomplete);
        }
      })();

      const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          timedOut = true;
          reject(new Error(`${t.signIn.toastSSOTimeout} (${redirectUrl})`));
        }, 90_000);
      });

      await Promise.race([flow, timeout]);
    } catch (err: any) {
      RateLimiter.record(`sso_${strategy}`, false);
      if (timedOut && Platform.OS !== 'android') {
        WebBrowser.dismissAuthSession();
      }
      const msg = err?.errors?.[0]?.message || err?.message || t.signIn.toastSSOError;
      showToast(msg);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleBiometric = () => {
    showToast(t.signIn.toastBiometric);
  };

  const handleForgotPassword = () => {
    showToast(t.signIn.toastForgot);
  };

  // Loading spinner rotation
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(loadingAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ).start();
    } else {
      loadingAnim.setValue(0);
    }
  }, [isLoading, loadingAnim]);

  const spinInterpolate = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isSubmitting = isLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Sticky-style header bar ── */}
          <View style={styles.headerBar}>
            {/* Back button */}
            <Pressable
              style={styles.backBtn}
              onPress={() => router.back()}
              accessibilityLabel={t.signIn.backAria}
            >
              <Text style={{ fontSize: 18, color: Colors.ON_SURFACE }}>←</Text>
            </Pressable>

            {/* Logo and Brand */}
            <View style={styles.headerBrandRow}>
              <Image
                source={require('@/assets/images/Shared-Logo.jpeg')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>{t.signIn.brand}</Text>
            </View>

            {/* Right controls */}
            <View style={styles.headerRight}>
              {/* EN/FR toggle */}
              <View style={styles.langToggle}>
                <Pressable
                  style={[styles.langTab, lang === 'en' && styles.langTabActive]}
                  onPress={() => setLang('en')}
                  accessibilityLabel="Switch to English"
                >
                  <Text style={[styles.langTabText, lang === 'en' && styles.langTabTextActive]}>EN</Text>
                </Pressable>
                <Pressable
                  style={[styles.langTab, lang === 'fr' && styles.langTabActive]}
                  onPress={() => setLang('fr')}
                  accessibilityLabel="Passer au français"
                >
                  <Text style={[styles.langTabText, lang === 'fr' && styles.langTabTextActive]}>FR</Text>
                </Pressable>
              </View>
              {/* Avatar */}
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 16 }}>👤</Text>
              </View>
            </View>
          </View>

          {/* ── Welcome hero card ── */}
          <View style={[styles.heroCard, Shadows.sm]}>
            {/* Ambient blob */}
            <View style={styles.heroBlobAmbient} />

            <View style={styles.heroContent}>
              <View style={{ flex: 1, gap: Spacing.sm }}>
                {/* Encrypted pill */}
                <View style={styles.encryptedPill}>
                  <Text style={{ fontSize: 10 }}>🔒</Text>
                  <Text style={styles.encryptedText}>{t.signIn.encryptedSession}</Text>
                </View>
                <Text style={styles.heroTitle}>{t.signIn.welcomeBack}</Text>
                <Text style={styles.heroSub}>{t.signIn.subtitle}</Text>
              </View>

              {/* Wallet / App Logo tile */}
              <View style={[styles.walletTile, Shadows.sm]}>
                <Image
                  source={require('@/assets/images/Shared-Logo.jpeg')}
                  style={styles.heroLogo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* ── Form card ── */}
          <View style={[styles.formCard, Shadows.sm]}>
            {/* Email field */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t.signIn.emailLabel}</Text>
                <Text style={styles.fieldRequired}>{t.signIn.required}</Text>
              </View>
              <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
                <Text style={styles.inputIcon}>@</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t.signIn.emailPlaceholder}
                  placeholderTextColor={Colors.OUTLINE}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  accessibilityLabel={t.signIn.emailLabel}
                />
              </View>
            </View>

            {/* Password field */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t.signIn.passwordLabel}</Text>
              <View style={[styles.inputWrap, passwordFocused && styles.inputWrapFocused]}>
                <Text style={styles.inputIcon}>🔑</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t.signIn.passwordPlaceholder}
                  placeholderTextColor={Colors.OUTLINE}
                  secureTextEntry={secureText}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  accessibilityLabel={t.signIn.passwordLabel}
                />
                <Pressable
                  style={styles.eyeToggle}
                  onPress={() => setSecureText(v => !v)}
                  accessibilityLabel={secureText ? t.signIn.showPassword : t.signIn.hidePassword}
                >
                  <Text style={{ fontSize: 18 }}>{secureText ? '👁' : '🙈'}</Text>
                </Pressable>
              </View>
            </View>

            {/* Remember me & forgot */}
            <View style={styles.rememberRow}>
              <Pressable
                style={styles.rememberLeft}
                onPress={() => setRememberMe(v => !v)}
                accessibilityLabel={t.signIn.rememberMe}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={{ color: Colors.ON_PRIMARY, fontSize: 10, fontWeight: '700' }}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>{t.signIn.rememberMe}</Text>
              </Pressable>
              <Pressable onPress={handleForgotPassword} accessibilityLabel={t.signIn.forgotPassword}>
                <Text style={styles.forgotText}>{t.signIn.forgotPassword}</Text>
              </Pressable>
            </View>

            {/* Sign in button */}
            <Pressable
              onPressIn={() => Animated.spring(signInScale, { toValue: 0.99, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(signInScale, { toValue: 1.0, useNativeDriver: true }).start()}
              onPress={handleSignIn}
              disabled={isSubmitting}
              accessibilityLabel={t.signIn.signInBtn}
            >
              <Animated.View style={[styles.signInBtn, { transform: [{ scale: signInScale }] }]}>
                {isSubmitting ? (
                  <Animated.Text style={[styles.signInBtnText, { transform: [{ rotate: spinInterpolate }] }]}>
                    ⏳
                  </Animated.Text>
                ) : (
                  <>
                    <Text style={styles.signInBtnText}>{t.signIn.signInBtn}</Text>
                    <Text style={{ color: Colors.ON_PRIMARY, fontSize: 18 }}> →</Text>
                  </>
                )}
              </Animated.View>
            </Pressable>

            {/* Biometric row */}
            <View style={styles.biometricRow}>
              <View style={[styles.biometricIcon, Shadows.sm]}>
                <Text style={{ fontSize: 18 }}>👆</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.biometricTitle}>{t.signIn.biometricTitle}</Text>
                <Text style={styles.biometricSub}>{t.signIn.biometricSub}</Text>
              </View>
              <Pressable
                style={[styles.unlockBtn, Shadows.sm]}
                onPress={handleBiometric}
                accessibilityLabel={t.signIn.unlockBtn}
              >
                <Text style={styles.unlockBtnText}>{t.signIn.unlockBtn}</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Or divider ── */}
          <OrDivider label={t.signIn.orContinueWith} />

          {/* ── SSO grid (Google & Facebook) ── */}
          <View style={styles.ssoGrid}>
            <Pressable
              style={[styles.ssoBtn, Shadows.sm]}
              onPress={() => handleSSO('oauth_google')}
              disabled={isSubmitting}
              accessibilityLabel={`Continue with ${t.signIn.google}`}
            >
              <Image source={require('@/assets/images/google.png')} style={styles.ssoLogo} />
              <Text style={styles.ssoBtnText}>{t.signIn.google}</Text>
            </Pressable>
            <Pressable
              style={[styles.ssoBtn, Shadows.sm]}
              onPress={() => handleSSO('oauth_facebook')}
              disabled={isSubmitting}
              accessibilityLabel={`Continue with ${t.signIn.facebook}`}
            >
              <Image source={require('@/assets/images/facebook.png')} style={styles.ssoLogo} />
              <Text style={styles.ssoBtnText}>{t.signIn.facebook}</Text>
            </Pressable>
          </View>

          {/* ── Sign up prompt ── */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>{t.signIn.noAccount} </Text>
            <Pressable accessibilityLabel={t.signIn.signUp}>
              <Text style={styles.signUpLink}>{t.signIn.signUp}</Text>
            </Pressable>
          </View>

          {/* ── Trust footer ── */}
          <View style={styles.trustFooter}>
            <View style={[styles.clerkPill, Shadows.sm]}>
              <Text style={styles.clerkText}>{t.common.securedBy} Clerk</Text>
            </View>
            <Text style={styles.trustLinks}>
              {t.common.privacyPolicy} • {t.common.termsOfService} • 🟢 {t.common.syncActive}
            </Text>
          </View>
        </ScrollView>

        {/* ── Toast (absolute) ── */}
        <Toast message={toastMsg} visible={toastVisible} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.SURFACE,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  // ── Header bar ────────────────────────────────────────────────────────────
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.SURFACE_CONTAINER + '80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    flex: 1,
    justifyContent: 'center',
  },
  headerLogo: {
    width: 26,
    height: 26,
    borderRadius: Radius.full,
  },
  logoText: {
    ...Typography.headlineSm,
    color: Colors.ON_SURFACE,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.SURFACE_LOW,
    borderRadius: Radius.full,
    padding: 2,
    gap: 0,
  },
  langTab: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langTabActive: {
    backgroundColor: Colors.SURFACE_LOWEST,
    ...Shadows.sm,
  },
  langTabText: {
    ...Typography.labelSm,
    color: Colors.ON_SURFACE_VARIANT,
  },
  langTabTextActive: {
    color: Colors.PRIMARY,
    fontWeight: '700',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Hero card ─────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: Colors.SURFACE_LOW,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBlobAmbient: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Colors.PRIMARY_FIXED,
    opacity: 0.6,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  encryptedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.SURFACE_LOWEST,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  encryptedText: {
    ...Typography.labelSm,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  heroTitle: {
    ...Typography.headlineLg,
    color: Colors.ON_SURFACE,
  },
  heroSub: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
  },
  walletTile: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.SURFACE_LOWEST,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroLogo: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
  },
  // ── Form card ─────────────────────────────────────────────────────────────
  formCard: {
    backgroundColor: Colors.SURFACE_LOWEST,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  fieldBlock: {
    gap: Spacing.xs,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    ...Typography.labelMd,
    color: Colors.ON_SURFACE,
  },
  fieldRequired: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: Colors.SURFACE_LOW,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputWrapFocused: {
    backgroundColor: Colors.SURFACE_LOWEST,
    borderColor: Colors.PRIMARY,
  },
  inputIcon: {
    fontSize: 16,
    color: Colors.ON_SURFACE_VARIANT,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    ...Typography.bodyMd,
    color: Colors.ON_SURFACE,
  },
  eyeToggle: {
    padding: Spacing.xs,
  },
  // ── Remember row ──────────────────────────────────────────────────────────
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.OUTLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  rememberText: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
  },
  forgotText: {
    ...Typography.labelMd,
    color: Colors.PRIMARY,
  },
  // ── Sign in button ────────────────────────────────────────────────────────
  signInBtn: {
    height: 48,
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  signInBtnText: {
    ...Typography.labelLg,
    color: Colors.ON_PRIMARY,
  },
  // ── Biometric row ─────────────────────────────────────────────────────────
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SURFACE_LOW,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  biometricIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.SURFACE_LOWEST,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricTitle: {
    ...Typography.labelMd,
    color: Colors.ON_SURFACE,
  },
  biometricSub: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
  },
  unlockBtn: {
    backgroundColor: Colors.SURFACE_LOWEST,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  unlockBtnText: {
    ...Typography.labelSm,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  // ── Divider ───────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.SURFACE_HIGH,
  },
  dividerText: {
    ...Typography.labelSm,
    color: Colors.ON_SURFACE_VARIANT,
    textTransform: 'uppercase',
  },
  // ── SSO grid ──────────────────────────────────────────────────────────────
  ssoGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ssoBtn: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.SURFACE_LOW,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  ssoBtnText: {
    ...Typography.labelMd,
    color: Colors.ON_SURFACE,
  },
  ssoLogo: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
  },
  // ── Sign up prompt ────────────────────────────────────────────────────────
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    ...Typography.bodyMd,
    color: Colors.ON_SURFACE_VARIANT,
  },
  signUpLink: {
    ...Typography.labelLg,
    color: Colors.PRIMARY,
  },
  // ── Trust footer ──────────────────────────────────────────────────────────
  trustFooter: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  clerkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SURFACE_LOW,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  clerkText: {
    ...Typography.labelSm,
    color: Colors.ON_SURFACE_VARIANT,
  },
  trustLinks: {
    ...Typography.bodySm,
    color: Colors.ON_SURFACE_VARIANT,
    textAlign: 'center',
  },
  // ── Toast ─────────────────────────────────────────────────────────────────
  toast: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.SECONDARY_CONTAINER,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  toastText: {
    ...Typography.bodySm,
    color: Colors.ON_SECONDARY_CONTAINER,
    fontWeight: '600',
    flex: 1,
  },
});
