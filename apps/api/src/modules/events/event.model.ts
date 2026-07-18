import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';
import { EVENT_TYPE_COLORS, type PublicCalendarEvent } from 'shared';

export interface EventDocument {
  spaceId: Types.ObjectId;
  title: string;
  type: 'birthday' | 'special' | 'other';
  color: string;
  date: Date;
  recurrence: 'none' | 'weekly' | 'monthly' | 'yearly';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type EventHydrated = HydratedDocument<EventDocument>;

const eventSchema = new Schema<EventDocument>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['birthday', 'special', 'other'], required: true },
    color: { type: String, required: true },
    date: { type: Date, required: true },
    recurrence: {
      type: String,
      enum: ['none', 'weekly', 'monthly', 'yearly'],
      default: 'none',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const EventModel: Model<EventDocument> = model<EventDocument>('CalendarEvent', eventSchema);

export function defaultColorFor(type: EventDocument['type']): string {
  return EVENT_TYPE_COLORS[type];
}

export function toPublicEvent(event: EventHydrated): PublicCalendarEvent {
  return {
    id: event._id.toString(),
    spaceId: event.spaceId.toString(),
    title: event.title,
    type: event.type,
    color: event.color,
    date: event.date.toISOString(),
    recurrence: event.recurrence,
    createdBy: event.createdBy.toString(),
    createdAt: event.createdAt.toISOString(),
  };
}
