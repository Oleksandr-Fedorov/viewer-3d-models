'use client'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FaSpinner } from 'react-icons/fa'
import React from 'react'
import Link from 'next/link'

interface CardComponentProps {
	children: React.ReactNode
	headerLabel: string
	headerDescription?: string
	btnLabel: string
	btnAction?: () => void
	isLoading?: boolean
	backText?: string
	backLabel?: string
	backAction?: () => void
	className?: string
}

const CardComponent = ({
	children,
	headerLabel,
	headerDescription = 'Please fill in the form to continue',
	btnLabel,
	btnAction,
	isLoading = false,
	backText,
	backLabel,
	backAction,
	className = '',
}: CardComponentProps) => {
	return (
		<Card className={`wow-bg ${className}`}>
			<CardHeader>
				<CardTitle className='card-body__title'>{headerLabel}</CardTitle>
				{headerDescription && (
					<CardDescription className='card-body__description'>
						{headerDescription}
					</CardDescription>
				)}
			</CardHeader>
			<CardContent>{children}</CardContent>
			<CardFooter className='flex flex-col space-y-4'>
				<Button
					onClick={btnAction}
					className='inner__btn w-full'
					disabled={isLoading}
					type='submit'
				>
					{isLoading ? <FaSpinner className='spinner mr-2' /> : null}
					{btnLabel}
				</Button>

				{backLabel && (
					<div className='inner__bottom'>
						{backText && (
							<span className='inner__bottom__text'>{backText}</span>
						)}
						<Button
							variant='link'
							onClick={backAction}
							className='inner__switch'
						>
							{backLabel}
						</Button>
					</div>
				)}
			</CardFooter>
		</Card>
	)
}

export default CardComponent
