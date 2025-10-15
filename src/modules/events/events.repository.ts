import EventModel from "./event.model";

class EventRepository {
  createEvent(data) {
    return EventModel.create(data);
  }

  getAllEvents() {
    return EventModel.find();
  }
getEvent(eventId) {
  return EventModel.findById(eventId);
}
  updateEvent(eventId, data) {
    return EventModel.findByIdAndUpdate(eventId, data);
  }

  deleteEvent(eventId) {
    return EventModel.findByIdAndDelete(eventId);
  }
}

export const eventRepository = new EventRepository();
