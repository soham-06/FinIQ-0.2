import express from 'express';
import { getNote, saveNote } from '../controllers/noteController.js';

const router = express.Router();

router.get('/', getNote);
router.post('/', saveNote);

export default router;
