'use client'
import { CanvasReal } from '@/components/canvas_components/ModelViewer/app'
import { useSession } from 'next-auth/react'
export default function Home() {
	const { data: session } = useSession()
	console.log(session)
	return <CanvasReal />
}
