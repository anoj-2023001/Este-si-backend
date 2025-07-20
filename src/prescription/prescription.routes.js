// src/routes/prescription.routes.js
import { Router } from 'express';
import {
  getAllPrescriptions,
  getPrescriptionsByPatient,
  createPrescription,
  getPrescriptionsByRole,
  updatePrescription
} from './prescription.controller.js';
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js';

const router = Router();

router.get(
  '/all',
  [ validateJwt, isAdmin ],
  getAllPrescriptions
);

router.get(
  '/patient/:patientId',
  [ validateJwt ],
  getPrescriptionsByPatient
);

router.post(
  '/create',
  [ validateJwt ],
  createPrescription
);

router.get(
  '/getByRole',
  [ validateJwt ],
  getPrescriptionsByRole
);

router.put(
  '/update/:id',
  [ validateJwt],
  updatePrescription
);

export default router;
