import { Router } from 'express';
import { GoalController } from '../controllers/goal.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createGoalSchema, updateGoalSchema, contributeGoalSchema } from '../validators/goal.validator.js';

export const router: Router = Router();

router.use(authGuard);

router.get('/', GoalController.list);
router.post('/', validate(createGoalSchema), GoalController.create);
router.patch('/:id', validate(updateGoalSchema), GoalController.update);
router.post('/:id/contribute', validate(contributeGoalSchema), GoalController.contribute);
router.delete('/:id', GoalController.delete);

export default router;