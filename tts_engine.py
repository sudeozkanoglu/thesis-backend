from gtts import gTTS
import sys
import subprocess

text = sys.argv[1] if len(sys.argv) > 1 else "Varsayılan metin"
lang = sys.argv[2] if len(sys.argv) > 2 else "tr"
dosya_adi = "output.mp3"

# gTTS ile normal hızda mp3 oluştur
tts = gTTS(text=text, lang=lang)
tts.save(dosya_adi)

# Sadece Türkçeyse ffmpeg ile hızlandır
if lang == "tr":
    hızlı_dosya = "output_fast.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-i", dosya_adi,
        "-filter:a", "atempo=1.2",  # %20 hızlandırma
        hızlı_dosya
    ])
    print("[✔] Hızlandırılmış ses üretildi: output_fast.mp3")
else:
    print("[✔] Normal ses üretildi: output.mp3")