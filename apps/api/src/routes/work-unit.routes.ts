import { Router } from 'express';
import { WorkUnitController } from '../controllers/work-unit.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createWorkUnitSchema, updateWorkUnitSchema } from '../validators/work-unit.validator.js';

const router = Router();

router.use(authGuard);

router.get('/', WorkUnitController.list);
router.post('/', validate(createWorkUnitSchema), WorkUnitController.create);
router.patch('/:id', validate(updateWorkUnitSchema), WorkUnitController.update);
router.delete('/:id', WorkUnitController.delete);
router.get('/:id/stats', WorkUnitController.getStats);

export default router;