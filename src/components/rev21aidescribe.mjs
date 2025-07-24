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

const prompt = `
You are a professional vehicle inspection assistant. Based on the following description of a car or truck image:

"${visionText}"

Evaluate the *overall visible condition* of the vehicle. Focus especially on identifying *serious damage* and unsafe conditions. Consider the following:

--- STRUCTURAL / BODY DAMAGE ---
- Is any part of the vehicle crushed, twisted, or bent?
- Are there missing or detached components (e.g., bumpers, doors, panels)?
- Are wheels visibly damaged, bent, or detached?
- Is the frame exposed or visibly compromised?

--- SAFETY DAMAGE ---
- Has any airbag deployed? (This strongly indicates a serious crash)
- Is there debris, a roadside crash scene, or signs of a recent accident?
- Are windows shattered, cracked, or missing?

--- EXTERIOR CONDITION ---
- Are there scratches, dents, rust, faded or chipped paint?
- Is the surface clean or dirty? Are lights, mirrors, or tires damaged or missing?

--- ENVIRONMENT ---
- Is the vehicle parked on a road, junkyard, garage, or grassy roadside?
- Does the environment suggest the vehicle is abandoned, crashed, or under repair?

Interpret based on severity:
- Any sign of *airbag deployment*, *crushed body*, *bent frame*, or *exposed internals* = *Bad*
- Moderate dents or scratches = *Fair*
- Clean and intact vehicle = *Good* or *Excellent*

Respond with only ONE of the following ratings:
- *Excellent* (like new, no visible issues, well-maintained)
- *Good* (minor wear, no major visible damage)
- *Fair* (visible scratches, dents, or signs of aging)
- *Bad* (obvious damage, poor condition, serious issues like airbag deployment or crushed body)

Only respond with the rating word. Do not include any explanation or extra text.
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
