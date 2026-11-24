import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhoneVerificationScreen from './PhoneVerificationScreen';

const COLORS = {
  blue: '#174D76',
  orange: '#F9A619',
  border: '#B8BDC3',
  text: '#222222',
  muted: '#777777',
  white: '#FFFFFF',
  error: '#B3261E',
};

const LOGO = require('./assets/oullin-logo-cropped.png');
const MASCOT = require('./assets/mascote-email.png');
const NAME_MASCOT = require('./assets/mascote-name.png');
const WELCOME_BACKGROUND = require('./assets/welcome-background.png');
const FACEBOOK_ICON = require('./assets/facebook-icon.png');
const GOOGLE_ICON = require('./assets/google-icon.png');

function Splash({ onContinue }) {
  useEffect(() => {
    const screenTimer = setTimeout(onContinue, 3400);
    return () => clearTimeout(screenTimer);
  }, [onContinue]);

  return (
    <View style={styles.splash}>
      <StatusBar hidden />
      <View style={styles.splashLogoContainer}>
        <Image
          accessibilityLabel="Logo Oullin"
          source={LOGO}
          style={styles.splashLogo}
          resizeMode="contain"
        />
      </View>
      <Text
        maxFontSizeMultiplier={1}
        style={styles.splashTagline}
      >
        {'Mais seguran\u00e7a no prato.'}
      </Text>
    </View>
  );
}

function SocialButton({ label, iconSource, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.socialButton}>
      {!!iconSource && <Image source={iconSource} style={styles.socialIcon} resizeMode="contain" />}
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

function formatBrazilianPhone(phone) {
  const digits = phone.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  return `+55${digits}`;
}

function RegistrationOptions({ onContinue, onPhoneContinue, phone, onChangePhone }) {
  const [notice, setNotice] = useState('');

  function continueWithPhone() {
    const digits = phone.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
    if (digits.length !== 10 && digits.length !== 11) {
      setNotice('Digite um telefone com DDD para continuar.');
      return;
    }
    setNotice('');
    onPhoneContinue(formatBrazilianPhone(phone));
  }

  return (
    <ImageBackground
      accessibilityLabel="Pessoas trocando uma entrega da Oullin"
      imageStyle={styles.welcomeBackgroundImage}
      resizeMode="cover"
      source={WELCOME_BACKGROUND}
      style={styles.registrationScreen}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.registrationContent}>
        <SafeAreaView edges={['bottom']} style={styles.registrationPanel}>
          <View style={styles.phoneRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Country: Brazil, code +55"
              onPress={() => setNotice('Country selected: Brazil (+55).')}
              style={styles.countryButton}
            >
              <Text style={styles.countryFlag}>{'\uD83C\uDDE7\uD83C\uDDF7'}</Text>
              <Text style={styles.countryChevron}>v</Text>
            </Pressable>
            <TextInput
              accessibilityLabel="Telefone"
              autoComplete="tel"
              keyboardType="phone-pad"
              onChangeText={onChangePhone}
              placeholder="+55 (11) 90028-9222"
              placeholderTextColor="#333333"
              style={styles.phoneInput}
              value={phone}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={continueWithPhone}
            style={styles.phoneContinueButton}
          >
            <Text style={styles.phoneContinueText}>Continuar</Text>
          </Pressable>
          {!!notice && <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text>}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>ou</Text>
            <View style={styles.divider} />
          </View>
          <SocialButton
            iconSource={FACEBOOK_ICON}
            label="Continue com Facebook"
            onPress={() => setNotice('Facebook sign-in is not configured yet. Continue with email.')}
          />
          <SocialButton
            iconSource={GOOGLE_ICON}
            label="Continue com Google"
            onPress={() => setNotice('Google sign-in is not configured yet. Continue with email.')}
          />
          <SocialButton label="Continue com email" onPress={onContinue} />
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

function EmailScreen({ email, onChangeEmail, onBack, onContinue }) {
  const [error, setError] = useState('');

  function continueToName() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Informe um email válido para continuar.');
      return;
    }
    setError('');
    onContinue();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.formScreen}
    >
      <SafeAreaView style={styles.emailContent}>
        <View>
          <Text style={styles.formTitle}>Entre com seu email</Text>
          <Text style={styles.formHint}>Adicione seu e-mail para criar sua conta</Text>
          <TextInput
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={(value) => {
              onChangeEmail(value);
              if (error) setError('');
            }}
            onSubmitEditing={continueToName}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#C0C0C0"
            returnKeyType="next"
            style={styles.input}
            value={email}
          />
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        </View>
        <View style={styles.formActions}>
          <Image source={MASCOT} style={styles.cornerMascot} resizeMode="contain" />
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={continueToName} style={styles.continueButton}>
            <Text style={styles.continueText}>Continuar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function NameScreen({ email, phone, onBack, onComplete }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  function completeRegistration() {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Informe seu nome e sobrenome para continuar.');
      return;
    }
    onComplete({
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(phone ? { phone } : {}),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.formScreen}
    >
      <SafeAreaView style={styles.nameContent}>
        <Image source={NAME_MASCOT} style={styles.topMascot} resizeMode="contain" />
        <Text style={styles.formTitle}>Qual é seu nome?</Text>
        <Text style={styles.formHint}>Informe seu nome para concluir o cadastro</Text>
        <TextInput
          accessibilityLabel="Primeiro nome"
          autoComplete="given-name"
          onChangeText={(value) => {
            setFirstName(value);
            if (error) setError('');
          }}
          placeholder="Insira o primeiro nome"
          placeholderTextColor={COLORS.border}
          returnKeyType="next"
          style={styles.input}
          value={firstName}
        />
        <TextInput
          accessibilityLabel="Sobrenome"
          autoComplete="family-name"
          onChangeText={(value) => {
            setLastName(value);
            if (error) setError('');
          }}
          onSubmitEditing={completeRegistration}
          placeholder="Insira o sobrenome"
          placeholderTextColor={COLORS.border}
          returnKeyType="done"
          style={styles.input}
          value={lastName}
        />
        <Text style={styles.emailSummary}>{phone ? `Telefone: ${phone}` : `Email: ${email}`}</Text>
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <View style={styles.formActions}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={completeRegistration}
            style={styles.continueButton}
          >
            <Text style={styles.continueText}>Continuar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

export default function OnboardingScreen({ onComplete }) {
  const [screen, setScreen] = useState('splash');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  if (screen === 'splash') {
    return <Splash onContinue={() => setScreen('registration')} />;
  }
  if (screen === 'registration') {
    return (
      <RegistrationOptions
        onContinue={() => {
          setPhone('');
          setScreen('email');
        }}
        phone={phone}
        onChangePhone={setPhone}
        onPhoneContinue={(value) => {
          setPhone(value);
          setScreen('phoneVerification');
        }}
      />
    );
  }
  if (screen === 'phoneVerification') {
    return (
      <PhoneVerificationScreen
        phone={phone}
        onBack={() => setScreen('registration')}
      />
    );
  }
  if (screen === 'email') {
    return (
      <EmailScreen
        email={email}
        onBack={() => setScreen('registration')}
        onChangeEmail={setEmail}
        onContinue={() => setScreen('name')}
      />
    );
  }
  return (
    <NameScreen
      email={email}
      onBack={() => setScreen('email')}
      onComplete={onComplete}
    />
  );
}

const styles = StyleSheet.create({
  splash: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  splashLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  splashLogo: {
    height: 85,
    width: 250,
  },
  splashTagline: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '400',
    includeFontPadding: false,
    lineHeight: 22,
    marginTop: 6,
    paddingHorizontal: 16,
    textAlign: 'center',
    width: '100%',
  },
  registrationScreen: {
    flex: 1,
  },
  welcomeBackgroundImage: {
    height: '62%',
    width: '100%',
  },
  registrationContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  registrationPanel: {
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxWidth: 480,
    paddingBottom: 6,
    paddingHorizontal: 27,
    paddingTop: 14,
    width: '96%',
  },
  phoneRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 36,
    marginBottom: 10,
  },
  countryButton: {
    alignItems: 'center',
    backgroundColor: '#FFF9E9',
    borderRadius: 7,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'center',
    marginRight: 8,
    width: 55,
  },
  countryFlag: {
    fontSize: 18,
  },
  countryChevron: {
    color: '#555555',
    fontSize: 12,
    marginLeft: 4,
  },
  phoneInput: {
    backgroundColor: '#FFF9E9',
    borderRadius: 7,
    color: COLORS.text,
    flex: 1,
    fontSize: 13,
    height: 36,
    paddingHorizontal: 12,
  },
  phoneContinueButton: {
    alignItems: 'center',
    backgroundColor: '#FFB703',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.65,
  },
  phoneContinueText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
  },
  notice: {
    color: '#A33A2F',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 5,
    textAlign: 'center',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 10,
  },
  divider: {
    backgroundColor: '#9AA6B2',
    flex: 1,
    height: 1,
  },
  orText: {
    color: COLORS.blue,
    fontSize: 11,
    marginHorizontal: 12,
  },
  socialButton: {
    alignItems: 'center',
    borderColor: '#FFB703',
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 34,
    justifyContent: 'center',
    marginBottom: 8,
  },
  socialIcon: {
    height: 16,
    left: 35,
    position: 'absolute',
    width: 16,
  },
  socialText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '600',
  },
  formScreen: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  emailContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 88,
  },
  nameContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  topMascot: {
    alignSelf: 'flex-end',
    height: 75,
    marginRight: -32,
    marginTop: -25,
    width: 96,
  },
  formTitle: {
    color: COLORS.blue,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 25,
  },
  formHint: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 18,
  },
  input: {
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    height: 54,
    marginBottom: 20,
    paddingHorizontal: 14,
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginBottom: 12,
    marginTop: -12,
  },
  emailSummary: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 16,
    marginTop: -12,
  },
  formActions: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 100,
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cornerMascot: {
    bottom: 130,
    height: 90,
    left: -44,
    position: 'absolute',
    width: 117,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    borderRadius: 10,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  backArrow: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 32,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    borderRadius: 10,
    height: 54,
    justifyContent: 'center',
    width: 190,
  },
  continueText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
