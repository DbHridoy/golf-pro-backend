import { eventRepository } from "./event.repository";

class EventService {
  createEvent(data) {
    return eventRepository.createEvent(data);
  }

  getAllEvents() {
    return eventRepository.getAllEvents();
  }

  getEvent(eventId) {
    return eventRepository.getEvent(eventId);
  }

  updateEvent(eventId, data) {
    return eventRepository.updateEvent(eventId, data);
  }

  deleteEvent(eventId) {
    return eventRepository.deleteEvent(eventId);
  }
}

export const eventService = new EventService();
