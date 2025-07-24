import { useState } from "react";

export function CoordinateModal({ onClose, onSubmit }) {
  const [pickup, setPickup] = useState({ lat: "", lng: "" });
  const [destination, setDestination] = useState({ lat: "", lng: "" });

  const handleSubmit = () => {
    if (!pickup.lat || !pickup.lng || !destination.lat || !destination.lng) {
      alert("All fields are required.");
      return;
    }

    onSubmit({
      pickup: {
        lat: parseFloat(pickup.lat),
        lng: parseFloat(pickup.lng),
      },
      destination: {
        lat: parseFloat(destination.lat),
        lng: parseFloat(destination.lng),
      },
    });

    onClose();
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2 style={modalStyles.heading}>Enter Route Coordinates</h2>

        <div style={modalStyles.inputGroup}>
          <label style={modalStyles.label}>Pickup Latitude</label>
          <input
            style={modalStyles.input}
            type="number"
            value={pickup.lat}
            onChange={(e) => setPickup({ ...pickup, lat: e.target.value })}
          />
        </div>

        <div style={modalStyles.inputGroup}>
          <label style={modalStyles.label}>Pickup Longitude</label>
          <input
            style={modalStyles.input}
            type="number"
            value={pickup.lng}
            onChange={(e) => setPickup({ ...pickup, lng: e.target.value })}
          />
        </div>

        <div style={modalStyles.inputGroup}>
          <label style={modalStyles.label}>Destination Latitude</label>
          <input
            style={modalStyles.input}
            type="number"
            value={destination.lat}
            onChange={(e) =>
              setDestination({ ...destination, lat: e.target.value })
            }
          />
        </div>

        <div style={modalStyles.inputGroup}>
          <label style={modalStyles.label}>Destination Longitude</label>
          <input
            style={modalStyles.input}
            type="number"
            value={destination.lng}
            onChange={(e) =>
              setDestination({ ...destination, lng: e.target.value })
            }
          />
        </div>

        <div style={modalStyles.buttonGroup}>
          <button style={modalStyles.buttonPrimary} onClick={handleSubmit}>
            Submit
          </button>
          <button style={modalStyles.buttonSecondary} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "100vw",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "420px",
    boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    marginBottom: "20px",
    fontSize: "20px",
    fontWeight: "600",
    textAlign: "center",
    color: "black",
  },
  inputGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "transparent",
    color: "black",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  buttonPrimary: {
    padding: "10px 18px",
    fontSize: "14px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  buttonSecondary: {
    padding: "10px 18px",
    fontSize: "14px",
    backgroundColor: "#f0f0f0",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
};
