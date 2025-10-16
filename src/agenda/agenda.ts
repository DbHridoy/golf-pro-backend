import type Job from "agenda";

import Agenda from "agenda";

import { env } from "@/env.js";
import EventModel from "@/modules/events/events.model.js";

/* One agenda instance for the whole app */
const agenda = new Agenda({
  // create its own Mongo client using the connection string
  db: { address: env.MONGO_URI, collection: "agendaJobs" },
  processEvery: "30 seconds", // optional – default is 5m
});

/* ------------------  job definitions  ------------------ */
agenda.define("start-event", async (job: Job) => {
  const { eventId } = job.attrs.data as { eventId: string };

  await EventModel.updateOne(
    { _id: eventId, status: "scheduled" },
    { $set: { status: "ongoing" } },
  );
});

agenda.define("complete-event", async (job: Job) => {
  const { eventId } = job.attrs.data as { eventId: string };

  await EventModel.updateOne(
    { _id: eventId, status: "ongoing" },
    { $set: { status: "completed" } },
  );
});

/* ------------------------------------------------------- */
let started = false;
export async function initAgenda() {
  if (!started) {
    await agenda.start();
    started = true;
  }
  return agenda;
}

export default agenda;
