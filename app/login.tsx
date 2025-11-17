import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Apple } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';
import Colors from '../constants/colors';
import { useAuth } from '../contexts/auth';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const handleAppleLogin = async () => {
    console.log('Apple login initiated');
    await login();
    router.replace('/');
  };

  const handleGoogleLogin = async () => {
    console.log('Google login initiated');
    await login();
    router.replace('/');
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      console.log('Email and password required');
      return;
    }
    console.log('Email login initiated:', email);
    await login();
    router.replace('/');
  };

  return (
    <LinearGradient
      colors={[Colors.gradient1, Colors.gradient2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
          <BackButton color={Colors.white} style={styles.backButton} testID="login-back" />
          <View style={styles.header}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.logo}>TALLY</Text>
            <Text style={styles.tagline}>The sobriety & habit tracking app</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleAppleLogin}
                activeOpacity={0.8}
              >
                <Apple size={24} color={Colors.white} fill={Colors.white} />
                <Text style={styles.socialButtonText}>Sign in with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>Sign in with Google</Text>
              </TouchableOpacity>

              {!showEmailLogin ? (
                <TouchableOpacity
                  style={styles.emailToggle}
                  onPress={() => setShowEmailLogin(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emailToggleText}>Or sign in with email</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.emailForm}>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    style={styles.emailButton}
                    onPress={handleEmailLogin}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.emailButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  logo: {
    fontSize: 40,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 600,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500' as const,
  },
  buttonContainer: {
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  googleButton: {
    backgroundColor: Colors.white,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  emailToggle: {
    paddingVertical: 12,
  },
  emailToggleText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  emailForm: {
    gap: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.7,
    fontWeight: '600' as const,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emailButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 18,
  },
});
