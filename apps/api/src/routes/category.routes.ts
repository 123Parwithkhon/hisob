import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';

const router = Router();

router.use(authGuard);

router.get('/', CategoryController.list);
router.get('/:type', CategoryController.listByType);
router.post('/', validate(createCategorySchema), CategoryController.create);
router.patch('/:id', validate(updateCategorySchema), CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;