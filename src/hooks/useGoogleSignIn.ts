import { useState } from 'react';
import { Alert } from 'react-native';

// Temporary implementation - Google Sign-In will be added later
// For now, this provides a placeholder that won't crash the app
export const useGoogleSignIn = () => {
  const [isLoading] = useState(false);

  const signIn = () => {
    Alert.alert(
      'Coming Soon',
      'Google Sign-In will be available soon. Please use email/password to sign in for now.',
      [{ text: 'OK' }]
    );
  };

  return {
    signIn,
    isLoading,
  };
};
