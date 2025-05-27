import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { GetImageAsDataUrl } from './OtherFunc'
import {
	CookieGetStringVal,
	CookieGetBoolVal,
	CookieSetBoolVal,
	CookieSetStringVal,
	CookieSetIntVal,
	CookieGetIntVal,
} from './data_handler'
import './style.css'
import { HandleEvent } from './eventhndle'

//На данном етапе,могу брать корректировать размер фото,отчасти могу
//вроде бы делать прозрачность фона, сделал довольно приятный интерфейс окна
//Возможно подкорректирую то,как окно будетстабилизироваться по вертикали,
//Нужно проверить еще точно ,почему оно бывавет активным кастомный размер
//когда выбран другой размер,а не по умолчанию
const Snapshot = ({ onClose, renderer, camera, scene }: any) => {
	function DownloadUrlAsFile(url: string, fileName: string) {
		const link = document.createElement('a')
		link.href = url
		link.download = fileName
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	function GetImageUrl(size: [number, number], isTransparent: boolean) {
		const width = parseInt(size[0].toString(), 10)
		const height = parseInt(size[1].toString(), 10)
		if (width < 1 || height < 1) return null

		return GetImageAsDataUrl(
			size[0],
			size[1],
			isTransparent,
			renderer,
			camera,
			scene
		)
	}

	const [selectedSizeIndex, setSelectedSizeIndex] = useState(0)
	const previewImageRef = useRef<HTMLImageElement>(null)
	const [isTransparent, setIsTransparent] = useState(false)

	// Initialize sizes and state
	const customIndex = 3
	const [sizes, setSizes] = useState([
		{ name: 'Small (1280x720)', size: [1280, 720] as [number, number] },
		{ name: 'Medium (1920x1080)', size: [1920, 1080] as [number, number] },
		{ name: 'Large (2560x1440)', size: [2560, 1440] as [number, number] },
		{
			name: 'Custom',
			size: null as [number, number] | null,
			widthInput: null as HTMLInputElement | null,
			heightInput: null as HTMLInputElement | null,
		},
	])

	// Helper functions
	function UpdatePreview(
		previewImage: HTMLImageElement | null,
		size: [number, number],
		isTransparent: boolean
	) {
		if (!previewImage) return

		const url = GetImageUrl(size, isTransparent)
		if (url) previewImage.src = url
	}

	function UpdateCustomStatus(customIndex: number, selectedIndex: number) {
		const updatedSizes = [...sizes]
		if (updatedSizes[customIndex].widthInput) {
			updatedSizes[customIndex].widthInput!.disabled =
				selectedIndex !== customIndex
		}

		if (updatedSizes[customIndex].heightInput) {
			updatedSizes[customIndex].heightInput!.disabled =
				selectedIndex !== customIndex
		}

		setSizes(updatedSizes)
	}

	function GetSize(selectedIndex: number): [number, number] {
		const selectedSize = sizes[selectedIndex]

		if (selectedSize.size) return selectedSize.size

		// For custom size
		const width = sizes[customIndex].widthInput?.value
			? parseInt(sizes[customIndex].widthInput.value, 10)
			: 1000

		const height = sizes[customIndex].heightInput?.value
			? parseInt(sizes[customIndex].heightInput.value, 10)
			: 1000

		return [width, height]
	}

	// Handle custom size inputs
	const widthInputRef = useRef<HTMLInputElement>(null)
	const heightInputRef = useRef<HTMLInputElement>(null)

	// Initialize from cookie - once when component mounts
	useLayoutEffect(() => {
		console.log('In useLayoutEffect []')
		if (
			!widthInputRef.current ||
			!heightInputRef.current ||
			!previewImageRef.current
		)
			return
		const lastSize = CookieGetStringVal('ov_last_snapshot_size', sizes[0].name)
		const index = sizes.findIndex(size => size.name === lastSize)
		if (index !== -1) {
			setSelectedSizeIndex(index)
		}

		// Initialize custom size inputs
		const updatedSizes = [...sizes]
		updatedSizes[customIndex].widthInput = widthInputRef.current
		updatedSizes[customIndex].heightInput = heightInputRef.current
		setSizes(updatedSizes)

		UpdatePreview(previewImageRef.current, GetSize(index), isTransparent)
	}, [])

	const btnRef = useRef<HTMLButtonElement>(null)
	return (
		<div className='snapshot-dialog-overlay'>
			<div className='ov_modal ov_dialog ov_snapshot_dialog'>
				<div className='ov_dialog_title'>Create Snapshot</div>
				<div className='ov_dialog_content'>
					<div className='snapshot-dialog-layout'>
						<div className='snapshot-preview-container'>
							<img
								ref={previewImageRef}
								className='snapshot-preview'
								alt='Snapshot Preview'
							/>
						</div>
						<div className='snapshot-options-container'>
							{/* Radio buttons for sizes */}
							{sizes.map((size, index) => (
								<div key={index} className='snapshot-option-row'>
									<label className='snapshot-radio-label'>
										<input
											type='radio'
											name='snapshot_size'
											checked={index === selectedSizeIndex}
											onChange={() => {
												setSelectedSizeIndex(index)
												CookieSetStringVal('ov_last_snapshot_size', size.name)
												UpdateCustomStatus(customIndex, index)
												setSizes(sizes)
											}}
										/>
										{size.name}
									</label>
								</div>
							))}

							{/* Custom size inputs */}
							<div className='custom-size-container'>
								<div className='snapshot-param-row'>
									<div className='snapshot-param-label'>Width</div>
									<input
										type='number'
										className='snapshot-param-input'
										ref={widthInputRef}
										defaultValue={CookieGetIntVal(
											'ov_snapshot_custom_width',
											1000
										).toString()}
										onChange={e => {
											CookieSetIntVal(
												'ov_snapshot_custom_width',
												parseInt(e.target.value, 10)
											)

											UpdatePreview(
												previewImageRef.current,
												GetSize(selectedSizeIndex),
												isTransparent
											)
										}}
									/>
								</div>
								<div className='snapshot-param-row'>
									<div className='snapshot-param-label'>Height</div>
									<input
										type='number'
										className='snapshot-param-input'
										ref={heightInputRef}
										defaultValue={CookieGetIntVal(
											'ov_snapshot_custom_height',
											1000
										).toString()}
										onChange={e => {
											CookieSetIntVal(
												'ov_snapshot_custom_height',
												parseInt(e.target.value, 10)
											)

											UpdatePreview(
												previewImageRef.current,
												GetSize(selectedSizeIndex),
												isTransparent
											)
										}}
									/>
								</div>
							</div>

							{/* Transparent checkbox */}
							<div className='snapshot-option-row transparent-option'>
								<label className='snapshot-checkbox-label'>
									<input
										type='checkbox'
										checked={isTransparent}
										onChange={e => {
											console.log('isTransparent', e.target.checked)
											setIsTransparent(e.target.checked)
											CookieSetBoolVal(
												'ov_last_snapshot_transparent',
												e.target.checked
											)

											UpdatePreview(
												previewImageRef.current,
												GetSize(selectedSizeIndex),
												e.target.checked
											)
										}}
									/>
									Transparent background
								</label>
							</div>
						</div>
					</div>
				</div>

				{/* Buttons */}
				<div className='ov_dialog_buttons'>
					<button className='cancel-button' onClick={onClose}>
						Cancel
					</button>
					<button
						ref={btnRef}
						className='create-button'
						onClick={() => {
							const size = GetSize(selectedSizeIndex)
							const url = GetImageUrl(size, isTransparent)
							if (url) {
								DownloadUrlAsFile(url, 'snapshot.png')
								//Под вопрос что делает функция
								HandleEvent(
									'snapshot_created',
									sizes[selectedSizeIndex].name,
									isTransparent
								)
							}
							onClose()
						}}
					>
						Create
					</button>
				</div>
			</div>
		</div>
	)
}

export default Snapshot
