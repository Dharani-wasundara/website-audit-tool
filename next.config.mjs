import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin workspace root when a parent folder has another lockfile (avoids wrong inference).
  turbopack: {
    root: __dirname,
  },
  // Dev: reduce flaky PackFileCacheStrategy on Windows / synced folders (only when using --webpack).
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
