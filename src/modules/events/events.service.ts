import { cancelEventJobs, scheduleEventJobs } from "@/agenda/event-jobs";
import { notificationService } from "@/modules/notification/notification.service";

import EventModel from "./events.model";

export async function createEvent(dto: CreateEventDto) {
  const event = await EventModel.create(dto);
  await scheduleEventJobs(event);
  return event;
}

export async function updateEvent(id: string, dto: UpdateEventDto) {
  const event = await EventModel.findByIdAndUpdate(id, dto, { new: true });
  if (!event)
    throw new Error("Event not found");

  /* reschedule in case startsAt or endsAt changed */
  await scheduleEventJobs(event);
  return event;
}
  async getEventWithInvitations(eventId: string, userId: string) {
    const event = await EventModel.findOne({
      _id: eventId,
      $or: [
        { createdBy: userId },
        { members: userId },
        { 'invitations.invitee': userId }
      ]
    }).populate('members', 'name email profileImage')
      .populate('createdBy', 'name email')
      .populate('invitations.invitee', 'name email profileImage')
      .populate('invitations.inviter', 'name email');

    if (!event) {
      throw new Error('Event not found or access denied');
    }

    return event;
  }
export async function cancelEvent(id: string) {
  await EventModel.findByIdAndUpdate(id, { status: "cancelled" });
  await cancelEventJobs(id);
}

export async function createEvent(dto: CreateEventDto) {
  const event = await EventModel.create(dto);
  await scheduleEventJobs(event);

  // Send notifications to club members
  try {
    // You'll need to get club members and send notifications
    // This is a simplified example
    const clubMembers = await getClubMembers(dto.clubId);
    for (const member of clubMembers) {
      await notificationService.createAndSendNotification({
        recipientId: member._id.toString(),
        type: "event_created",
        title: "New Event Created",
        body: `${dto.name} event has been created`,
        payload: {
          eventId: event._id.toString(),
          eventName: dto.name,
        },
      });
    }
  }
  catch (error) {
    console.error("Failed to send event notifications:", error);
  }

  return event;
}
