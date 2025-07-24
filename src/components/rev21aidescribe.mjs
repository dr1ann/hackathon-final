// rev21aidescribe.mjs
import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

app.post("/proxy-upload", upload.single("file"), async (req, res) => {
  try {
    // Step 1: Prepare form with the uploaded image
    const form = new FormData();
    form.append(
      "file",
      fs.createReadStream(req.file.path),
      req.file.originalname
    );

    // Step 2: Send image to the vision API
    const visionResponse = await fetch(
      "https://ai-tools.rev21labs.com/api/v1/vision/describe-image",
      {
        method: "POST",
        headers: {
          "x-api-key": "YjkyMjkyZDgtMWVmNy00NGZhLTg3NGUtZmQ5ODBiMzJmYzJh",
          ...form.getHeaders(),
        },
        body: form,
      }
    );

    const visionText = await visionResponse.text();
    console.log("🖼️ Image description:", visionText);

    // Step 3: Build chat prompt to rate condition
    const prompt = `
You are a professional vehicle inspection assistant. Based on the following description of a truck image:

"\${visionText}"

Evaluate the overall visible condition of the truck. Consider these factors in your assessment:
- Signs of wear, dents, scratches, rust, or visible damage
- Missing or broken components
- Paint condition, surface cleanliness, and maintenance cues
- Mechanical parts: Are they dirty, oily, rusty, or clean and orderly?
- Whether the environment (e.g., workshop, outdoors) suggests active maintenance or neglect
- Presence of professional or industrial setup indicating care or neglect
- Lack of any mention of damage, rust, or wear may indicate a well-maintained vehicle

Even if the description is vague, make a judgment by interpreting:
- Cleanliness or neatness = likely Good or Excellent
- Descriptions of clutter, dirt, or industrial wear = likely Fair or Bad
- If only parts of the truck are visible (e.g., engine), assess the visible parts carefully and judge based on their apparent condition

Respond with only ONE of these ratings based on your assessment:
- Excellent (like new, no visible issues, well-maintained)
- Good (minor wear, no major visible damage)
- Fair (visible scratches, dents, or signs of aging)
- Bad (obvious damage, poor condition, or major issues)

Only respond with the rating word. No explanation or extra text.
`;

    const timestamp = new Date().toISOString();
    const chatHeaders = {
      "session-id": timestamp,
      "Content-Type": "application/json",
      "x-api-key": "YjkyMjkyZDgtMWVmNy00NGZhLTg3NGUtZmQ5ODBiMzJmYzJh",
    };

    const chatBody = JSON.stringify({
      content: prompt,
    });

    const chatResponse = await fetch(
      "https://ai-tools.rev21labs.com/api/v1/ai/chat",
      {
        method: "POST",
        headers: chatHeaders,
        body: chatBody,
        redirect: "follow",
      }
    );

    const chatText = await chatResponse.text();
    console.log("🤖 Condition Evaluation:", chatText);

    // Step 4: Respond to client
    res.send({
      description: visionText,
      condition: chatText,
    });
  } catch (error) {
    console.error("❌ Proxy error:", error);
    res.status(500).send({ error: "Proxy failed" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Proxy running at http://localhost:${PORT}`);
});
