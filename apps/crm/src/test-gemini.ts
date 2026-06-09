import "dotenv/config";

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  console.log(`API Key loaded: ${apiKey.substring(0, 4)}...`);
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.log("API Error:", data.error.message);
      return;
    }
    
    const modelNames = data.models.map((m: any) => m.name);
    console.log("Available models:");
    console.log(modelNames.join("\n"));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

listModels();
