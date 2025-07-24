import React, { useRef, useState } from "react";
import { CoordinateModal } from "./CoordinateModal";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
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

        // Directly use result.condition if it's plain text (e.g., "Not a vehicle")
        if (typeof result.condition === "string") {
          const raw = result.condition.trim();

          try {
            // Try to parse it as JSON
            const condObj = JSON.parse(raw);
            parsedCondition = condObj?.content || raw;
          } catch {
            // If not JSON, use the raw string
            parsedCondition = raw;
          }
        }

        let parsedDescription = "No description.";

        // Try to parse description
        if (typeof result.description === "string") {
          try {
            const descObj = JSON.parse(result.description);
            parsedDescription = descObj?.text || result.description;
          } catch {
            parsedDescription = result.description;
          }
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
      return <div className="tag success">Allowed to Proceed</div>;
    } else if (normalized === "fair") {
      return <div className="tag warning">Proceed with Caution</div>;
    } else if (normalized === "bad") {
      return <div className="tag danger">Not Allowed to Proceed</div>;
    } else if (normalized === "not a vehicle") {
      return <div className="tag info">🚫 Not a vehicle image detected</div>;
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
              <h4 className="!text-[##333] font-bold">Condition:</h4>

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
            {condition?.trim().toLowerCase() == "bad" && (
              <div className="flex items-start gap-2 mt-4 text-yellow-700 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mt-0.5 flex-shrink-0 text-yellow-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.68-1.36 3.445 0l6.518 11.598c.75 1.336-.213 3.003-1.723 3.003H3.462c-1.51 0-2.473-1.667-1.723-3.003L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a.75.75 0 01-.75-.75V8a.75.75 0 011.5 0v2.25A.75.75 0 0110 11z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  This component appears to be significantly damaged and should
                  be replaced promptly to ensure safety and performance.
                </span>
              </div>
            )}

            <div>
              {(() => {
                const normalized = condition.trim().toLowerCase();
                if (
                  normalized === "excellent" ||
                  normalized === "good" ||
                  normalized === "fair"
                ) {
                  return (
                    <Link
                      to="/map"
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
                        width: "fit-content",
                        gap: "8px",
                      }}
                    >
                      <FaEye style={{ fontSize: "16px" }} />
                      Available Routes
                    </Link>
                  );
                }
                return null;
              })()}
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
