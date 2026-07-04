import crypto from 'node:crypto';
import { Types } from 'mongoose';
import {
  MAX_SPACE_MEMBERS,
  type CreateSpaceInput,
  type JoinSpaceInput,
  type PublicSpace,
  type SpaceMember,
} from 'shared';
import { ApiError } from '../../utils/ApiError.js';
import { UserModel } from '../users/user.model.js';
import { SpaceModel, type SpaceHydrated } from './space.model.js';

// Alfabeto sin caracteres ambiguos (0/O, 1/I) para códigos legibles.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

function generateCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return code;
}

/** Genera un inviteCode garantizando unicidad frente a la BD. */
async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateCode();
    const exists = await SpaceModel.exists({ inviteCode: code });
    if (!exists) return code;
  }
  throw new ApiError(500, 'No se pudo generar un código de invitación');
}

/** Resuelve nombres/avatares de los miembros para la respuesta pública. */
async function toPublicSpace(space: SpaceHydrated): Promise<PublicSpace> {
  const userIds = space.members.map((m) => m.userId);
  const users = await UserModel.find({ _id: { $in: userIds } }).select('name avatarUrl');
  const byId = new Map(users.map((u) => [u._id.toString(), u]));

  const members: SpaceMember[] = space.members.map((m) => {
    const user = byId.get(m.userId.toString());
    return {
      userId: m.userId.toString(),
      name: user?.name ?? 'Usuario',
      avatarUrl: user?.avatarUrl,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    };
  });

  return {
    id: space._id.toString(),
    name: space.name,
    members,
    inviteCode: space.inviteCode,
    anniversaryDate: space.anniversaryDate?.toISOString(),
    createdAt: space.createdAt.toISOString(),
  };
}

/** Crea un Space nuevo con el usuario actual como owner. */
export async function createSpace(userId: string, input: CreateSpaceInput): Promise<PublicSpace> {
  const user = await UserModel.findById(userId);
  if (!user) throw ApiError.notFound('Usuario no encontrado');
  if (user.spaceId) throw ApiError.conflict('Ya perteneces a un espacio');

  const space = await SpaceModel.create({
    name: input.name,
    inviteCode: await generateUniqueCode(),
    anniversaryDate: input.anniversaryDate ? new Date(input.anniversaryDate) : undefined,
    members: [{ userId: new Types.ObjectId(userId), role: 'owner', joinedAt: new Date() }],
  });

  user.spaceId = space._id;
  await user.save();

  return toPublicSpace(space);
}

/** Une al usuario actual a un Space existente mediante su inviteCode. */
export async function joinSpace(userId: string, input: JoinSpaceInput): Promise<PublicSpace> {
  const user = await UserModel.findById(userId);
  if (!user) throw ApiError.notFound('Usuario no encontrado');
  if (user.spaceId) throw ApiError.conflict('Ya perteneces a un espacio');

  const space = await SpaceModel.findOne({ inviteCode: input.inviteCode });
  if (!space) throw ApiError.notFound('No existe ningún espacio con ese código');

  if (space.members.some((m) => m.userId.toString() === userId)) {
    throw ApiError.conflict('Ya eres miembro de este espacio');
  }
  if (space.members.length >= MAX_SPACE_MEMBERS) {
    throw ApiError.conflict('Este espacio ya está completo');
  }

  space.members.push({ userId: new Types.ObjectId(userId), role: 'member', joinedAt: new Date() });
  await space.save();

  user.spaceId = space._id;
  await user.save();

  return toPublicSpace(space);
}

/** Devuelve el Space del usuario actual, o null si aún no tiene. */
export async function getMySpace(userId: string): Promise<PublicSpace | null> {
  const user = await UserModel.findById(userId);
  if (!user?.spaceId) return null;

  const space = await SpaceModel.findById(user.spaceId);
  if (!space) return null;

  return toPublicSpace(space);
}
