import {
  GoogleMap,
  useLoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 12.8797, // Center of Philippines
  lng: 121.774,
};

export default function MapComponent() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBYKY5CkAeXErPuGY0WvDI8tW5o3-mG9ZA",
  });

  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (!isLoaded) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: 10.3157, lng: 123.8854 },
        destination: { lat: 11.0517, lng: 124.0044 },
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (result, status) => {
        if (status === "OK" && result.routes.length > 0) {
          setRoutes(result.routes);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [isLoaded]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="h-screen w-full relative">
      <GoogleMap
        center={center}
        zoom={14}
        mapContainerStyle={{ height: "100%", width: "100%" }}
      >
        {routes.map((route, index) => (
          <DirectionsRenderer
            key={index}
            directions={{
              routes: [route],
              request: {
                origin: "Makati City, Philippines",
                destination: "Quezon City, Philippines",
                travelMode: window.google.maps.TravelMode.DRIVING,
              },
            }}
            options={{
              polylineOptions: {
                strokeColor:
                  index === 0 ? "#ff0000" : index === 1 ? "#0000ff" : "#00ff00",
                strokeWeight: 4,
              },
              suppressMarkers: false,
            }}
          />
        ))}
      </GoogleMap>

      {/* 👇 Display ETAs */}
      <div className="absolute top-4 right-4 bg-white shadow-lg rounded p-4 z-10 space-y-2">
        <h2 className="font-bold text-lg">Estimated Time of Arrival:</h2>
        {routes.map((route, index) => {
          const duration = route?.legs?.[0]?.duration?.text || "N/A";
          return (
            <div key={index} className="text-sm">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor:
                    index === 0
                      ? "#ff0000"
                      : index === 1
                      ? "#0000ff"
                      : "#00ff00",
                }}
              />
              Route {index + 1}: {duration}
            </div>
          );
        })}
      </div>
    </div>
  );
}
