export type SupportedLanguage = 'en' | 'fr';

export interface TranslationSchema {
  common: {
    back: string;
    loading: string;
    continue: string;
    syncActive: string;
    securedBy: string;
    privacyPolicy: string;
    termsOfService: string;
  };
  splash: {
    syncBadge: string;
    titlePrimary: string;
    titleSecondary: string;
    subtitle: string;
    valuePill: string;
    descEn: string;
    descFr: string;
    securedBadge: string;
    tapToEnter: string;
  };
  language: {
    globalBadge: string;
    title: string;
    titleFr: string;
    subtitle: string;
    subtitleFr: string;
    enName: string;
    enPill: string;
    enSub: string;
    enFooter: string;
    frName: string;
    frPill: string;
    frSub: string;
    frFooter: string;
    deviceDetected: string;
    deviceValue: string;
    offlineReady: string;
    offlineSub: string;
    multiCurrency: string;
    multiCurrencySub: string;
    continueBtn: string;
    offlineFooter: string;
  };
  signIn: {
    backAria: string;
    brand: string;
    encryptedSession: string;
    welcomeBack: string;
    subtitle: string;
    emailLabel: string;
    required: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    rememberMe: string;
    forgotPassword: string;
    signInBtn: string;
    signingIn: string;
    biometricTitle: string;
    biometricSub: string;
    unlockBtn: string;
    orContinueWith: string;
    google: string;
    facebook: string;
    noAccount: string;
    signUp: string;
    showPassword: string;
    hidePassword: string;
    toastSuccess: string;
    toastBiometric: string;
    toastForgot: string;
    toastSSO: string;
    toastSSOCancelled: string;
    toastSSOError: string;
    toastSSOIncomplete: string;
    toastSSOTimeout: string;
    rateLimitWarning: string;
    rateLimitLocked: string;
    invalidCredentials: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationSchema> = {
  en: {
    common: {
      back: 'Go back',
      loading: 'Loading...',
      continue: 'Continue',
      syncActive: 'Sync Active',
      securedBy: 'Secured by',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
    },
    splash: {
      syncBadge: 'Fintech Sync v1.0',
      titlePrimary: 'Shared',
      titleSecondary: 'Wallet',
      subtitle: 'Shared Finance Management',
      valuePill: 'Simple • Fair • Transparent',
      descEn: 'Manage shared finances with ease',
      descFr: 'Gérez vos finances partagées en toute sérénité',
      securedBadge: 'Secured & Offline-Ready',
      tapToEnter: 'Tap anywhere to enter',
    },
    language: {
      globalBadge: 'SHAREDWALLET GLOBAL',
      title: 'Choose Your Language',
      titleFr: 'Choisissez votre langue',
      subtitle: 'You can change this anytime in settings',
      subtitleFr: 'Modifiable à tout moment dans les réglages',
      enName: 'English',
      enPill: 'Default',
      enSub: 'Global • East Africa (UGX)',
      enFooter: 'Default interface language, shared group expenses, currencies and regional formatting.',
      frName: 'Français',
      frPill: 'Régional',
      frSub: 'Afrique francophone • International',
      frFooter: 'Interface complète en français, suivi des cotisations, dettes mutuelles et devises francophones.',
      deviceDetected: 'DEVICE DETECTED',
      deviceValue: 'English (Uganda / East Africa · UGX)',
      offlineReady: 'Offline Ready',
      offlineSub: 'Auto-syncs later',
      multiCurrency: 'Multi-Currency',
      multiCurrencySub: 'Auto UGX / XOF / EUR',
      continueBtn: 'Continue in English',
      offlineFooter: '⚡ Offline-first sync ready • Prêt pour le mode hors-ligne',
    },
    signIn: {
      backAria: 'Go back',
      brand: 'SharedWallet',
      encryptedSession: 'Encrypted Session',
      welcomeBack: 'Welcome Back',
      subtitle: 'Sign in to manage your shared groups & ledgers',
      emailLabel: 'Email Address',
      required: 'Required',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••••••',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      signInBtn: 'Sign In',
      signingIn: 'Signing In...',
      biometricTitle: 'FaceID / Biometric',
      biometricSub: 'Instant local unlock',
      unlockBtn: 'Unlock →',
      orContinueWith: 'Or continue with',
      google: 'Google',
      facebook: 'Facebook',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      toastSuccess: 'Welcome back! Authentication successful.',
      toastBiometric: 'FaceID / Biometric recognized. Authenticated locally.',
      toastForgot: 'Password reset instructions sent to your email.',
      toastSSO: 'Redirecting to secure login...',
      toastSSOCancelled: 'Authentication was cancelled.',
      toastSSOError: 'Authentication failed. Please try again.',
      toastSSOIncomplete: 'Sign-in needs additional account details. Please check your Clerk sign-up settings.',
      toastSSOTimeout: 'Sign-in timed out. Check the app redirect URL in Clerk, then try again.',
      rateLimitWarning: 'Too many attempts. Action throttled.',
      rateLimitLocked: 'Security Lockout: Too many failed attempts. Please wait {seconds}s.',
      invalidCredentials: 'Invalid email or password. Please verify.',
    },
  },
  fr: {
    common: {
      back: 'Retour',
      loading: 'Chargement...',
      continue: 'Continuer',
      syncActive: 'Synchro Active',
      securedBy: 'Sécurisé par',
      privacyPolicy: 'Confidentialité',
      termsOfService: "Conditions d'utilisation",
    },
    splash: {
      syncBadge: 'Fintech Sync v1.0',
      titlePrimary: 'Shared',
      titleSecondary: 'Wallet',
      subtitle: 'Gestion Financière Partagée',
      valuePill: 'Simple • Équitable • Transparent',
      descEn: 'Manage shared finances with ease',
      descFr: 'Gérez vos finances partagées en toute sérénité',
      securedBadge: 'Sécurisé et Prêt Hors-ligne',
      tapToEnter: 'Touchez n’importe où pour entrer',
    },
    language: {
      globalBadge: 'SHAREDWALLET MONDIAL',
      title: 'Choisissez votre langue',
      titleFr: 'Choose Your Language',
      subtitle: 'Modifiable à tout moment dans les réglages',
      subtitleFr: 'You can change this anytime in settings',
      enName: 'English',
      enPill: 'Défaut',
      enSub: 'International • Afrique de l’Est (UGX)',
      enFooter: 'Langue par défaut, dépenses de groupe partagées, devises et formats régionaux.',
      frName: 'Français',
      frPill: 'Régional',
      frSub: 'Afrique francophone • International',
      frFooter: 'Interface complète en français, suivi des cotisations, dettes mutuelles et devises francophones.',
      deviceDetected: 'APPAREIL DÉTECTÉ',
      deviceValue: 'Français (Afrique francophone · XOF / EUR)',
      offlineReady: 'Prêt Hors-ligne',
      offlineSub: 'Synchro automatique plus tard',
      multiCurrency: 'Multi-Devises',
      multiCurrencySub: 'Auto UGX / XOF / EUR',
      continueBtn: 'Continuer en Français',
      offlineFooter: 'Prêt pour le mode hors-ligne • Offline-first sync ready',
    },
    signIn: {
      backAria: 'Retour',
      brand: 'SharedWallet',
      encryptedSession: 'Session Chiffrée',
      welcomeBack: 'Bon retour',
      subtitle: 'Connectez-vous pour gérer vos groupes et comptes partagés',
      emailLabel: 'Adresse E-mail',
      required: 'Requis',
      emailPlaceholder: 'nom@exemple.com',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: '••••••••••••',
      rememberMe: 'Se souvenir de moi',
      forgotPassword: 'Mot de passe oublié ?',
      signInBtn: 'Se connecter',
      signingIn: 'Connexion en cours...',
      biometricTitle: 'FaceID / Biométrie',
      biometricSub: 'Déverrouillage local instantané',
      unlockBtn: 'Déverrouiller →',
      orContinueWith: 'Ou continuer avec',
      google: 'Google',
      facebook: 'Facebook',
      noAccount: "Vous n'avez pas de compte ?",
      signUp: "S'inscrire",
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe',
      toastSuccess: 'Bon retour ! Authentification réussie.',
      toastBiometric: 'FaceID / Biométrie reconnue. Authentifié localement.',
      toastForgot: 'Instructions de réinitialisation envoyées à votre e-mail.',
      toastSSO: 'Redirection vers la connexion sécurisée...',
      toastSSOCancelled: 'Authentification annulée.',
      toastSSOError: 'Échec de l’authentification. Veuillez réessayer.',
      toastSSOIncomplete: 'La connexion nécessite des informations supplémentaires. Vérifiez les paramètres d’inscription Clerk.',
      toastSSOTimeout: 'La connexion a expiré. Vérifiez l’URL de redirection de l’application dans Clerk, puis réessayez.',
      rateLimitWarning: 'Trop de tentatives rapprochées. Action ralentie.',
      rateLimitLocked: 'Verrouillage de sécurité : Trop de tentatives. Attendez {seconds}s.',
      invalidCredentials: 'E-mail ou mot de passe invalide. Veuillez vérifier.',
    },
  },
};
