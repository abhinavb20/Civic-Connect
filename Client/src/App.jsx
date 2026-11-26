import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MainRoutes from "./Routes/MainRoutes";
import BootScreen from "./ui/BootScreen";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
};

const App = () => {
  const [booting, setBooting] = useState(
    () => sessionStorage.getItem("cc_booted") !== "1"
  );
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!booting) return;
    const closeTimer = window.setTimeout(() => setClosing(true), 1150);
    const removeTimer = window.setTimeout(() => {
      sessionStorage.setItem("cc_booted", "1");
      setBooting(false);
    }, 1700);
    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [booting]);

  return (
    <>
      <ScrollToTop />
      <MainRoutes />
      {booting && <BootScreen closing={closing} />}
    </>
  );
};

export default App;
