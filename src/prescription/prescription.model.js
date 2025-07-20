import { Schema, model } from 'mongoose';

const prescriptionSchema = new Schema(
  {
    // Paciente al que va dirigida la receta
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },

    // Doctor (Usuario) que emite la receta
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor is required'],
    },

    // Fecha de emisión (por defecto se pone Date.now)
    issuedAt: {
      type: Date,
      default: Date.now,
    },

    // Notas adicionales
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default model('Prescription', prescriptionSchema);
