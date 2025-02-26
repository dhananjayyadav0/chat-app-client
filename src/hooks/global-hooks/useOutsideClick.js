import { useEffect, useRef } from "react";

/**
 * Hook to detect clicks outside a specific element
 * @param {React.RefObject} ref - The ref of the element to monitor
 * @param {boolean} isActive - A boolean to enable/disable the listener
 * @param {Function} onOutsideClick - Callback to trigger when an outside click is detected
 */
const useOutsideClick = (ref, isActive = true, onOutsideClick) => {
  const lastClickedButtonRef = useRef(null);

  useEffect(() => {
    // Early return if required parameters are missing or invalid
    if (!ref?.current || typeof onOutsideClick !== "function") {
      console.warn("useOutsideClick: Missing or invalid parameters", {
        hasRef: Boolean(ref?.current),
        hasCallback: typeof onOutsideClick === "function",
      });
      return;
    }

    const handleClickOutside = (event) => {
      try {
        const filterButton = event.target.closest('[data-filter-btn="true"]');

        if (filterButton) {
          if (lastClickedButtonRef.current === filterButton) {
            onOutsideClick();
          }
          lastClickedButtonRef.current = filterButton;
          return;
        }

        if (ref.current && !ref.current.contains(event.target)) {
          onOutsideClick();
          lastClickedButtonRef.current = null;
        }
      } catch (error) {
        console.error("Error in useOutsideClick handler:", error);
      }
    };

    if (isActive) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      if (isActive) {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [ref, isActive, onOutsideClick]);
};

export default useOutsideClick;
