import express from "express";
import { convertTextToSpeech } from "../controllers/ttsController.js";

const ttsRouter = express.Router();

ttsRouter.post('/tts', convertTextToSpeech);

export default ttsRouter;