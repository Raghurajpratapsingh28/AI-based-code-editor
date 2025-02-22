import { useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import CodeEditor from "./components/CodeEditor";
import Login from "./components/Login";
import SignUp from "./components/SignUp";

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  return token ? element : null;
};

function App() {
  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
      <Router>
        <Routes>
          {/* Redirect "/" to "/login" if no token exists */}
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protect CodeEditor route so only logged-in users can access it */}
          <Route path="/editor" element={<ProtectedRoute element={<CodeEditor />} />} />
        </Routes>
      </Router>
    </Box>
  );
}

export default App;
