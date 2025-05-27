import { hostname } from 'os'

/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [{ protocol: 'https', hostname: '*' }],
	},
}

export default nextConfig
