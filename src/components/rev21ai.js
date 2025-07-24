const myHeaders = new Headers();

const timestamp = new Date().toISOString(); // e.g., "2025-07-24T12:34:56.789Z"
myHeaders.append("session-id", `${timestamp}`);
myHeaders.append("Content-Type", "application/json");
myHeaders.append("x-api-key", "YjkyMjkyZDgtMWVmNy00NGZhLTg3NGUtZmQ5ODBiMzJmYzJh");

// ✅ Log the session-id value
console.log("📦 session-id header:", myHeaders.get("session-id"));

const raw = JSON.stringify({
  content: "Who invented the light bulb?",
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

fetch("https://ai-tools.rev21labs.com/api/v1/ai/chat", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log("✅ API Response:", result))
  .catch((error) => console.error("❌ API Error:", error));
