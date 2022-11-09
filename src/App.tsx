import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ActiveGame from './pages/ActiveGame';
import Home from './pages/Home';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:gameId" element={<ActiveGame />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
