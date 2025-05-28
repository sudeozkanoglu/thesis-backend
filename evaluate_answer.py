import sys
from sentence_transformers import SentenceTransformer, util

# Komut satırından argümanlar al
if len(sys.argv) < 3:
    print("Usage: python3 evaluate_answer.py 'student_answer' 'correct_answer'")
    sys.exit(1)

student_answer = sys.argv[1]
correct_answer = sys.argv[2]

# Modeli yükle (ilk seferde zaman alabilir)
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Embed et
student_emb = model.encode(student_answer, convert_to_tensor=True)
correct_emb = model.encode(correct_answer, convert_to_tensor=True)

# Benzerliği hesapla (cosine similarity)
similarity = util.pytorch_cos_sim(student_emb, correct_emb).item()
score_percentage = round(similarity * 100, 2)

# Konsola yaz (Node.js bunu yakalayacak)
print(score_percentage)