import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { UserData } from "./context/UserContext";
import { Loading } from "./components/Loading";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";
import Chat from "./pages/Chat";
import ResultsDashboard from "./pages/ResultsDashboard";
import Admin from "./pages/Admin";


const App = () => {
  const { loading, isAuth, user} = UserData(); 
  console.log(isAuth);
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          
          
          <Routes>
            <Route path="/" element={isAuth ? <Home /> : <Login />} />          
            <Route path="/chat" element={<Chat />} />
            <Route path="/results" element={<ResultsDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={isAuth ? <Home /> : <Login />} />
            {/* OTP verify route removed - registration is direct now */}
            <Route
              path="/register"
              element={ <Register />}
            />
            <Route
              path="/forgot"
              element={!isAuth ? <Forgot /> : <Home />} 
            />
            <Route
              path="/reset-password/:token"
              element={<Reset />}
            />
            

            
           
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};

export default App;