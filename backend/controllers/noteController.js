import Note from '../models/noteModel.js';
const userId = "6846c99d5b01a276e0ea2a17"; // temp for testing

export const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ userId });
    res.status(200).json(note || { content: "" });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve note" });
  }
};

export const saveNote = async (req, res) => {
  try {
    const { content } = req.body;
    const note = await Note.findOneAndUpdate(
      { userId },
      { content },
      { new: true, upsert: true }
    );
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to save note" });
  }
};