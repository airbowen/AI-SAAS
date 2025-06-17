import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AudioCapture } from './components/AudioCapture';
import { Login } from './components/Login';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/audio" element={<AudioCapture />} />
          <Route path="/" element={<Navigate to="/audio" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
