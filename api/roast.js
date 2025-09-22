export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const API_KEY = process.env.FIREWORKS_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "No FIREWORKS_API_KEY found in env" });
  }

  console.log("🔑 FIREWORKS_API_KEY length:", API_KEY.length);

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Missing 'message' in request body" });
  }

  // Fireworks endpoints
  const CHAT_URL = "https://api.fireworks.ai/inference/v1/chat/completions";
  const COMP_URL = "https://api.fireworks.ai/inference/v1/completions";
  const MODEL = "accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new";

  async function callFireworks(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    return response;
  }

  try {
    
    let response = await callFireworks(CHAT_URL, {
      model: MODEL,
      max_tokens: 300,
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content: `You are Dobby, the savage roast AI.
- Roast the user’s message with witty, sarcastic humor.
- Keep it short, funny, and brutal — but not unsafe.
- Example: "Bro, even your WiFi signal has more strength than you."`,
        },
        { role: "user", content: message },
      ],
    });

    if (response.status === 401) {
      
      console.warn("⚠️ Chat endpoint unauthorized, retrying with completions...");
      response = await callFireworks(COMP_URL, {
        model: MODEL,
        prompt: `Roast this brutally (short, funny, witty, safe): ${message}`,
        max_tokens: 300,
        temperature: 0.9,
      });
    }

    if (!response.ok) {
      const details = await response.text();
      return res.status(response.status).json({ error: "Fireworks API error", details });
    }

    const data = await response.json();
    console.log("🔥 Fireworks response:", JSON.stringify(data, null, 2));

    const roast =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      null;

    if (!roast) {
      return res.status(500).json({ error: "No roast from Dobby", raw: data });
    }

    return res.status(200).json({ roast });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Internal error", details: err.message });
  }
}
