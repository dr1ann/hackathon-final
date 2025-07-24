// App.jsx
import { Routes, Route } from "react-router-dom";
import HomeScreen from "./components/HomeScreen";
import MapPage from "./components/MapPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  );
}

export default App;
