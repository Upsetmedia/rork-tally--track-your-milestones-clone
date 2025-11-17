import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TalliesProvider } from "../contexts/tallies";
import { AuthProvider } from "../contexts/auth";
import { JournalProvider } from "../contexts/journal";
import { trpc, trpcClient } from "../lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-tally" />
      <Stack.Screen name="tally-detail" />
      <Stack.Screen name="toolbox" />
      <Stack.Screen name="community-explorer" />
      <Stack.Screen name="milestones" />
      <Stack.Screen 
        name="create-post" 
        options={{ 
          presentation: "modal",
          animation: "slide_from_bottom"
        }} 
      />
      <Stack.Screen name="subscribe" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <TalliesProvider>
              <JournalProvider>
                <RootLayoutNav />
              </JournalProvider>
            </TalliesProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
