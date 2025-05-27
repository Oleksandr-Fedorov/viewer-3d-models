'use client'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Upload, Eye, Zap } from 'lucide-react'

export default function Content() {
	// Анимация для заголовка
	const titleVariants = {
		hidden: { opacity: 0, y: -20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
	}

	// Анимация для подзаголовка
	const subtitleVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { duration: 0.6, delay: 0.3 } },
	}

	// Анимация для карточек
	const cardVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: (i: number) => ({
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				delay: 0.5 + i * 0.2,
			},
		}),
	}

	// Анимация для кнопки CTA
	const buttonVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.5, delay: 1.2 },
		},
		hover: { scale: 1.05, transition: { duration: 0.2 } },
	}

	// Категории
	const categories = [
		{
			name: 'View Models',
			href: '/canvas',
			icon: <Eye className='h-8 w-8  text-cyan-400' />,
			description: 'Browse and inspect 3D models in your browser',
		},
	]

	return (
		<main className='main-content'>
			<div className='hero-section'>
				<motion.h1
					className='main-title'
					initial='hidden'
					animate='visible'
					variants={titleVariants}
				>
					Welcome to Prisma3D
				</motion.h1>

				<motion.p
					className='main-subtitle'
					initial='hidden'
					animate='visible'
					variants={subtitleVariants}
				>
					Interactive 3D model viewer directly in your browser
				</motion.p>

				{/* Features Categories */}
				<div className='categories-grid'>
					{categories.map((category, i) => (
						<motion.div
							key={category.name}
							className='feature-card'
							custom={i}
							initial='hidden'
							animate='visible'
							variants={cardVariants}
						>
							<div className='card-icon'>{category.icon}</div>
							<h2 className='card-title'>{category.name}</h2>
							<p className='card-description'>{category.description}</p>
							<Button
								onClick={() => {
									window.location.href = category.href
								}}
								variant='outline'
								className='card-button'
							>
								Explore
							</Button>
						</motion.div>
					))}
				</div>

				{/* Call to Action */}
				<div className='cta-container'>
					<motion.div
						initial='hidden'
						animate='visible'
						whileHover='hover'
						variants={buttonVariants}
					>
						<Button size='lg' className='cta-button'>
							Start Browsing
						</Button>
					</motion.div>
				</div>
			</div>
		</main>
	)
}
