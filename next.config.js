/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    devIndicators: false,
    productionBrowserSourceMaps: true,
    experimental: {
        serverActions: {
            bodySizeLimit: '25mb',
        },
        reactCompiler: true,
    },
    images: {
        remotePatterns: [{ hostname: "localhost" }]
    },
    eslint: {
        dirs: ['./src'],
        //ignoreDuringBuilds: true, // Ignore ESLint errors during build
    },

};

export default config;
