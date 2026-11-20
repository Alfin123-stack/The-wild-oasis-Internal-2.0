"use client";

import { HiMoon, HiSun } from "react-icons/hi";
import ButtonIcon from "./ButtonIcon";
import { useDarkMode } from "../context/DarkModeContext";

function DarkModeToggle() {
  const { handleDarkMode, isDarkMode } = useDarkMode();
  return (
    <ButtonIcon onClick={handleDarkMode} aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
      {isDarkMode ? <HiSun /> : <HiMoon />}
    </ButtonIcon>
  );
}

export default DarkModeToggle;
