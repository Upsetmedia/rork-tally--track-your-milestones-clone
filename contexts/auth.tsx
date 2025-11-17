import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/tally';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  followingIds: string[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_KEY = '@tally_app:auth';
const USER_KEY = '@tally_app:user';
const FOLLOWING_KEY = '@tally_app:following';

const normalizeUser = (data?: Partial<User> | null): User => {
  const timestamp = Date.now();
  const fallbackUsernameSource = data?.name ?? 'Tally User';
  const fallbackUsername = fallbackUsernameSource.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20) || 'tallyuser';

  return {
    id: data?.id ?? timestamp.toString(),
    name: data?.name ?? 'Tally User',
    username: data?.username ?? fallbackUsername,
    email: data?.email ?? 'user@tally.app',
    avatarUrl: data?.avatarUrl,
    bio: data?.bio,
    mailingAddress: data?.mailingAddress,
    blockedUsers: data?.blockedUsers ?? [],
    followersCount: data?.followersCount ?? 0,
    followingCount: data?.followingCount ?? 0,
    createdAt: data?.createdAt ?? timestamp,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const authStatus = await AsyncStorage.getItem(AUTH_KEY);
      const userStr = await AsyncStorage.getItem(USER_KEY);
      const followingStr = await AsyncStorage.getItem(FOLLOWING_KEY);
      
      if (authStatus === 'true') {
        setIsAuthenticated(true);
        if (userStr) {
          const stored = JSON.parse(userStr) as Partial<User>;
          const normalized = normalizeUser(stored);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(normalized));
          setUser(normalized);
        } else {
          const defaultUser = normalizeUser(null);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
          setUser(defaultUser);
        }
        if (followingStr) {
          const parsed = JSON.parse(followingStr) as string[];
          setFollowingIds(Array.isArray(parsed) ? parsed : []);
        } else {
          setFollowingIds([]);
        }
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async () => {
    try {
      const defaultUser = normalizeUser(null);
      
      await AsyncStorage.setItem(AUTH_KEY, 'true');
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
      await AsyncStorage.setItem(FOLLOWING_KEY, JSON.stringify([]));
      setFollowingIds([]);
      setUser(defaultUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to login:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(FOLLOWING_KEY);
      setUser(null);
      setFollowingIds([]);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      if (!user) return;
      const updatedUser = normalizeUser({ ...user, ...updates });
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }, [user]);

  const followUser = useCallback(async (userId: string) => {
    try {
      if (!user) return;
      if (userId === user.id) {
        return;
      }
      if (followingIds.includes(userId)) {
        return;
      }
      const updatedFollowing = [...followingIds, userId];
      const updatedUser = normalizeUser({ ...user, followingCount: updatedFollowing.length });
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      await AsyncStorage.setItem(FOLLOWING_KEY, JSON.stringify(updatedFollowing));
      setUser(updatedUser);
      setFollowingIds(updatedFollowing);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  }, [user, followingIds]);

  const unfollowUser = useCallback(async (userId: string) => {
    try {
      if (!user) return;
      if (!followingIds.includes(userId)) {
        return;
      }
      const updatedFollowing = followingIds.filter((id) => id !== userId);
      const updatedUser = normalizeUser({ ...user, followingCount: updatedFollowing.length });
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      await AsyncStorage.setItem(FOLLOWING_KEY, JSON.stringify(updatedFollowing));
      setUser(updatedUser);
      setFollowingIds(updatedFollowing);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  }, [user, followingIds]);

  const isFollowing = useCallback((targetUserId: string) => {
    return followingIds.includes(targetUserId);
  }, [followingIds]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      followingIds,
      login,
      logout,
      updateProfile,
      followUser,
      unfollowUser,
      isFollowing,
    }),
    [isAuthenticated, isLoading, user, followingIds, login, logout, updateProfile, followUser, unfollowUser, isFollowing]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
