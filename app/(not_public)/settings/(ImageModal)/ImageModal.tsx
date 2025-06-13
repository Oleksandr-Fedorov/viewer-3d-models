'use client'
import React from 'react'
import { X } from 'lucide-react'
import './styles.css'

type ImageModalProps = {
	isOpen: boolean
	imageUrl: string | null
	modelName: string
	onClose: () => void
}

const ImageModal: React.FC<ImageModalProps> = ({
	isOpen,
	imageUrl,
	modelName,
	onClose,
}) => {
	if (!isOpen) return null
	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}

	return (
		<div className='modal-backdrop' onClick={handleBackdropClick}>
			<div className='modal-content'>
				<div className='modal-header'>
					<h3 className='modal-title'>{modelName || 'Model Preview'}</h3>
					<button className='modal-close-btn' onClick={onClose}>
						<X className='h-5 w-5' />
					</button>
				</div>
				<div className='modal-body'>
					{imageUrl ? (
						<img
							src={imageUrl}
							alt={`Preview of ${modelName}`}
							className='model-preview-image'
						/>
					) : (
						<div className='no-image-placeholder'>
							<p>No preview image available</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default ImageModal
