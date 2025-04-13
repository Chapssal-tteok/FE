import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {},
};

module.exports = {
  env: {
    Pplx_API_KEY: process.env.Pplx_API_KEY,
  },
};

export default nextConfig;
