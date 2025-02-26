import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path"; // Import path to use for setting up the alias

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Set alias for src
    },
  },
  define: {
    "process.env.REACT_APP_API_URL": JSON.stringify(
      process.env.REACT_APP_API_URL
    ),
    "process.env.REACT_APP_API_HOST": JSON.stringify(
      process.env.REACT_APP_API_HOST
    ),
    "process.env.Google_Client_ID": JSON.stringify(
      process.env.Google_Client_ID
    ),
  },
});
