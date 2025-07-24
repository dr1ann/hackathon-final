import React, { useRef, useState } from "react";

export default function RouteAdvisor() {
  const fileInputRef = useRef(null);
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const handleUpload = () => {
    const fileInput = fileInputRef.current;

    if (!fileInput || !fileInput.files.length) {
      alert("Please select an image.");
      return;
    }

    const file = fileInput.files[0];
    setPreviewImage(URL.createObjectURL(file));

    setLoading(true);
    setError("");
    setDescription("");
    setCondition("");

    const formdata = new FormData();
    formdata.append("file", file);

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    fetch("http://localhost:3000/proxy-upload", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        let parsedCondition = "No evaluation.";
        try {
          const condObj = JSON.parse(result?.condition);
          parsedCondition = condObj?.content || "No evaluation.";
        } catch (e) {
          console.error("Failed to parse condition JSON:", e);
        }

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

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setPreviewImage(URL.createObjectURL(file));
  }
};

  const getConditionTag = () => {
    const normalized = condition.trim().toLowerCase();
    if (normalized === "excellent" || normalized === "good") {
      return <div className="tag success">✅ Allowed to Proceed</div>;
    } else if (normalized === "fair") {
      return <div className="tag warning">⚠️ Proceed with Caution</div>;
    } else if (normalized === "bad") {
      return <div className="tag danger">❌ Not Allowed to Proceed</div>;
    }
    return null;
  };

  return (
    <div className="page-container">
      <h1 className="title">InspectMe</h1>

      <div className="upload-section">
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }}  onChange={handleFileChange}/>
        <button className="upload-btn" onClick={() => fileInputRef.current.click()}>Choose Image</button>
        <button className="analyze-btn" onClick={handleUpload} disabled={loading}>
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>
      </div>

      <div className="result-container">
        <div className="image-panel">
          {previewImage ? (
            <img src={previewImage} alt="Uploaded" className="preview-img" />
          ) : (
            <div className="image-placeholder">No image uploaded</div>
          )}
        </div>

        <div className="info-panel">
          <div className="info-box">
            <h2>Description</h2>
            <p>{description || "No description yet."}</p>
          </div>

          <div className="info-box">
            <h2>Condition</h2>
            <p><em>{condition || "No condition yet."}</em></p>
            {condition && getConditionTag()}
          </div>
        </div>
      </div>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
