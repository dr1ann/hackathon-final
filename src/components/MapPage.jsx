import {
  GoogleMap,
  useLoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { Marker } from "@react-google-maps/api";
const center = { lat: 11.1768892, lng: 125.003195 }; // or use a fallback center
const mockPickup = { lat: 11.1574, lng: 124.991 }; // Palo, Leyte
const mockDestination = { lat: 11.0176, lng: 124.6075 }; // Ormoc City, Leyte

export default function MapPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBYKY5CkAeXErPuGY0WvDI8tW5o3-mG9ZA", // secure this key
  });

  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState(null);
  //   useEffect(() => {
  //     const riderRef = ref(db, "drivers/driver1/location"); // updated path
  //     const unsub = onValue(riderRef, (snapshot) => {
  //       const data = snapshot.val();
  //       if (data && data.latitude && data.longitude) {
  //         setRiderLocation({ lat: data.latitude, lng: data.longitude });
  //       }
  //     });

  //     return () => unsub();
  //   }, []);

  useEffect(() => {
    if (!isLoaded || !mockPickup) return;

    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: mockPickup,
        destination: mockDestination,
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
  }, [isLoaded, mockPickup]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="h-screen w-full">
      {eta && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded shadow text-black z-10">
          ETA: {eta}
        </div>
      )}
      <GoogleMap
        center={center}
        zoom={13}
        mapContainerStyle={{ height: "100%", width: "100%" }}
      >
        {/* Mock pickup point (A) */}
        <Marker position={mockPickup} label="A" />

        {/* Mock destination point (B) */}
        <Marker position={mockDestination} label="B" />

        {/* Route */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}
