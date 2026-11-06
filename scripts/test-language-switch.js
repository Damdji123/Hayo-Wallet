// Automated test script for testing language switching dictionary and logic
const { translations } = require('../src/constants/translations');

function runTests() {
  console.log('🧪 Starting Language Switching Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Test 1: Verify both English and French dictionaries exist
  assert(!!translations.en, 'English (en) translation dictionary exists');
  assert(!!translations.fr, 'French (fr) translation dictionary exists');

  // Test 2: Check common section parity
  const commonKeys = ['back', 'loading', 'continue', 'syncActive', 'securedBy', 'privacyPolicy', 'termsOfService'];
  for (const key of commonKeys) {
    assert(
      translations.en.common[key] && translations.fr.common[key],
      `Common key "${key}" exists in both languages (en: "${translations.en.common[key]}", fr: "${translations.fr.common[key]}")`
    );
  }

  // Test 3: Check signIn section keys and translations
  const signInKeys = [
    'brand',
    'encryptedSession',
    'welcomeBack',
    'subtitle',
    'emailLabel',
    'required',
    'emailPlaceholder',
    'passwordLabel',
    'passwordPlaceholder',
    'rememberMe',
    'forgotPassword',
    'signInBtn',
    'signingIn',
    'biometricTitle',
    'biometricSub',
    'unlockBtn',
    'orContinueWith',
    'google',
    'facebook',
    'noAccount',
    'signUp',
    'toastSuccess',
    'toastBiometric',
    'toastForgot',
    'rateLimitWarning',
    'rateLimitLocked',
    'invalidCredentials',
  ];

  const invariantKeys = ['brand', 'passwordPlaceholder', 'google', 'facebook'];

  for (const key of signInKeys) {
    const enVal = translations.en.signIn[key];
    const frVal = translations.fr.signIn[key];
    assert(
      enVal && frVal,
      `SignIn key "${key}" translated in EN & FR (en: "${enVal}", fr: "${frVal}")`
    );
    if (!invariantKeys.includes(key)) {
      assert(
        enVal !== frVal,
        `SignIn key "${key}" has distinct English and French values`
      );
    }
  }

  // Test 4: Simulate switching language state
  console.log('\n🔄 Simulating Language State Switching:');
  let currentLang = 'en';
  let t = translations[currentLang];

  assert(t.signIn.welcomeBack === 'Welcome Back', 'Initial state [en] returns "Welcome Back"');
  assert(t.signIn.signInBtn === 'Sign In', 'Initial state [en] returns "Sign In"');
  assert(t.signIn.emailLabel === 'Email Address', 'Initial state [en] returns "Email Address"');

  // Switch to French
  currentLang = 'fr';
  t = translations[currentLang];
  assert(t.signIn.welcomeBack === 'Bon retour', 'Switched state [fr] returns "Bon retour"');
  assert(t.signIn.signInBtn === 'Se connecter', 'Switched state [fr] returns "Se connecter"');
  assert(t.signIn.emailLabel === 'Adresse E-mail', 'Switched state [fr] returns "Adresse E-mail"');
  assert(t.signIn.forgotPassword === 'Mot de passe oublié ?', 'Switched state [fr] returns "Mot de passe oublié ?"');
  assert(t.signIn.rememberMe === 'Se souvenir de moi', 'Switched state [fr] returns "Se souvenir de moi"');
  assert(t.signIn.encryptedSession === 'Session Chiffrée', 'Switched state [fr] returns "Session Chiffrée"');

  // Switch back to English
  currentLang = 'en';
  t = translations[currentLang];
  assert(t.signIn.welcomeBack === 'Welcome Back', 'Switched back to [en] returns "Welcome Back"');
  assert(t.signIn.signInBtn === 'Sign In', 'Switched back to [en] returns "Sign In"');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
