import { hostname } from 'os'

/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		// Отключаем TypeScript проверку во время сборки
		ignoreBuildErrors: true,
	},
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [{ protocol: 'https', hostname: '*' }],
	},
}

export default nextConfig
