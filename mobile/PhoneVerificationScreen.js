import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  blue: '#174D76',
  white: '#FFFFFF',
};

function getAuthErrorMessage(error, action) {
  if (error?.code === 'auth/invalid-phone-number') return 'Confira o numero e o DDD.';
  if (error?.code === 'auth/invalid-verification-code') return 'Codigo incorreto. Confira o SMS e tente novamente.';
  if (error?.code === 'auth/too-many-requests') return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
  if (error?.code === 'auth/no-app' || error?.code === 'app/no-app') {
    return 'Firebase ainda precisa ser configurado para este app.';
  }

  return action === 'send'
    ? 'Nao foi possivel enviar o SMS. Verifique a conexao e tente novamente.'
    : 'Nao foi possivel confirmar o codigo. Tente novamente.';
}

export default function PhoneVerificationScreen({ phone, onBack, onResend, onVerify }) {
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [notice, setNotice] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const digits = phone.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  const areaCode = digits.slice(0, 2);
  const subscriber = digits.slice(2);
  const formattedPhone = subscriber.length > 8
    ? `(${areaCode}) ${subscriber.slice(0, 5)}-${subscriber.slice(5)}`
    : `(${areaCode}) ${subscriber.slice(0, 4)}-${subscriber.slice(4)}`;
  const timerLabel = `00:${String(seconds).padStart(2, '0')}`;

  function updateDigit(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1);
    setCode((current) => Array.from({ length: 6 }, (_, position) =>
      position === index ? digit : current[position] || '',
    ).join(''));
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  async function resendCode() {
    if (seconds > 0 || isResending) return;
    if (!onResend) {
      setNotice('O reenvio por SMS ainda nao esta conectado.');
      return;
    }
    setIsResending(true);
    setNotice('');
    try {
      await onResend();
      setSeconds(30);
    } catch (error) {
      setNotice(getAuthErrorMessage(error, 'send'));
    } finally {
      setIsResending(false);
    }
  }

  async function verifyCode() {
    if (code.replace(/\D/g, '').length !== 6) {
      setNotice('Digite os 6 digitos do codigo.');
      return;
    }
    if (!onVerify) {
      setNotice('A confirmacao do SMS ainda nao esta conectada.');
      return;
    }
    setIsVerifying(true);
    setNotice('');
    try {
      await onVerify(code);
    } catch (error) {
      setNotice(getAuthErrorMessage(error, 'verify'));
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>
            {'Digite o c\u00f3digo de 6 d\u00edgitos\npara confirmar seu telefone'}
          </Text>
          <Text style={styles.phone}>{formattedPhone}</Text>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.changePhoneButton}>
            <Text style={styles.changePhoneText}>{'Mudar o n\u00famero de celular?'}</Text>
          </Pressable>
          <View style={styles.otpRow}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(input) => { inputs.current[index] = input; }}
                accessibilityLabel={`Digito ${index + 1} do codigo`}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(value) => updateDigit(index, value)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
                    inputs.current[index - 1]?.focus();
                  }
                }}
                selectTextOnFocus
                style={[styles.otpInput, index === 0 ? styles.otpInputActive : styles.otpInputWaiting]}
                value={code[index] || ''}
              />
            ))}
          </View>
          {!!notice && <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text>}
          <Pressable
            accessibilityRole="button"
            disabled={seconds > 0 || isResending}
            onPress={resendCode}
            style={styles.resendButton}
          >
            <Text style={[styles.resendText, seconds > 0 && styles.resendTextDisabled]}>
              {`Reenviar c\u00f3digo por SMS (${timerLabel})`}
            </Text>
          </Pressable>
        </View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>{'\u2190'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isVerifying}
            onPress={verifyCode}
            style={[styles.continueButton, isVerifying && styles.disabledButton]}
          >
            <Text style={styles.continueText}>{isVerifying ? 'Verificando...' : 'Continuar'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  phone: {
    color: '#222222',
    fontSize: 13,
    marginTop: 5,
  },
  changePhoneButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  changePhoneText: {
    color: '#666666',
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 14,
  },
  otpInput: {
    borderRadius: 4,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    height: 42,
    textAlign: 'center',
    width: 34,
  },
  otpInputActive: {
    backgroundColor: '#386A9A',
  },
  otpInputWaiting: {
    backgroundColor: '#FFDA83',
  },
  notice: {
    color: '#A33A2F',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 8,
  },
  resendButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF8E8',
    borderRadius: 10,
    marginTop: 18,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  resendText: {
    color: '#444444',
    fontSize: 10,
  },
  resendTextDisabled: {
    color: '#888888',
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#FFB703',
    borderRadius: 7,
    height: 38,
    justifyContent: 'center',
    width: 42,
  },
  backArrow: {
    color: COLORS.white,
    fontSize: 28,
    lineHeight: 32,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: '#FFB703',
    borderRadius: 7,
    height: 38,
    justifyContent: 'center',
    width: '58%',
  },
  disabledButton: {
    opacity: 0.65,
  },
  continueText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
  },
});
