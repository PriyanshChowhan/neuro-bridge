import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import HeartHealth from "./pages/HeartHealth";
import MentalHealth from "./pages/MentalHealth";
import Test from "./pages/Test";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import "./index.css";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/heart-health" element={<HeartHealth />} />
      <Route path="/mental-health" element={<MentalHealth />} />
      <Route path="/test" element={<Test />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
