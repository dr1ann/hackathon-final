import { useState } from 'react';
import './App.css';

//import ChatComponent from './components/ChatComponent';
import HomeScreen from './components/HomeScreen';

function App() {
  const [showChat, setShowChat] = useState(false); // initially hidden

  return (
    <div>
    
      <HomeScreen />
    </div>
  );
}

export default App;
