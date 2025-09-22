import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "key_4eHVoHhKpNbAteoG"; 

app.post("/roast", async (req, res) => {
  const { prompt } = req.body;

  const response = await fetch("https://api.fireworks.ai/inference/v1/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new",
      prompt: `RoastBot: Brutally roast this feeling: "${prompt}"`,
      max_tokens: 100
    })
  });

  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
