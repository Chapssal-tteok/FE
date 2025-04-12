import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ['http://172.24.112.1:3000'],
  },
};

module.exports = {
  env: {
    Pplx_API_KEY: process.env.Pplx_API_KEY,
  },
};


export default nextConfig;
