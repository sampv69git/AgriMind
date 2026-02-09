import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NavBar } from "./NavBar";
import VoiceAssistantButton from "./VoiceAssistantButton";

const Layout = () => {
  // We still initialize auth (for navbar state), but do not gate content
  useAuth();
  return (
    <div>
      <NavBar />
      <main>
        <Outlet />
      </main>
      <VoiceAssistantButton />
    </div>
  );
};

export default Layout;
