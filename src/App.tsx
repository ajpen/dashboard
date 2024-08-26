import './App.css';
import { WeatherWidget } from './weather';


function App() {
  return (
    <div className="App">
<div className="w-full max-w-4xl mx-auto bg-blue-600 text-white rounded-xl pt-2 p-2">
        <WeatherWidget />
        </div>
    </div>
  );
}

export default App;
