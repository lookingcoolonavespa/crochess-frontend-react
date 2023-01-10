import { HashRouter as Router, Routes, Route } from 'react-router-dom';
// import ActiveGame from './pages/ActiveGame';
import Home from './pages/Home';
import ActiveGame from './pages/ActiveGame';
import './styles/globals.scss';
import { useState } from 'react';
import useConnectToSocket from './utils/hooks/useConnectToSocket';
import { UserContext } from './utils/contexts/UserContext';

export default function App() {
  const [user, setUser] = useState<undefined | string>();
  const socketRef = useConnectToSocket(setUser);

  return (
    <UserContext.Provider value={{ user, setUser, socket: socketRef.current }}>
      <Router>
        <Routes>
          <Route path="/:gameId" element={<ActiveGame />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}
