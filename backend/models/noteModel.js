import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true,
    default: ''
  }
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);
export default Note;