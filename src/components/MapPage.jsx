import {
  GoogleMap,
  useLoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const center = { lat: 11.1768892, lng: 125.003195 };

export default function MapPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBYKY5CkAeXErPuGY0WvDI8tW5o3-mG9ZA",
  });

  const location = useLocation();
  const { pickup, destination } = location.state || {};

  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    if (!isLoaded || !pickup || !destination) return;

    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: pickup,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (res, status) => {
        if (status === "OK") {
          setDirections(res);
          const leg = res.routes[0]?.legs[0];
          if (leg?.duration) {
            setEta(leg.duration.text);
          }
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [isLoaded, pickup, destination]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      {eta && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            color: "black",
            zIndex: 10,
          }}
        >
          ETA: {eta}
        </div>
      )}
      <GoogleMap
        center={center}
        zoom={13}
        mapContainerStyle={{ height: "100%", width: "100%" }}
      >
        {/* Route */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}
