// app/auth/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: 'Connexion',
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: 'Inscription',
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            title: 'Mot de passe oublié',
          }}
        />

      </Stack>
    </>
  );
}