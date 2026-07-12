import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createReminderSchema, updateReminderSchema } from '../validators/notification.validator.js';

export const router: Router = Router();

router.use(authGuard);

// Notifications
router.get('/', NotificationController.list);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/:id/read', NotificationController.markAsRead);
router.patch('/read-all', NotificationController.markAllAsRead);
router.delete('/:id', NotificationController.delete);

// Reminders
router.get('/reminders', NotificationController.listReminders);
router.post('/reminders', validate(createReminderSchema), NotificationController.createReminder);
router.patch('/reminders/:id', validate(updateReminderSchema), NotificationController.updateReminder);
router.delete('/reminders/:id', NotificationController.deleteReminder);

export default router;