// controllers/medicalHistory.controller.js

import MedicalHistory from './medicalHistory.model.js'
import Patient from '../patient/patient.model.js'

export const getMedicalHistoriesByPatient = async (req, res) => {
  try {
    const { patientId } = req.params

    const histories = await MedicalHistory.find({ patient: patientId })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name surname' }
      })
      .populate('doctor', 'name surname role')

    return res.status(200).json({
      success: true,
      histories
    })
  } catch (error) {
    console.error('Error al obtener historiales por paciente:', error)
    return res.status(500).json({
      success: false,
      message: 'Error al obtener historiales de este paciente',
      error: error.message
    })
  }
}

/**
 * Crea un historial médico.
 */
export const createMedicalHistory = async (req, res) => {
  try {
    const data = req.body
    const medicalHistory = new MedicalHistory(data)
    await medicalHistory.save()
    return res.json({
      success: true,
      message: 'Medical history created successfully',
      medicalHistory
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      message: 'General error when creating medical history'
    })
  }
}

export const getMedicalHistoriesByRole = async (req, res) => {
  try {
    const { role, _id: userId } = req.user
    const query = {}

    // Si no es ADMIN, buscarmos el perfil de paciente y filtramos por él
    if (role !== 'ADMIN') {
      const patientProfile = await Patient.findOne({ user: userId })
      if (!patientProfile) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de paciente no encontrado para este usuario.'
        })
      }
      query.patient = patientProfile._id
    }

    const histories = await MedicalHistory.find(query)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name surname' }
      })
      .populate('doctor', 'name surname role')

    // Siempre devolvemos 200 y un array (aunque esté vacío)
    return res.status(200).json({
      success: true,
      histories
    })
  } catch (error) {
    console.error('Error al obtener historiales médicos:', error)
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los historiales médicos',
      error: error.message
    })
  }
}

/**
 * Actualiza un historial (sólo ADMIN).
 * Requiere confirmation: "YES" en el body.
 */
export const updateMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    if (data.confirmation !== 'YES') {
      return res.status(400).json({
        success: false,
        message:
          'Confirmation not received. Please confirm with confirmation: "YES".'
      })
    }

    const updated = await MedicalHistory.findByIdAndUpdate(
      id,
      data,
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Medical history not found.'
      })
    }

    return res.json({
      success: true,
      message: 'Medical history updated successfully',
      updated
    })
  } catch (err) {
    console.error('Error updating medical history:', err)
    return res.status(500).json({
      success: false,
      message: 'Error updating medical history',
      error: err.message
    })
  }
}
