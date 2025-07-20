// src/controllers/prescription.controller.js
import Prescription from './prescription.model.js';
import Patient from '../patient/patient.model.js';
import User from '../user/user.model.js';

export const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name surname' }
      })
      .populate('doctor', 'name surname email');

    return res.status(200).json({
      success: true,
      prescriptions
    });
  } catch (error) {
    console.error('Error al obtener todas las recetas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener todas las recetas',
      error: error.message
    });
  }
};

export const getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name surname' }
      })
      .populate('doctor', 'name surname');

    return res.status(200).json({
      success: true,
      prescriptions
    });
  } catch (error) {
    console.error('Error al obtener recetas por paciente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener recetas de este paciente',
      error: error.message
    });
  }
};

/**
 * POST /v1/prescriptions/create
 * Crear una receta (sólo ADMIN)
 */
export const createPrescription = async (req, res) => {
  try {
    const { patient: patientId, doctor: doctorId, notes } = req.body;

    // Verificar paciente
    const pat = await Patient.findById(patientId);
    if (!pat) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }

    // Verificar doctor
    const doc = await User.findById(doctorId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor no encontrado' });
    }

    const prescription = new Prescription({
      patient: patientId,
      doctor: doctorId,
      notes
    });
    await prescription.save();

    return res.status(201).json({
      success: true,
      message: 'Receta creada exitosamente',
      prescription
    });
  } catch (error) {
    console.error('Error al crear la receta:', error);
    return res.status(500).json({
      success: false,
      message: 'Error general al crear la receta',
      error: error.message
    });
  }
};

/**
 * GET /v1/prescriptions/getByRole
 * ADMIN: lista todas;
 * PATIENT: lista sólo las suyas
 */
export const getPrescriptionsByRole = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const query = {};

    if (role !== 'ADMIN') {
      const patientProfile = await Patient.findOne({ user: userId });
      if (!patientProfile) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de paciente no encontrado para este usuario.'
        });
      }
      query.patient = patientProfile._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name surname' }
      })
      .populate('doctor', 'name surname');

    return res.status(200).json({
      success: true,
      prescriptions
    });
  } catch (error) {
    console.error('Error al obtener recetas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las recetas',
      error: error.message
    });
  }
};

/**
 * PUT /v1/prescriptions/update/:id
 * Actualiza una receta (sólo ADMIN)
 */
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { patient, doctor, notes } = req.body;
    const updateData = {};

    // Validar y asignar paciente si viene
    if (patient) {
      const pat = await Patient.findById(patient);
      if (!pat) {
        return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
      }
      updateData.patient = patient;
    }

    // Validar y asignar doctor si viene
    if (doctor) {
      const doc = await User.findById(doctor);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Doctor no encontrado' });
      }
      updateData.doctor = doctor;
    }

    // Asignar notas si vienen
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updated = await Prescription.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Receta no encontrada.' });
    }

    return res.json({
      success: true,
      message: 'Receta actualizada exitosamente',
      prescription: updated
    });
  } catch (error) {
    console.error('Error al actualizar la receta:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la receta',
      error: error.message
    });
  }
};
