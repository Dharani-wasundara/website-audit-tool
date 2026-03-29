/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid flaky PackFileCacheStrategy / missing vendor-chunks on Windows (esp. OneDrive folders).
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
