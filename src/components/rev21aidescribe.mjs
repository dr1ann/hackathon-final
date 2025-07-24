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

app.post("/proxy-upload", upload.array("file"), async (req, res) => {
  try {
    const descriptions = [];

    for (const file of req.files) {
      const form = new FormData();
      form.append("file", fs.createReadStream(file.path), file.originalname);

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

      const visionJson = await visionResponse.json();
      const visionText = visionJson.text?.trim() || ""; // Make sure it's just the text string
      descriptions.push(visionText);
    }

    const combinedDescription = descriptions.join("\n");
    console.log("🖼️ Image description:", combinedDescription);

    // Ensure combinedDescription is a string (in case it's accidentally a JSON object)
    const descriptionText =
      typeof combinedDescription === "string"
        ? combinedDescription
        : JSON.stringify(combinedDescription);

    // Guard clause: check if description mentions any vehicle-related keywords
    const isVehicle =
      /\b(car|tire|truck|vehicle|van|suv|jeep|automobile|bumper|door|mirror|fender|headlight|taillight|hood|windshield|tire|rim|grille|license plate|exhaust|wheel|chassis|trunk|bonnet|wiper|engine|radiator|brake pad|brake|caliper|suspension|shock absorber|spring|axle|fuel filter|oil filter|air filter|alternator|transmission|gearbox|fan belt|timing belt|turbo|intake manifold|exhaust manifold|piston|crankshaft|cylinder|camshaft|valve cover|battery|driveshaft|muffler|differential|injector|motor|ignition coil|spark plug)\b/i.test(
        descriptionText
      );

    if (!isVehicle) {
      console.warn("🚫 Not a vehicle image detected. Skipping evaluation.");
      return res.send({
        description: descriptionText,
        condition: "Not a vehicle",
      });
    }

    const prompt = `
You are a professional vehicle inspection assistant.

If the description is not about a vehicle or common vehicle component (such as engine, motor, tire, transmission, radiator, or other vehicle parts), respond with exactly: Not a vehicle

Otherwise, based on the following description of a car or truck image:

"${combinedDescription}"

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
- *Not a vehicle* (if description is not about a vehicle or vehicle parts)

Only respond with the rating word. Do not include any explanation or extra text.
`;

    const chatHeaders = {
      "session-id": new Date().toISOString(),
      "Content-Type": "application/json",
      "x-api-key": "YjkyMjkyZDgtMWVmNy00NGZhLTg3NGUtZmQ5ODBiMzJmYzJh",
    };

    const chatBody = JSON.stringify({ content: prompt });

    const chatResponse = await fetch(
      "https://ai-tools.rev21labs.com/api/v1/ai/chat",
      {
        method: "POST",
        headers: chatHeaders,
        body: chatBody,
      }
    );

    const chatText = await chatResponse.text();

    let parsedCondition = "No evaluation.";
    try {
      const parsed = JSON.parse(chatText);
      parsedCondition = parsed.content || parsedCondition;
    } catch (e) {
      console.error("Error parsing chatText:", e);
    }

    res.send({
      description: combinedDescription,
      condition: parsedCondition,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send({ error: "Proxy failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
