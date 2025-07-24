import React, { useRef, useState } from "react";
import { CoordinateModal } from "./CoordinateModal";
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
      {condition && (
        <div className="mt-10 p-4 rounded-md border border-gray-700 bg-black text-white">
          {(() => {
            const normalized = condition.trim().toLowerCase();
            let label, bgColor;
            if (normalized === "excellent" || normalized === "good") {
              label = "✅ Allowed to Proceed";
              bgColor = "bg-green-600 hover:bg-green-700";
            } else if (normalized === "fair") {
              label = "⚠️ Proceed with Caution";
              bgColor = "bg-yellow-500 hover:bg-yellow-600 text-black";
            } else if (normalized === "bad") {
              label = "❌ Not Allowed to Proceed";
              bgColor = "bg-red-600 hover:bg-red-700";
            }

            if (label) {
              return (
                <button
                  className={`mt-3 px-4 py-2 rounded ${bgColor}`}
                  onClick={() => setModalVisible(true)}
                >
                  {label}
                </button>
              );
            }
          })()}
        </div>
      )}
      {modalVisible && (
        <CoordinateModal
          onClose={() => setModalVisible(false)}
          onSubmit={handleCoordinateSubmit}
        />
      )}
    </div>
  );
}
