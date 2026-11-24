import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';

export function requestPhoneCode(phoneNumber) {
  return signInWithPhoneNumber(getAuth(), phoneNumber);
}

export function confirmPhoneCode(confirmation, code) {
  if (!confirmation) {
    throw new Error('No phone verification is in progress.');
  }

  return confirmation.confirm(code);
}
