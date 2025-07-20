import User from './user.model.js';

// Obtener todos los usuarios con rol ADMIN (doctores)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'ADMIN', status: true }).select('name surname email');

    if (!doctors.length) {
      return res.status(404).json({
        success: false,
        message: 'No doctors (admins) found.'
      });
    }

    res.json({
      success: true,
      total: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching doctors.',
      error: error.message
    });
  }
};
