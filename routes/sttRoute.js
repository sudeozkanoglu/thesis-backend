import express from 'express';
import multer from 'multer';
import { handleSTT } from '../controllers/sttController.js';

const sttRouter = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

sttRouter.get("/stt/test", (req, res) => {
  res.send("STT test route is working!");
});

sttRouter.post('/stt/submit', upload.single('audio'), handleSTT);

export default sttRouter;