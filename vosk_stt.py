import sys
import wave
import json
from vosk import Model, KaldiRecognizer
import os

# Dil parametresi: python3 vosk_stt.py audio.wav [lang]
# Örn: python3 vosk_stt.py uploads/xyz.wav tr

# Varsayılan dil Türkçe
lang = sys.argv[2] if len(sys.argv) > 2 else "tr"

# Model yolunu belirle
model_paths = {
    "tr": "models/vosk-model-small-tr-0.3",
    "en": "models/vosk-model-small-en-us-0.15",
    "de": "models/vosk-model-small-de-0.15"
}

model_path = model_paths.get(lang)

if not model_path or not os.path.exists(model_path):
    print(f"Model path '{model_path}' not found.")
    sys.exit(1)

# Modeli yükle
model = Model(model_path)

# WAV dosyasını aç
wf = wave.open(sys.argv[1], "rb")
rec = KaldiRecognizer(model, wf.getframerate())

results = []
while True:
    data = wf.readframes(4000)
    if len(data) == 0:
        break
    if rec.AcceptWaveform(data):
        results.append(json.loads(rec.Result())["text"])

results.append(json.loads(rec.FinalResult())["text"])

# Konsola sonucu yazdır (Node.js tarafından yakalanacak)
print(" ".join(results))