import bcrypt from 'bcryptjs';
import type { LoginInput, RegisterInput, PublicUser } from 'shared';
import { UserModel, toPublicUser, type UserHydrated } from '../users/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { issueRefreshToken, signAccessToken } from './token.service.js';

const BCRYPT_COST = 12;

interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

/** Registra un nuevo usuario y devuelve tokens de sesión. */
export async function registerUser(input: RegisterInput, deviceInfo?: string): Promise<AuthResult> {
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) {
    throw ApiError.conflict('Ya existe una cuenta con este email');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  return buildSession(user, deviceInfo);
}

/** Valida credenciales y devuelve tokens de sesión. */
export async function loginUser(input: LoginInput, deviceInfo?: string): Promise<AuthResult> {
  // passwordHash tiene select:false, hay que pedirlo explícitamente.
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');
  if (!user) {
    throw ApiError.unauthorized('Email o contraseña incorrectos');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Email o contraseña incorrectos');
  }

  return buildSession(user, deviceInfo);
}

async function buildSession(user: UserHydrated, deviceInfo?: string): Promise<AuthResult> {
  const userId = user._id.toString();
  const accessToken = signAccessToken(userId);
  const refreshToken = await issueRefreshToken(userId, deviceInfo);
  return { user: toPublicUser(user), accessToken, refreshToken };
}
