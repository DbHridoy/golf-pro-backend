// In src/modules/events/events.route.ts
import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { eventController } from './events.controller';
import { eventInvitationController } from './event-invitation.controller';

const router = Router();

// Existing event routes
router.post('/', authMiddleware.authenticate, eventController.createEvent);
// ... other existing routes ...

// Invitation routes
router.post(
  '/:eventId/invite',
  authMiddleware.authenticate,
  eventInvitationController.sendInvitations
);

router.post(
  '/:eventId/accept',
  authMiddleware.authenticate,
  eventInvitationController.acceptInvitation
);

router.post(
  '/:eventId/decline',
  authMiddleware.authenticate,
  eventInvitationController.declineInvitation
);

router.get(
  '/invitations/me',
  authMiddleware.authenticate,
  eventInvitationController.getMyInvitations
);

router.delete(
  '/:eventId/invitations/:invitationId',
  authMiddleware.authenticate,
  eventInvitationController.cancelInvitation
);

export default router;