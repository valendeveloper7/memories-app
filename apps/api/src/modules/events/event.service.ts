import { Types } from 'mongoose';
import type { CreateEventInput, PublicCalendarEvent, UpdateEventInput } from 'shared';
import { ApiError } from '../../utils/ApiError.js';
import { EventModel, defaultColorFor, toPublicEvent } from './event.model.js';

interface Scope {
  spaceId: string;
  userId: string;
}

export async function listEvents(spaceId: string): Promise<PublicCalendarEvent[]> {
  const events = await EventModel.find({ spaceId }).sort({ date: 1 });
  return events.map(toPublicEvent);
}

export async function createEvent(
  scope: Scope,
  input: CreateEventInput,
): Promise<PublicCalendarEvent> {
  const event = await EventModel.create({
    spaceId: new Types.ObjectId(scope.spaceId),
    createdBy: new Types.ObjectId(scope.userId),
    title: input.title,
    type: input.type,
    color: input.color ?? defaultColorFor(input.type),
    date: new Date(input.date),
    recurrence: input.recurrence,
  });
  return toPublicEvent(event);
}

export async function updateEvent(
  scope: Scope,
  id: string,
  input: UpdateEventInput,
): Promise<PublicCalendarEvent> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Evento no encontrado');
  const update: Record<string, unknown> = { ...input };
  if (input.date) update.date = new Date(input.date);
  const event = await EventModel.findOneAndUpdate(
    { _id: id, spaceId: scope.spaceId },
    { $set: update },
    { new: true, runValidators: true },
  );
  if (!event) throw ApiError.notFound('Evento no encontrado');
  return toPublicEvent(event);
}

export async function deleteEvent(scope: Scope, id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Evento no encontrado');
  const result = await EventModel.deleteOne({ _id: id, spaceId: scope.spaceId });
  if (result.deletedCount === 0) throw ApiError.notFound('Evento no encontrado');
}
