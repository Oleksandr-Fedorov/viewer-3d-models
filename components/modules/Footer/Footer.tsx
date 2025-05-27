'use client'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
	return (
		<footer className='main-footer'>
			<div className='footer-content'>
				<div className='footer-grid'>
					<div className='footer-section'>
						<h3 className='footer-title'>About Prisma3D</h3>
						<p className='footer-text'>
							An intuitive 3D model viewer that allows you to visualize, explore
							and analyze 3D content directly in your web browser.
						</p>
						<div className='social-icons'>
							<Link
								href='https://github.com'
								target='_blank'
								className='social-icon'
							>
								<Github className='h-5 w-5' />
							</Link>
							<Link
								href='https://twitter.com'
								target='_blank'
								className='social-icon'
							>
								<Twitter className='h-5 w-5' />
							</Link>
							<Link href='mailto:contact@prisma3d.com' className='social-icon'>
								<Mail className='h-5 w-5' />
							</Link>
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
								<Link href='/settings' className='footer-link'>
									Profile
								</Link>
							</li>
							<li>
								<Link href='/upload' className='footer-link'>
									Upload Model
								</Link>
							</li>
							<li>
								<Link href='/docs' className='footer-link'>
									Documentation
								</Link>
							</li>
							<li>
								<Link href='/contacts' className='footer-link'>
									Contact
								</Link>
							</li>
						</ul>
					</div>

					<div className='footer-section'>
						<h3 className='footer-title'>Newsletter</h3>
						<p className='footer-text'>
							Stay updated with our latest features and model releases.
						</p>
						<div className='newsletter-form'>
							<Input
								type='email'
								placeholder='Your email'
								className='newsletter-input'
							/>
							<Button className='newsletter-button'>Subscribe</Button>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
