import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './page/login.jsx';
import Register from './page/register.jsx';
import Dashboard from './page/dashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App
