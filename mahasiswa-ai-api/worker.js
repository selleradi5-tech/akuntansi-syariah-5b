export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(request.url);
    if (url.pathname !== "/api/chat" || request.method !== "POST") {
      return new Response(JSON.stringify({ok:true,service:"MahasiswaAI API",version:"2.1"}), {
        headers: {"Content-Type":"application/json", ...cors}
      });
    }

    try {
      const body = await request.json();
      const message = String(body.message || "").trim();
      const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
      if (!message) return new Response(JSON.stringify({error:"Pesan kosong."}), {status:400,headers:{"Content-Type":"application/json",...cors}});
      if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({error:"Backend belum dikonfigurasi. Tambahkan GEMINI_API_KEY sebagai secret Worker."}), {status:503,headers:{"Content-Type":"application/json",...cors}});

      const contents = [
        ...history.filter(x => x && (x.role === "user" || x.role === "model") && x.parts?.[0]?.text),
        { role:"user", parts:[{text:message}] }
      ];

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
            "x-goog-api-key":env.GEMINI_API_KEY
          },
          body:JSON.stringify({
            system_instruction:{parts:[{text:"Kamu adalah MahasiswaAI, asisten AI untuk mahasiswa Indonesia. Jawab dalam bahasa Indonesia yang natural, jelas, praktis, dan akademik bila diperlukan. Jangan mengarang sumber. Jika pengguna meminta bantuan tugas, bantu memahami dan menyusun jawaban, bukan sekadar menyalin tanpa penjelasan."}]},
            contents,
            generationConfig:{temperature:0.7,maxOutputTokens:2048}
          })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        return new Response(JSON.stringify({error:data?.error?.message || "Provider AI mengembalikan error."}), {status:502,headers:{"Content-Type":"application/json",...cors}});
      }

      const reply = data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("") || "Maaf, AI tidak menghasilkan jawaban.";
      return new Response(JSON.stringify({reply,model:"gemini-2.5-flash"}), {headers:{"Content-Type":"application/json",...cors}});
    } catch (e) {
      return new Response(JSON.stringify({error:"Terjadi kesalahan pada server.",detail:String(e?.message||e)}), {status:500,headers:{"Content-Type":"application/json",...cors}});
    }
  }
};