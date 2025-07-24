import React, { useRef, useState } from "react";

export default function RouteAdvisor() {
  const fileInputRef = useRef(null);
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = () => {
    const fileInput = fileInputRef.current;

    if (!fileInput || !fileInput.files.length) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);
    setError("");
    setDescription("");
    setCondition("");

    const formdata = new FormData();
    formdata.append("file", fileInput.files[0]);

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    fetch("http://localhost:3000/proxy-upload", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);

        // Handle condition
        let parsedCondition = "No evaluation.";
        try {
          const condObj = JSON.parse(result?.condition);
          parsedCondition = condObj?.content || "No evaluation.";
        } catch (e) {
          console.error("Failed to parse condition JSON:", e);
        }

        // Handle description
        let parsedDescription = "No description.";
        try {
          const descObj = JSON.parse(result?.description);
          parsedDescription = descObj?.text || "No description.";
        } catch (e) {
          console.error("Failed to parse description JSON:", e);
        }

        setCondition(parsedCondition);
        setDescription(parsedDescription);
      })
      .catch((error) => {
        console.error("Upload error:", error);
        setError("Upload failed.");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  console.log(condition.trim().toLowerCase());
  return (
    <div style={styles.mainContainer}>
      <div style={styles.header}>AI Truck Condition Evaluator</div>

      <input type="file" accept="image/*" ref={fileInputRef} />

      <button style={styles.button} onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload & Analyze"}
      </button>

      {description && (
        <div style={styles.resultBox}>
          <strong>Description:</strong>
          <p>{description}</p>
        </div>
      )}

      {condition && (
        <div style={styles.resultBox}>
          <strong>Condition:</strong>
          <p>
            <em>{condition}</em>
          </p>
        </div>
      )}

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      {condition && (
        <div className="mt-10 p-4 rounded-md border border-gray-700 bg-black text-white">
          {(() => {
            const normalized = condition.trim().toLowerCase();
            if (normalized === "excellent" || normalized === "good") {
              return (
                <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  ✅ Allowed to Proceed
                </button>
              );
            } else if (normalized === "fair") {
              return (
                <button className="mt-3 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600">
                  ⚠️ Proceed with Caution
                </button>
              );
            } else if (normalized === "bad") {
              return (
                <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  ❌ Not Allowed to Proceed
                </button>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
}

const styles = {
  mainContainer: {
    width: "600px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "12px",
    border: "1px solid #ccc",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  header: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#0084FF",
  },
  button: {
    marginTop: "15px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#0084FF",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  resultBox: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#000000ff",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
};
