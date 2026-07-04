import type { Id, IsoDate } from './common.js';

export type ThemeMode = 'light' | 'dark' | 'system';
export type BorderRadiusScale = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type UiDensity = 'compact' | 'comfortable' | 'spacious';

export interface UserPreferences {
  theme: ThemeMode;
  accentColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: BorderRadiusScale;
  density: UiDensity;
  backgroundImage?: string;
  animationsEnabled: boolean;
}

/** Usuario tal y como lo expone la API (sin passwordHash ni datos sensibles). */
export interface PublicUser {
  id: Id;
  name: string;
  email: string;
  avatarUrl?: string;
  spaceId?: Id;
  preferences: UserPreferences;
  createdAt: IsoDate;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  accentColor: '#e26d8a',
  secondaryColor: '#6d7de2',
  fontFamily: 'Inter',
  borderRadius: 'lg',
  density: 'comfortable',
  animationsEnabled: true,
};
