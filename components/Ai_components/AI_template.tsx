import Image from 'next/image'
import OpenAi from 'openai'
import axios from 'axios'
import { useRef, useState } from 'react'
import { Card, CardContent, Input, Button } from '@mui/material'

import Main_title from '@/components/modules/Main_page/Main_title'
export default function Home() {
	const [msg, setMsg] = useState<Array<{ role: string; content: string }>>([])
	const [isLoading, setIsLoading] = useState(false)
	const input = useRef<HTMLInputElement>(null)

	const handleSubmit = async (e: any) => {
		e.preventDefault()
		const userMessage = input.current?.value
		if (!userMessage?.trim()) return

		setIsLoading(true)
		setMsg((prev: any) => [...prev, { role: 'user', content: userMessage }])

		try {
			const response = await fetch(
				'https://openrouter.ai/api/v1/chat/completions',
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
						'HTTP-Referer': 'http://localhost:3000',
						'X-Title': '3d-models-app',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: 'deepseek/deepseek-r1-distill-llama-70b:free',
						messages: [...msg, { role: 'user', content: userMessage }],
					}),
				}
			)

			const data = await response.json()
			const aiResponse = data.choices[0].message.content

			setMsg(prev => [...prev, { role: 'assistant', content: aiResponse }])
		} catch (error) {
			console.error('Error:', error)
			setMsg(prev => [
				...prev,
				{
					role: 'assistant',
					content: 'Извините, произошла ошибка при получении ответа.',
				},
			])
		}

		setIsLoading(false)

		input.current!.value = ''
	}

	return (
		<div className='max-w-2xl mx-auto p-4'>
			<Card className='mb-4'>
				<CardContent className='p-4'>
					<div className='space-y-4 mb-4 max-h-[400px] overflow-y-auto'>
						{msg.map((message, index) => (
							<div
								key={index}
								className={`p-3 rounded-lg ${
									message.role === 'user'
										? 'bg-blue-100 ml-auto max-w-[80%]'
										: 'bg-gray-100 mr-auto max-w-[80%]'
								}`}
							>
								{message.content}
							</div>
						))}
					</div>

					<form onSubmit={handleSubmit} className='flex gap-2'>
						<Input
							ref={input}
							placeholder='Введите ваше сообщение...'
							className='flex-1'
							disabled={isLoading}
						/>
						<Button type='submit' disabled={isLoading}>
							{isLoading ? 'Отправка...' : 'Отправить'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
