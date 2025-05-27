'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
	Home,
	Mail,
	Phone,
	MapPin,
	Clock,
	Send,
	Facebook,
	Twitter,
	Instagram,
	Linkedin,
	MessageSquare,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import './styles.css'

const ContactPage = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitSuccess, setSubmitSuccess] = useState(false)
	const [submitError, setSubmitError] = useState('')

	const handleChange = e => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setIsSubmitting(true)
		setSubmitError('')

		try {
			// Simulate form submission with a timeout
			await new Promise(resolve => setTimeout(resolve, 1500))

			// In a real application, you would send the data to your backend:
			// const response = await api.post('/api/contact', formData)

			setSubmitSuccess(true)
			setFormData({
				name: '',
				email: '',
				subject: '',
				message: '',
			})
		} catch (error) {
			setSubmitError(
				'There was an error submitting your message. Please try again.'
			)
			console.error('Contact form submission error:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='main-page-container'>
			{/* Page Header */}
			<header className='main-header'>
				<div className='header-content flex justify-between items-center'>
					<Link href='/' className='logo-text flex items-center'>
						<Home className='h-5 w-5 mr-2' />
						<span>Prisma3D</span>
					</Link>

					<div className='flex items-center'>
						<Link href='/' className='nav-icon-btn mr-3'>
							<Home className='h-5 w-5' />
						</Link>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className='main-content'>
				<div className='mb-12 text-center'>
					<h1 className='main-title'>Contact Us</h1>
					<p className='main-subtitle mx-auto'>
						Have questions or need assistance? We're here to help! Reach out to
						our team using any of the methods below.
					</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					{/* Contact Info Section */}
					<div className='feature-card'>
						<div className='w-full mb-8'>
							<h2 className='card-title text-left flex items-center mb-6'>
								<MessageSquare className='mr-2 h-6 w-6' />
								Get in Touch
							</h2>

							<div className='space-y-6'>
								<div className='flex items-start'>
									<div className='card-icon w-10 h-10 mr-4 flex items-center justify-center'>
										<Mail className='h-5 w-5 text-cyan-400' />
									</div>
									<div className='text-left'>
										<h4 className='text-white font-medium mb-1'>Email</h4>
										<a
											href='mailto:info@prisma3d.com'
											className='text-gray-300 hover:text-cyan-400 transition-colors'
										>
											info@prisma3d.com
										</a>
									</div>
								</div>

								<div className='flex items-start'>
									<div className='card-icon w-10 h-10 mr-4 flex items-center justify-center'>
										<Phone className='h-5 w-5 text-cyan-400' />
									</div>
									<div className='text-left'>
										<h4 className='text-white font-medium mb-1'>Phone</h4>
										<a
											href='tel:+1234567890'
											className='text-gray-300 hover:text-cyan-400 transition-colors'
										>
											+1 (234) 567-890
										</a>
									</div>
								</div>

								<div className='flex items-start'>
									<div className='card-icon w-10 h-10 mr-4 flex items-center justify-center'>
										<MapPin className='h-5 w-5 text-cyan-400' />
									</div>
									<div className='text-left'>
										<h4 className='text-white font-medium mb-1'>Office</h4>
										<p className='text-gray-300'>
											123 Innovation Ave, Tech City,
											<br />
											CA 94103, United States
										</p>
									</div>
								</div>

								<div className='flex items-start'>
									<div className='card-icon w-10 h-10 mr-4 flex items-center justify-center'>
										<Clock className='h-5 w-5 text-cyan-400' />
									</div>
									<div className='text-left'>
										<h4 className='text-white font-medium mb-1'>
											Business Hours
										</h4>
										<p className='text-gray-300'>
											Monday - Friday: 9am - 6pm
											<br />
											Saturday: 10am - 4pm
										</p>
									</div>
								</div>
							</div>

							<div className='mt-12'>
								<h3 className='card-title text-left mb-4'>Follow Us</h3>
								<div className='social-icons'>
									<a href='#' className='social-icon'>
										<Facebook className='h-5 w-5' />
									</a>
									<a href='#' className='social-icon'>
										<Twitter className='h-5 w-5' />
									</a>
									<a href='#' className='social-icon'>
										<Instagram className='h-5 w-5' />
									</a>
									<a href='#' className='social-icon'>
										<Linkedin className='h-5 w-5' />
									</a>
								</div>
							</div>
						</div>
					</div>

					{/* Contact Form Section */}
					<div className='feature-card'>
						<div className='w-full'>
							<h2 className='card-title text-left mb-6'>Send a Message</h2>

							{submitSuccess ? (
								<div className='bg-green-900/30 border border-green-500 rounded-lg p-6 text-center'>
									<div className='mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-800/50 border border-green-500'>
										<Send className='h-6 w-6 text-green-400' />
									</div>
									<h3 className='text-green-400 text-xl font-medium mb-2'>
										Message Sent Successfully!
									</h3>
									<p className='text-gray-300 mb-4'>
										Thank you for reaching out. We'll get back to you as soon as
										possible.
									</p>
									<Button
										onClick={() => setSubmitSuccess(false)}
										className='bg-green-800/50 hover:bg-green-700/60 text-green-400 border border-green-500'
									>
										Send Another Message
									</Button>
								</div>
							) : (
								<form onSubmit={handleSubmit} className='space-y-6'>
									<div>
										<label htmlFor='name' className='block text-gray-300 mb-2'>
											Your Name
										</label>
										<Input
											id='name'
											name='name'
											value={formData.name}
											onChange={handleChange}
											required
											placeholder='Enter your name'
											className='search-input w-full'
										/>
									</div>

									<div>
										<label htmlFor='email' className='block text-gray-300 mb-2'>
											Email Address
										</label>
										<Input
											id='email'
											name='email'
											type='email'
											value={formData.email}
											onChange={handleChange}
											required
											placeholder='Enter your email'
											className='search-input w-full'
										/>
									</div>

									<div>
										<label
											htmlFor='subject'
											className='block text-gray-300 mb-2'
										>
											Subject
										</label>
										<Input
											id='subject'
											name='subject'
											value={formData.subject}
											onChange={handleChange}
											required
											placeholder='What is this about?'
											className='search-input w-full'
										/>
									</div>

									<div>
										<label
											htmlFor='message'
											className='block text-gray-300 mb-2'
										>
											Message
										</label>
										<Textarea
											id='message'
											name='message'
											value={formData.message}
											onChange={handleChange}
											required
											placeholder='Your message here...'
											className='search-input w-full min-h-40'
											rows={6}
										/>
									</div>

									{submitError && (
										<div className='bg-red-900/30 border border-red-500 rounded-lg p-4 text-red-400'>
											{submitError}
										</div>
									)}

									<Button
										type='submit'
										disabled={isSubmitting}
										className='cta-button w-full'
									>
										{isSubmitting ? (
											<>
												<span className='loading-spinner mr-2'></span>
												Sending...
											</>
										) : (
											<>
												<Send className='h-5 w-5 mr-2' />
												Send Message
											</>
										)}
									</Button>
								</form>
							)}
						</div>
					</div>
				</div>

				{/* FAQ Section */}
				<div className='mt-16'>
					<h2 className='main-title text-2xl mb-8'>
						Frequently Asked Questions
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='feature-card'>
							<h3 className='card-title text-left text-lg'>
								What file formats do you support?
							</h3>
							<p className='card-description text-left'>
								We support a wide range of 3D file formats including GLTF, GLB,
								FBX, OBJ, and more. Our platform is designed to handle most
								standard 3D model formats.
							</p>
						</div>

						<div className='feature-card'>
							<h3 className='card-title text-left text-lg'>
								How can I share my 3D models?
							</h3>
							<p className='card-description text-left'>
								After uploading your model, you can generate a shareable link or
								embed code to include your 3D model on any website or share with
								collaborators.
							</p>
						</div>

						<div className='feature-card'>
							<h3 className='card-title text-left text-lg'>
								Is there a file size limit?
							</h3>
							<p className='card-description text-left'>
								Free accounts can upload models up to 50MB. Premium accounts
								allow uploads up to 500MB with options for larger files
								available on enterprise plans.
							</p>
						</div>

						<div className='feature-card'>
							<h3 className='card-title text-left text-lg'>
								Do you offer API access?
							</h3>
							<p className='card-description text-left'>
								Yes, we provide a comprehensive API for enterprise customers to
								integrate our 3D viewing capabilities directly into their
								applications and workflows.
							</p>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className='main-footer'>
				<div className='footer-content'>
					<div className='footer-grid'>
						<div className='footer-section'>
							<h3 className='footer-title'>Prisma3D</h3>
							<p className='footer-text'>
								Advanced 3D model viewer and collaboration platform for
								professionals and enthusiasts.
							</p>
							<div className='social-icons'>
								<a href='#' className='social-icon'>
									<Facebook className='h-5 w-5' />
								</a>
								<a href='#' className='social-icon'>
									<Twitter className='h-5 w-5' />
								</a>
								<a href='#' className='social-icon'>
									<Instagram className='h-5 w-5' />
								</a>
								<a href='#' className='social-icon'>
									<Linkedin className='h-5 w-5' />
								</a>
							</div>
						</div>

						<div className='footer-section'>
							<h3 className='footer-title'>Quick Links</h3>
							<ul className='footer-links'>
								<li>
									<Link href='/' className='footer-link'>
										Home
									</Link>
								</li>
								<li>
									<Link href='/features' className='footer-link'>
										Features
									</Link>
								</li>
								<li>
									<Link href='/pricing' className='footer-link'>
										Pricing
									</Link>
								</li>
								<li>
									<Link href='/contact' className='footer-link'>
										Contact
									</Link>
								</li>
							</ul>
						</div>

						<div className='footer-section'>
							<h3 className='footer-title'>Support</h3>
							<ul className='footer-links'>
								<li>
									<Link href='/help' className='footer-link'>
										Help Center
									</Link>
								</li>
								<li>
									<Link href='/faq' className='footer-link'>
										FAQ
									</Link>
								</li>
								<li>
									<Link href='/documentation' className='footer-link'>
										Documentation
									</Link>
								</li>
								<li>
									<Link href='/tutorials' className='footer-link'>
										Tutorials
									</Link>
								</li>
							</ul>
						</div>

						<div className='footer-section'>
							<h3 className='footer-title'>Newsletter</h3>
							<p className='footer-text'>
								Subscribe to our newsletter for the latest updates and features.
							</p>
							<div className='newsletter-form'>
								<Input
									type='email'
									placeholder='Your email address'
									className='newsletter-input'
								/>
								<Button className='newsletter-button'>
									<Send className='h-4 w-4' />
								</Button>
							</div>
						</div>
					</div>

					<div className='footer-bottom'>
						<p>&copy; {new Date().getFullYear()} Prisma3D.</p>
					</div>
				</div>
			</footer>
		</div>
	)
}

export default ContactPage
