# MahasiswaAI API V2.1

Backend aman untuk halaman GitHub Pages MahasiswaAI.

## Arsitektur

GitHub Pages (frontend) -> Cloudflare Worker (backend) -> Gemini API

API key **tidak** disimpan di HTML atau GitHub. Simpan sebagai Worker Secret bernama:

GEMINI_API_KEY

## Deploy

1. Buat akun Cloudflare.
2. Buka Workers & Pages dan buat Worker bernama mahasiswa-ai-api.
3. Upload/isi worker.js dan wrangler.toml dari folder ini, atau deploy dengan Wrangler.
4. Tambahkan secret GEMINI_API_KEY pada Worker.
5. Salin URL Worker, misalnya https://mahasiswa-ai-api.<subdomain>.workers.dev
6. Isi URL tersebut pada konstanta AI_API_URL di mahasiswa-ai.html.

## Catatan limit

MahasiswaAI sendiri tidak menerapkan batas jumlah chat. Namun layanan hosting dan provider AI tetap memiliki batas/rate limit atau biaya. Workers Free saat ini memiliki 100.000 request/hari, sedangkan Gemini memiliki rate limit yang bergantung pada project/model. Karena itu istilah yang aman adalah "tanpa limit buatan aplikasi", bukan "AI provider unlimited".
