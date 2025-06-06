import { AudioCapture } from './components/AudioCapture';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>音频共享</h1>
        <AudioCapture />
      </header>
    </div>
  );
}

export default App;
