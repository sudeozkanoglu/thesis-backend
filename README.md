# Thesis Backend

Bu proje, bir lisans tezi kapsamında geliştirilen bir web uygulamasının arka uç (backend) servislerini içermektedir.  
Node.js ve Express.js kullanılarak geliştirilmiş olup, sesli komutları işleyerek metne dönüştürme ve metni sese çevirme gibi özellikler sunmaktadır.

## Özellikler

- RESTful API mimarisi
- Vosk kütüphanesi ile ses tanıma (Speech-to-Text)
- Python tabanlı metin okuma motoru (Text-to-Speech)
- JWT ile kimlik doğrulama
- Modüler dosya yapısı (controllers, routes, middleware, models)

## Kurulum

1. **Depoyu klonlayın:**

   ```bash
   git clone https://github.com/sudeozkanoglu/thesis-backend.git
   cd thesis-backend
   npm install
   python3 -m venv tts_env 
   source tts_env/bin/activate # Linux - Mac 
   tts_env/Scripts/activate  # Windows
   pip install sentence-transformers
   pip install vosk
   pip install gTTs
   brew install ffmpeg
   npm start 

2. **Gerekli Linkler**
    - vosk-model-small-en-us-0.15 --> https://alphacephei.com/vosk/models --> English başlığı altında
    - vosk-model-small-tr-0.3 --> https://alphacephei.com/vosk/models --> Turkish başlığı altında
    - vosk-model-small-de-0.15 --> https://alphacephei.com/vosk/models --> German başlığı altında

## Proje Yapısı
    thesis-backend/
    ├── config/             # Uygulama yapılandırmaları
    ├── controllers/        # İş mantığı ve kontrolörler
    ├── middleware/         # Orta katman yazılımları (örneğin, kimlik doğrulama)
    ├── models/             # Veri modelleri
    ├── routes/             # API yönlendirme dosyaları
    ├── tts_engine.py       # Metni sese çeviren Python betiği
    ├── vosk_stt.py         # Sesi metne çeviren Python betiği
    ├── server.js           # Ana sunucu dosyası
    ├── package.json        # Proje bağımlılıkları ve betikleri
    └── .env                # Ortam değişkenleri
