import agenda from "./agenda.js";

export async function scheduleEventJobs(event: any) {
  /* ensure uniqueness so rescheduling doesn’t create dupes */
  await agenda.cancel({ "data.eventId": event._id });

  await agenda.schedule(event.startsAt, "start-event", { eventId: event._id });
  if (event.endsAt)
    await agenda.schedule(event.endsAt, "complete-event", { eventId: event._id });
}

export async function cancelEventJobs(eventId: string) {
  await agenda.cancel({ "data.eventId": eventId });
}
