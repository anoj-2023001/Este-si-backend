// routes/medicalHistory.routes.js

import { Router } from 'express'
import {
  createMedicalHistory,
  getMedicalHistoriesByRole,
  updateMedicalHistory,
  getMedicalHistoriesByPatient
} from './medicalHistory.controller.js'
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js'
import { medicalHistoryValidator } from '../../helpers/validators.js'

const router = Router()

router.get(
  '/patient/:patientId',
  [ validateJwt ],
  getMedicalHistoriesByPatient
)

// Crear (ADMIN)
router.post(
  '/createMedicalHistory',
  [ validateJwt, medicalHistoryValidator ],
  createMedicalHistory
)

// Listar (ADMIN & PATIENT)
router.get(
  '/getHistoriesByRole',
  [ validateJwt ],
  getMedicalHistoriesByRole
)

// Actualizar (sólo ADMIN)
router.put(
  '/updateMedicalHistory/:id',
  [ validateJwt, isAdmin ],
  updateMedicalHistory
)

export default router
