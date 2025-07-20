import { Router } from 'express';
import { getAllDoctors } from './user.controller.js';
import { validateJwt } from '../../middlewares/validate.jwt.js';

const api = Router();

// Obtener todos los doctores (usuarios con rol ADMIN)
api.get(
  '/allDoctors',
  [validateJwt],
  getAllDoctors
);

export default api;
