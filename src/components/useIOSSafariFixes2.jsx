// useIOSSafariFixes2.js

import { useEffect } from "react";

export function useIOSSafariFixes2(isIOSSafari, setContentReady, setFallbackActive) {
  useEffect(() => {
    if (isIOSSafari) {
      setContentReady(true);
      setFallbackActive(true);
      document.documentElement.classList.add("ios-safari");
      document.body.style =
        "position: static !important; height: auto !important; overflow: auto !important; -webkit-overflow-scrolling: touch !important;";
      document.documentElement.style =
        "position: static !important; height: auto !important; overflow: auto !important;";
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
    }
    return () => {
      if (isIOSSafari) {
        document.documentElement.classList.remove("ios-safari");
      }
    };
  }, [isIOSSafari, setContentReady, setFallbackActive]);
}
