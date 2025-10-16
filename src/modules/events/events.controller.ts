import { HTTPSTATUS } from "@/config/http.config";

import { eventService } from "./event.service";

class EventController {
  createEvent = async (req, res) => {
    const { body } = req;
    const result = await eventService.createEvent(body);
    return res.status(HTTPSTATUS.CREATED).json(result);
  };

  getAllEvents = async (req, res) => {
    const result = await eventService.getAllEvents();
    return res.status(HTTPSTATUS.OK).json(result);
  };

  geteventById = async (req, res) => {
    const { id } = req.params;
    const result = await eventService.getEventById(id);
    return res.status(HTTPSTATUS.OK).json(result);
  };

  getEventWithInvitations = asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.getEventWithInvitations(
      req.params.eventId,
      req.user!.userId,
    );
    res.json({ success: true, data: event });
  });

  updateEvent = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const result = await eventService.updateEvent(id, body);
    return res.status(HTTPSTATUS.OK).json(result);
  };

  deleteEvent = async (req, res) => {
    const { id } = req.params;
    const result = await eventService.deleteEvent(id);
    return res.status(HTTPSTATUS.OK).json(result);
  };
}

export const eventController = new EventController();
