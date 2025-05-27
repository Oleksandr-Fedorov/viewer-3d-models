import { hostname } from 'os'

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [{ protocol: 'https', hostname: '*' }],
	},
}

export default nextConfig
