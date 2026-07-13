import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  /* config options here */
=======
  // Dev-only: allow phone testing over LAN (Next blocks cross-origin dev
  // requests by default). Add your machine's LAN IP here if it changes
  // (ipconfig → IPv4). No effect on production builds.
  allowedDevOrigins: ["192.168.1.104"],
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
};

export default nextConfig;
