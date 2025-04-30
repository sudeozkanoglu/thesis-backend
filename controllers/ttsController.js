// import { exec } from 'child_process';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // __dirname yerine aşağıdaki ES Module çözümünü kullan
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const convertTextToSpeech = (req, res) => {
//   const text = req.body.text;
//   const pythonPath = 'python3';
//   const scriptPath = path.join(__dirname, '..', 'tts_engine.py');

//   exec(`${pythonPath} "${scriptPath}" "${text}"`, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Hata: ${error.message}`);
//       return res.status(500).json({ error: 'TTS işlemi başarısız' });
//     }

//     const audioPath = path.join(__dirname, '..', 'output.wav');
//     res.sendFile(audioPath);
//   });
// };

import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { franc } from "franc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Haritalama: franc -> gTTS dil kodları
const langMap = {
  eng: "en",
  tur: "tr",
};

export const convertTextToSpeech = (req, res) => {
  const text = req.body.text;

  const francCode = franc(text);
  const lang = langMap[francCode] || "en"; // varsayılanı İngilizce yap

  const pythonPath = "python3";
  const scriptPath = path.join(__dirname, "..", "tts_engine.py");

  exec(
    `${pythonPath} "${scriptPath}" "${text}" "${lang}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Hata: ${error.message}`);
        return res.status(500).json({ error: "TTS işlemi başarısız" });
      }

      const audioPath = path.join(
        __dirname,
        "..",
        lang === "tr" ? "output_fast.mp3" : "output.mp3"
      );
      res.setHeader("Content-Type", "audio/mpeg");
      res.sendFile(audioPath);
    }
  );
};
