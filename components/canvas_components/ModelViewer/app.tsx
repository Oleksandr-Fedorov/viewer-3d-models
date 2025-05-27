'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { MyProvider } from '../MyContext'
import { useDropzone, FileWithPath } from 'react-dropzone'
import WebGL from 'three/addons/capabilities/WebGL.js'
import Viewer from './Viewer'
import queryString from 'query-string'
import api from '@/actions/api_instance'
import Link from 'next/link'
import { ArrowLeft, Upload, Ruler, Camera, Home, Eye } from 'lucide-react'

import ModelInfoReport from '../ModelInfo/ModelInfoReport'
import '@/components/canvas_components/mainCanvasPageStyle.css'
import { useCurrentUser } from '@/hooks/UseCurrentUser'
import { getSecureURL } from '@/actions/getSecureURL'

// Типы и интерфейсы
type ExtendedDropzoneInputProps = {
	webkitdirectory?: string
	multiple?: boolean
	directory?: string
}

type ViewerPropsType = {
	url: string
	rootPath: string
	fileMap: Map<string, File>
	options: Object
	modelId: string
	rootFile: File | string
	fileType: string
}

type ValidatorPropsType = {
	rootFile: string
	rootPath: string
	assetMap: Map<string, File>
}

type OptionsType = {
	kiosk: boolean
	model: string
	preset: string
	cameraPosition: number[] | null
}

export const CanvasReal = () => {
	const user = useCurrentUser()
	// Состояния
	const [isViewerVisible, setIsViewerVisible] = useState<boolean>(false)
	const [validatorProps, setValidatorProps] =
		useState<ValidatorPropsType | null>(null)
	const [file, setFile] = useState<File[] | null>(null)
	const [model, setModel] = useState({ name: '', id: '' })
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [options, setOptions] = useState<OptionsType>({
		kiosk: false,
		model: '',
		preset: '',
		cameraPosition: null,
	})
	const [viewerProps, setViewerProps] = useState<ViewerPropsType | null>(null)
	const [measure, setMeasure] = useState(false)
	const [openSnapshotDialog, setOpen] = useState(false)
	// Флаг, указывающий, что модель меняется
	const [isModelChanging, setIsModelChanging] = useState<boolean>(false)
	// Очередь для новых файлов, ожидающих обработки
	const pendingFilesRef = useRef<FileWithPath[] | null>(null)

	// Рефы
	const headerRef = useRef<HTMLDivElement>(null)
	const mainRef = useRef<HTMLDivElement>(null)
	const dropzoneRef = useRef<HTMLDivElement>(null)

	// Вспомогательные функции

	/**
	 * Создаёт карту файлов с правильными путями
	 */
	const createFileMap = (
		files: FileWithPath[],
		mainFile: FileWithPath
	): Map<string, File> => {
		const fileMap = new Map<string, File>()

		if (files[0].path) {
			// Случай drag&drop папки - используем оригинальную структуру
			files.forEach(file => {
				const path = file.path || ''
				fileMap.set(path, file)
			})
		} else {
			// Случай выбора через проводник - создаем виртуальную структуру
			const virtualRoot = 'uploaded/'

			// Помещаем основной файл в корень виртуальной папки
			fileMap.set(virtualRoot + mainFile.name, mainFile)

			// Остальные файлы помещаем в подпапку с именем основного файла
			const mainFileName = mainFile.name.split('.')[0]
			files.forEach(file => {
				if (file !== mainFile) {
					const virtualPath = virtualRoot + mainFileName + '/' + file.name
					fileMap.set(virtualPath, file)
				}
			})
		}

		return fileMap
	}

	/**
	 * Определяет тип файла модели
	 */
	const getFileType = (fileName: string): string => {
		if (fileName.match(/\.fbx$/)) return 'fbx'
		return 'gltf/glb'
	}

	/**
	 * Получает rootPath из файла
	 */
	const getRootPath = (file: FileWithPath, withPath: boolean): string => {
		if (withPath && file.path) {
			return file.path.replace(file.name, '')
		}
		return 'uploaded/'
	}

	/**
	 * Обработка ошибок
	 */
	const onError = (error: any) => {
		setIsLoading(false)
		setIsModelChanging(false)

		let message = (error || {}).message || error.toString()
		if (message.match(/ProgressEvent/)) {
			message =
				'Unable to retrieve this file. Check JS console and browser network tab.'
		} else if (message.match(/Unexpected token/)) {
			message = `Unable to parse file content. Verify that this file is valid. Error: "${message}"`
		} else if (error && error.target && error.target instanceof Image) {
			message = 'Missing texture: ' + error.target.src.split('/').pop()
		}
		window.alert(message)
	}

	/**
	 * Загружает и отображает модель
	 */
	const loadAndView = (
		rootFile: File | string,
		rootPath: string,
		fileMap: Map<string, File>,
		fileType: string,
		modelId: string
	) => {
		const fileURL =
			typeof rootFile === 'string' ? rootFile : URL.createObjectURL(rootFile)

		// Устанавливаем все необходимые свойства за один раз
		setViewerProps({
			url: fileURL,
			rootPath,
			fileMap,
			options,
			modelId,
			rootFile,
			fileType,
		})

		setValidatorProps({
			rootFile: fileURL,

			rootPath,
			assetMap: fileMap,
		})

		setIsViewerVisible(true)
		setIsLoading(false)
		setIsModelChanging(false)
	}

	/**
	 * Создает снимок текущей модели и загружает его на сервер
	 */
	const captureAndSaveCurrentModel = async (): Promise<boolean> => {
		if (!model.id || model.id === '') {
			console.log('No model ID found to save snapshot')
			return false
		}

		try {
			console.log('Capturing snapshot of current model before changing...')
			await handleURLAws({
				modelId: model.id,
				modelName: model.name,
			})
			console.log('Current model snapshot saved successfully')
			return true
		} catch (error) {
			console.error('Error saving current model snapshot:', error)
			return false
		}
	}

	/**
	 * Обработчик загрузки файлов
	 */
	const onDrop = useCallback(
		async (acceptedFiles: FileWithPath[]) => {
			// Если уже идет загрузка или изменение модели, сохраняем файлы в очередь
			if (isLoading || isModelChanging) {
				console.log('Already loading or changing model, queueing files')
				pendingFilesRef.current = acceptedFiles
				return
			}

			// Сначала устанавливаем флаг загрузки
			setIsLoading(true)
			setIsModelInfoMounted(false)
			// Если у нас уже есть отображаемая модель, сначала сохраняем её снимок
			if (isViewerVisible && model.id) {
				setIsModelChanging(true)
				const snapshotSaved = await captureAndSaveCurrentModel()
				if (!snapshotSaved) {
					console.warn(
						'Failed to save snapshot of current model, proceeding anyway'
					)
				}
			}

			try {
				// Проверка на пустой массив файлов
				if (!acceptedFiles || acceptedFiles.length === 0) {
					onError('No files were dropped or selected.')
					return
				}

				// 1. Найти главный файл - один раз
				const mainFile = acceptedFiles.find(file =>
					file.name.match(/\.(gltf|glb|fbx)$/)
				)

				if (!mainFile) {
					onError('No .gltf, .glb or .fbx asset found.')
					return
				}

				// 2. Определить наличие путей в файлах
				const hasFilePaths = Boolean(acceptedFiles[0].path)

				// 3. Построить fileMap с правильными путями
				const fileMap = createFileMap(acceptedFiles, mainFile)

				// 4. Определить rootPath и fileType один раз
				const rootPath = getRootPath(mainFile, hasFilePaths)
				const fileType = getFileType(mainFile.name)
				console.log('IN APP: fileType:')
				if (user?.id) {
					console.log('User ID:', user.id)
					// 5. Подготовить данные для загрузки на сервер
					const formData = new FormData()
					acceptedFiles.forEach(file => formData.append('files', file))

					// 6. Загрузка на сервер где из них получают кеш и id модели соответственно
					//на данном этапе не используется загрузка их в хранилище или в базу данных
					//а просто отправляется на сервер для получения id модели
					const response = await api.post('/api/models/upload', formData)
					const { success, modelId, error, modelName } = response.data

					if (!success) {
						onError(error || 'Upload error')
						return
					}
					setModel({ name: modelName, id: modelId })
					// 7. Загрузка и отображение модели

					loadAndView(mainFile, rootPath, fileMap, fileType, modelId)
				}
			} catch (error) {
				console.error('Error uploading files:', error)
				onError(error)
			}
		},
		[options, isViewerVisible, model, isLoading, isModelChanging]
	)

	// Обработка очереди загрузки, когда предыдущая операция завершена
	useEffect(() => {
		if (!isLoading && !isModelChanging && pendingFilesRef.current) {
			const pendingFiles = pendingFilesRef.current
			pendingFilesRef.current = null
			onDrop(pendingFiles)
		}
	}, [isLoading, isModelChanging, onDrop])

	const computeHash = async (file: File) => {
		const arrayBuffer = await file.arrayBuffer()
		const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
		const hashArray = Array.from(new Uint8Array(hashBuffer))
		const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
		return hashHex
	}

	const handleURLAws = async ({
		modelId,
		modelName,
	}: {
		modelId: string
		modelName: string
	}): Promise<void> => {
		// 1. Снимок
		const canvas = document.querySelector('canvas')
		if (!canvas) {
			console.error('Canvas element not found')
			throw new Error('Canvas element not found')
		}

		const dataURL = canvas.toDataURL()

		// 2. dataURL → Blob
		const byteString = atob(dataURL.split(',')[1])
		const mime = dataURL.match(/data:(.*);base64/)![1]
		const ab = new ArrayBuffer(byteString.length)
		const ia = new Uint8Array(ab)
		for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
		const blob = new Blob([ab], { type: mime })

		// 3. Создаём File для вычисления checksum
		const file = new File([blob], `${modelName.split('.')[0]}.png`, {
			type: mime,
		})
		const checkSum = await computeHash(file)

		// 4. Получаем presigned URL и заливаем
		const { success, url } = await getSecureURL({
			modelId,
			name: file.name,
			type: file.type,
			size: file.size,
			checkSum,
		})
		console.log('HandleURLAws func')
		if (!url) throw new Error('Нет URL для загрузки')
		await api.put(url, file, { headers: { 'Content-Type': file.type } })
	}

	// Инициализация компонента
	useEffect(() => {
		// Проверка поддержки File API и WebGL
		if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
			console.error('The File APIs are not fully supported in this browser.')
			return
		}

		if (!WebGL.isWebGL2Available()) {
			console.error('WebGL is not supported in this browser.')
			return
		}

		// Чтение параметров из URL
		const hash = window.location.hash
			? queryString.parse(window.location.hash)
			: {}

		const newOptions = {
			kiosk: Boolean(hash.kiosk),
			model: (hash.model as string) || '',
			preset: (hash.preset as string) || '',
			cameraPosition: hash.cameraPosition
				? (hash.cameraPosition as string).split(',').map(Number)
				: null,
		}
		setOptions(newOptions)

		// Скрытие заголовка в режиме киоска
		if (newOptions.kiosk && headerRef.current) {
			headerRef.current.style.display = 'none'
		}

		// Загрузка модели из URL, если указана
		if (newOptions.model) {
			loadAndView(newOptions.model, '', new Map(), '', '')
		}
		//По окончанию отображения этого компонента можно
		//предложить пользователю загрузить модель в хранилище или в базу данных
		// и удалить ее из кеша браузера(но єто после)
		return () => {}
	}, [])

	// Обработчик закрытия просмотрщика с сохранением снимка текущей модели
	const closeViewerWithSnapshot = async () => {
		if (isViewerVisible && model.id !== '') {
			setIsLoading(true)
			try {
				await handleURLAws({
					modelId: model.id,
					modelName: model.name,
				})
				setIsViewerVisible(false)
			} catch (error) {
				console.error('Error saving snapshot on close:', error)
			} finally {
				setIsLoading(false)
			}
		} else {
			setIsViewerVisible(false)
		}
	}

	// Настройка дропзон
	const {
		getRootProps: getInitialDropProps,
		getInputProps: getInitialInputProps,
		isDragActive: isInitialDragActive,
		open,
	} = useDropzone({
		onDrop,
		// Важно: вынесли логику обработки ошибок загрузки в onDrop
		onDropRejected: () => {
			setIsLoading(false)
			setIsModelChanging(false)
		},
		onDropAccepted: () => {
			// Мы уже устанавливаем isLoading в onDrop
		},
		noClick: true,
		disabled: isViewerVisible,
		useFsAccessApi: false,
	})

	const {
		getRootProps: getMainDropProps,
		getInputProps: getMainInputProps,
		isDragActive: isMainDragActive,
	} = useDropzone({
		onDrop,
		// Важно: вынесли логику обработки ошибок загрузки в onDrop
		onDropRejected: () => {
			setIsLoading(false)
			setIsModelChanging(false)
		},
		onDropAccepted: () => {
			// Мы уже устанавливаем isLoading в onDrop
		},
		noClick: true,
		noKeyboard: true,
		disabled: !isViewerVisible || isLoading || isModelChanging,
	})
	const [showModelInfo, setShowModelInfo] = useState(false)
	const [renderer, setRenderer] = useState<any>(null)
	const [modelData, setModelData] = useState<any>(null)
	const handleShowModelInfo = () => {
		if (!isModelInfoMounted) {
			setIsModelInfoMounted(true)
		}
		setShowModelInfo(true)
	}
	// Функция для получения модели из компонента Model
	const onModelLoaded = (model: any) => {
		setModelData(model)
	}
	const [isModelInfoMounted, setIsModelInfoMounted] = useState(false)
	// Рендер компонента
	const MemoizedModelInfoReport = React.memo(ModelInfoReport)
	return (
		<div className='canvas-container'>
			<header ref={headerRef} className='canvas-header'>
				<div className='canvas-header-content'>
					<div className='flex items-center'>
						<Link
							href='/'
							onClick={closeViewerWithSnapshot}
							className='home-link'
						>
							<Home className='h-5 w-5 mr-2' />
							<span>Prisma3D</span>
						</Link>
						<div className='model-title ml-8'>
							{isViewerVisible && viewerProps ? (
								<span>
									{typeof viewerProps.rootFile === 'string'
										? viewerProps.rootFile.split('/').pop()
										: viewerProps.rootFile.name}
								</span>
							) : (
								<span>3D Viewer</span>
							)}
						</div>
					</div>

					<div className='canvas-actions'>
						{isViewerVisible && (
							<>
								<button
									onClick={() => setOpen(true)}
									className='canvas-action-btn'
									title='Take snapshot'
									disabled={isLoading || isModelChanging}
								>
									<Camera className='h-5 w-5' />
								</button>

								<button
									onClick={closeViewerWithSnapshot}
									className='canvas-action-btn'
									title='Close model'
									disabled={isLoading || isModelChanging}
								>
									<ArrowLeft className='h-5 w-5' />
								</button>

								<button
									title='See model information'
									className='canvas-action-btn'
									disabled={isLoading || isModelChanging}
									onClick={handleShowModelInfo}
								>
									<Eye className='h-5 w-5' />
								</button>
							</>
						)}
					</div>
				</div>
			</header>

			<main ref={mainRef} {...getMainDropProps({ className: 'canvas-main' })}>
				<input type='file' {...getMainInputProps()} />

				{!isViewerVisible ? (
					<div className='dropzone-container'>
						<div
							ref={dropzoneRef}
							{...getInitialDropProps({
								className: `dropzone-area ${isInitialDragActive ? 'dropzone-active' : ''}`,
							})}
						>
							<input
								{...getInitialInputProps()}
								{...({
									webkitdirectory: 'true',
								} as ExtendedDropzoneInputProps)}
							/>

							<div className='dropzone-icon'>
								<Upload className='h-12 w-12 text-cyan-400' />
							</div>

							<h2 className='dropzone-title'>Upload your 3D model</h2>

							<p className='dropzone-text'>
								Drag & drop your glTF, GLB or FBX file here
							</p>

							<button
								type='button'
								onClick={open}
								className='dropzone-button'
								disabled={isLoading}
							>
								Choose file
							</button>
						</div>
					</div>
				) : (
					viewerProps &&
					isViewerVisible && (
						<MyProvider
							key={`${viewerProps.url}-${viewerProps.rootPath}-${viewerProps.fileType}-${viewerProps.rootFile}`}
							value={{
								setIsViewerVisible,
								...viewerProps,
								onModelLoaded,

								openSnapshotDialog,
								setRenderer,
								setOpen,
							}}
						>
							<Viewer />
						</MyProvider>
					)
				)}
				{isModelInfoMounted && modelData && validatorProps && (
					<div style={{ display: showModelInfo ? 'block' : 'none' }}>
						<ModelInfoReport
							key={`model-info-${modelData?.rootFile || 'default'}`}
							renderer={renderer}
							validatorProps={validatorProps}
							model={modelData}
							onClose={() => setShowModelInfo(false)}
						/>
					</div>
				)}
				{isViewerVisible && isMainDragActive && !isModelChanging && (
					<div className='drag-overlay'>
						<div className='drag-overlay-content'>
							<Upload className='h-12 w-12 text-cyan-400 mb-4' />
							<p className='text-xl'>
								Drop your file here to replace current model
							</p>
						</div>
					</div>
				)}

				{isLoading && (
					<div className='loading-overlay'>
						<div className='loading-spinner'></div>
						<p className='loading-text'>
							{isModelChanging
								? 'Saving current model and loading new model...'
								: 'Loading your 3D model...'}
						</p>
					</div>
				)}
			</main>

			<footer className='canvas-footer'>
				<p>Drop your 3D models anywhere on the page to view them</p>
			</footer>
		</div>
	)
}
