import React, { useRef, useState } from "react";
import { CoordinateModal } from "./CoordinateModal";
import { HiPlus } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
export default function RouteAdvisor() {
  const fileInputRef = useRef(null);
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const handleCoordinateSubmit = (data) => {
    console.log(data);
    navigate("/map", { state: data });
  };

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
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          className="upload-btn"
          onClick={() => fileInputRef.current.click()}
        >
          Choose Image
        </button>
        <button
          className="analyze-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>
      </div>

      <div className="result-container">
        <div className="glass-card">
          {previewImage ? (
            <img src={previewImage} alt="Uploaded" className="preview-img" />
          ) : (
            <div className="glass-placeholder">No image uploaded</div>
          )}
        </div>

        <div className="info-panel">
          <div className="info-box">
            <h2 className="font-bold">Description</h2>
            <p>{description || "No description yet."}</p>
          </div>

          <div
            className="info-box"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "16px",
                alignItems: "center",
              }}
            >
              <h2>
                <b>Condition:</b>
              </h2>

              {condition ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {getConditionTag()}
                </div>
              ) : (
                <p>No condition yet.</p>
              )}
            </div>
            <div>
              {condition && (
                <button
                  onClick={() => setModalVisible(true)}
                  style={{
                    marginTop: "15px",
                    padding: "10px 18px",
                    fontSize: "14px",
                    backgroundColor: "#007BFF",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px", // spacing between icon and text
                  }}
                >
                  <HiPlus style={{ fontSize: "16px" }} />
                  Enter Route Coordinates
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      {modalVisible && (
        <CoordinateModal
          onClose={() => setModalVisible(false)}
          onSubmit={handleCoordinateSubmit}
        />
      )}
    </div>
  );
}
