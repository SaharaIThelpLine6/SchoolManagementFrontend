
import MobileView from "../components/Login/MobileView";
import DesktopView from "../components/Login/DesktopView";

const API_URL = import.meta.env.VITE_SERVER_URL;

const Login = () => {
  return (
    <div className="">
      {/* Mobile version (up to md breakpoint) */}
      <section className="md:hidden ">
        <MobileView />
      </section>

      {/* Desktop version (md breakpoint and up) */}
      <div className="hidden md:flex ">
        <DesktopView />
      </div>
    </div>
  );
};

export default Login;
