// useIOSSafariFixes.js
import { useEffect } from "react";

export function useIOSSafariFixes(isIOSSafari) {
  // Fix viewport height and force redraw on iOS Safari
  useEffect(() => {
    if (isIOSSafari) {
      const updateHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
        setTimeout(() => {
          window.scrollTo(0, window.scrollY + 1);
          setTimeout(() => window.scrollTo(0, window.scrollY - 1), 50);
        }, 50);
      };
      updateHeight();
      window.addEventListener("resize", updateHeight);
      window.addEventListener("orientationchange", updateHeight);
      return () => {
        window.removeEventListener("resize", updateHeight);
        window.removeEventListener("orientationchange", updateHeight);
      };
    }
  }, [isIOSSafari]);

  // Force content to be scrollable and trigger iOS redraw
  useEffect(() => {
    if (isIOSSafari) {
      document.body.style.position = "relative";
      document.body.style.height = "auto";
      document.body.style.minHeight = "100%";
      document.body.style.overflow = "auto";
      document.body.style.overflowY = "auto";
      document.body.style.overscrollBehaviorY = "auto";
      document.documentElement.style.overflow = "auto";
      document.documentElement.style.overflowY = "auto";

      setTimeout(() => {
        window.scrollTo(0, 1);
        setTimeout(() => window.scrollTo(0, 0), 50);
      }, 100);
    }
    return () => {
      if (isIOSSafari) {
        document.body.style.position = "";
        document.body.style.height = "";
        document.body.style.minHeight = "";
        document.body.style.overflow = "";
        document.body.style.overflowY = "";
        document.body.style.overscrollBehaviorY = "";
        document.documentElement.style.overflow = "";
        document.documentElement.style.overflowY = "";
      }
    };
  }, [isIOSSafari]);
}

