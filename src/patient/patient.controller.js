// Patient controller CORREGIDO
import Patient from './patient.model.js'
import User from '../user/user.model.js'
import mongoose from "mongoose"

// Obtener todos los pacientes con paginación
export const getAllPatients = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query

    const patients = await Patient.find()
      .populate('user', '-password')
      .skip(Number(skip))
      .limit(Number(limit))

    const total = await Patient.countDocuments()

    if (patients.length === 0) return res.status(404).send({
      success: false,
      message: 'No patients found'
    })

    return res.send({
      success: true,
      message: 'Patients retrieved successfully',
      patients,
      total
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({
      success: false,
      message: 'Error retrieving patients',
      error
    })
  }
}

// Obtener un paciente por ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params
    const patient = await Patient.findById(id).populate('user', '-password')

    if (!patient) return res.status(404).send({
      success: false,
      message: 'Patient not found'
    })

    return res.send({
      success: true,
      message: 'Patient found',
      patient
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({
      success: false,
      message: 'Error finding patient',
      error
    })
  }
}

export const getPatientByUserId = async (req, res) => {
  try {
    const userId = req.params.userId

    const patient = await Patient.findOne({ user: new mongoose.Types.ObjectId(userId) }) // ⬅ importante

    if (!patient) {
      return res.status(404).json({ success: false, message: "Paciente no encontrado" })
    }

    return res.json({ success: true, patient })
  } catch (error) {
    console.error("Error en getPatientByUserId:", error)
    return res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
}

// Actualizar datos clínicos
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Prevenir errores si frontend envía strings en lugar de arrays
    const allergies = Array.isArray(data.allergies)
      ? data.allergies
      : typeof data.allergies === 'string'
        ? data.allergies.split(',').map(s => s.trim())
        : [];

    const chronicDiseases = Array.isArray(data.chronicDiseases)
      ? data.chronicDiseases
      : typeof data.chronicDiseases === 'string'
        ? data.chronicDiseases.split(',').map(s => s.trim())
        : [];

    const updated = await Patient.findByIdAndUpdate(
      id,
      {
        bloodType: data.bloodType,
        gender: data.gender,
        phone: data.phone,
        address: data.address,
        birthDate: data.birthDate,
        allergies,
        chronicDiseases,
        // ⛔ NO actualizar el campo user — se ignora incluso si viene en req.body
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).send({ success: false, message: 'Paciente no encontrado' });
    }

    return res.send({
      success: true,
      message: 'Datos clínicos actualizados',
      patient: updated,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: 'Error al actualizar',
      error: err.message,
    });
  }
};


// Eliminar paciente
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params
    const patient = await Patient.findById(id)
    if (!patient) return res.status(404).send({ success: false, message: 'Paciente no encontrado' })

    await User.findByIdAndUpdate(patient.user, { status: false })
    await Patient.findByIdAndDelete(id)

    return res.send({ success: true, message: 'Paciente eliminado correctamente' })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ success: false, message: 'Error al eliminar paciente', error })
  }
}

// Buscar por nombre o apellido
export const searchPatientByName = async (req, res) => {
  try {
    const { name, limit = 10, skip = 0 } = req.body

    const users = await User.find({
      role: 'PATIENT',
      status: true,
      $or: [
        { name: new RegExp(name, 'i') },
        { surname: new RegExp(name, 'i') }
      ]
    })

    const patients = await Patient.find({ user: { $in: users.map(u => u._id) } })
      .populate('user', '-password')
      .skip(Number(skip))
      .limit(Number(limit))

    if (patients.length === 0) return res.status(404).send({ success: false, message: 'No matching patients found' })

    return res.send({ success: true, message: 'Patients found by name', patients, total: patients.length })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ success: false, message: 'Error searching patient by name', error })
  }
}

// Filtros (tipo de sangre, enfermedad, alergia, género)
export const filterByBloodType = async (req, res) => {
  try {
    const { bloodType, limit = 10, skip = 0 } = req.body
    const patients = await Patient.find({ bloodType })
      .populate('user', '-password')
      .skip(Number(skip)).limit(Number(limit))

    if (patients.length === 0) return res.status(404).send({ success: false, message: 'No patients with specified blood type' })

    return res.send({ success: true, message: 'Patients filtered by blood type', patients, total: patients.length })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ success: false, message: 'Error filtering by blood type', error })
  }
}

export const filterByDisease = async (req, res) => {
  try {
    const { disease, limit = 10, skip = 0 } = req.body
    const patients = await Patient.find({ chronicDiseases: disease })
      .populate('user', '-password')
      .skip(Number(skip)).limit(Number(limit))

    if (patients.length === 0) return res.status(404).send({ success: false, message: 'No patients found with specified chronic disease' })

    return res.send({ success: true, message: 'Patients filtered by chronic disease', patients, total: patients.length })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ success: false, message: 'Error filtering by chronic disease', error })
  }
}

export const filterByAllergy = async (req, res) => {
  try {
    const { allergy, limit = 10, skip = 0 } = req.body
    const patients = await Patient.find({ allergies: allergy })
      .populate('user', '-password')
      .skip(Number(skip)).limit(Number(limit))

    if (patients.length === 0) return res.status(404).send({ success: false, message: 'No patients found with specified allergy' })

    return res.send({ success: true, message: 'Patients filtered by allergy', patients, total: patients.length })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ success: false, message: 'Error filtering by allergy', error })
  }
}

export const filterByGender = async (req, res) => {
  try {
    const { gender, limit = 10, skip = 0 } = req.body
    const patients = await Patient.find({ gender })
      .populate('user', '-password')
      .skip(Number(skip)).limit(Number(limit))

    if (patients.length === 0) return res.status(404).send({ success: false, message: 'No patients found with specified gender' })

    return res.send({ success: true, message: 'Patients filtered by gender', patients, total: patients.length })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ success: false, message: 'Error filtering by gender', error })
  }
}
