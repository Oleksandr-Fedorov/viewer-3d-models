'use client'
import { signOut } from 'next-auth/react'
import { useCurrentUser } from '@/hooks/UseCurrentUser'
import { useState, useEffect } from 'react'
import api from '@/actions/api_instance'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Eye, LogOut, User, ArrowLeft, Trash2 } from 'lucide-react'
import { deleteHistoryItem } from './(DeleteBtn)/deleteBtn'
import ImageModal from './(ImageModal)/ImageModal' // Импортируем наш компонент модального окна

import './styles.css'

type ModelHistory = {
	modelId: string
	name: string
	format: string
	image: string | null
	viewedAt: string
}

type HistoryResponse = {
	success: boolean
	history: ModelHistory[]
	error?: string
}

export default function ProfilePage() {
	// Получаем данные сессии с информацией о статусе загрузки
	const user = useCurrentUser()
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 4

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [history, setHistory] = useState<ModelHistory[]>([])
	const [totalPages, setTotalPages] = useState(0)
	const [currentItems, setCurrentItems] = useState<ModelHistory[]>([])

	// Состояние для модального окна
	const [modalOpen, setModalOpen] = useState(false)
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const [selectedModelName, setSelectedModelName] = useState('')

	// Функция для получения инициалов из имени пользователя
	const getUserInitials = (name?: string | null) => {
		if (!name) return 'U'

		const parts = name.split(' ')
		if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
		return (
			parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
		).toUpperCase()
	}

	// Функция для форматирования даты
	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleString('ru-RU', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		})
	}

	// Функция для открытия модального окна с изображением
	const openImageModal = (image: string | null, modelName: string) => {
		setSelectedImage(image)
		setSelectedModelName(modelName)
		setModalOpen(true)
	}

	// Функция для закрытия модального окна
	const closeImageModal = () => {
		setModalOpen(false)
	}

	// Функция для получения данных истории
	useEffect(() => {
		const fetchHistory = async () => {
			try {
				setLoading(true)
				const response = await api.get('/api/models/getHistoryCollection')
				console.log('API Response:', response)

				if (response.data && response.data.success) {
					console.log('Setting history:', response.data.history)
					setHistory(response.data.history)

					// Вычисляем общее количество страниц на основе длины массива истории
					const totalPagesCount = Math.ceil(
						response.data.history.length / itemsPerPage
					)
					setTotalPages(totalPagesCount)

					// Если текущая страница больше, чем общее количество страниц, установим на последнюю страницу
					if (currentPage > totalPagesCount && totalPagesCount > 0) {
						setCurrentPage(totalPagesCount)
					}
				} else {
					console.error('API Error:', response.data?.error || 'Unknown error')
					setError(response.data?.error || 'Failed to fetch model history')
				}
			} catch (error) {
				console.error('Fetch Error:', error)
				setError('Failed to fetch model history')
			} finally {
				setLoading(false)
			}
		}

		fetchHistory()
	}, [])

	// Обновляем текущие элементы при изменении страницы или загрузке истории
	useEffect(() => {
		if (history.length > 0) {
			const indexOfLastItem = currentPage * itemsPerPage
			const indexOfFirstItem = indexOfLastItem - itemsPerPage
			setCurrentItems(history.slice(indexOfFirstItem, indexOfLastItem))
		}
	}, [currentPage, history])

	// Функция для смены страницы
	const paginate = (pageNumber: number) => {
		setCurrentPage(pageNumber)
	}

	// Функция для перехода на следующую страницу
	const nextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1)
		}
	}

	// Функция для перехода на предыдущую страницу
	const prevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1)
		}
	}

	// Функция для генерации номеров страниц
	const getPageNumbers = () => {
		const pageNumbers: (number | string)[] = []

		if (totalPages <= 5) {
			// Если страниц меньше или равно 5, показываем все
			for (let i = 1; i <= totalPages; i++) {
				pageNumbers.push(i)
			}
		} else {
			// Иначе показываем некоторые с многоточием
			if (currentPage <= 3) {
				// В начале списка
				for (let i = 1; i <= 3; i++) {
					pageNumbers.push(i)
				}
				pageNumbers.push('ellipsis')
				pageNumbers.push(totalPages)
			} else if (currentPage >= totalPages - 2) {
				// В конце списка
				pageNumbers.push(1)
				pageNumbers.push('ellipsis')
				for (let i = totalPages - 2; i <= totalPages; i++) {
					pageNumbers.push(i)
				}
			} else {
				// В середине списка
				pageNumbers.push(1)
				pageNumbers.push('ellipsis')
				pageNumbers.push(currentPage - 1)
				pageNumbers.push(currentPage)
				pageNumbers.push(currentPage + 1)
				pageNumbers.push('ellipsis')
				pageNumbers.push(totalPages)
			}
		}

		return pageNumbers
	}

	return (
		<div className='profile-page'>
			<div className='profile-container wow-bg'>
				<div className='header-section'>
					<h1 className='profile-title'>Profile</h1>
					<div className='flex flex-row gap-10'>
						<Button
							onClick={() => (window.location.href = `/`)}
							className='logout-btn'
							size='sm'
						>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back to Home
						</Button>
						<Button onClick={() => signOut()} className='logout-btn' size='sm'>
							<LogOut className='mr-2 h-4 w-4' />
							Sign Out
						</Button>
					</div>
				</div>

				<div className='profile-grid'>
					<div className='user-info-card wow-bg'>
						<div className='card-header'>
							<h2 className='card-title'>User Info</h2>
						</div>
						<div className='card-content'>
							<div className='avatar-container'>
								<Avatar className='user-avatar'>
									<AvatarImage
										className='absolute'
										src={user?.image || ''}
										alt={user?.name || 'User'}
									/>
									<AvatarFallback className='avatar-fallback'>
										{getUserInitials(user?.name)}
									</AvatarFallback>
								</Avatar>
							</div>
							<h3 className='user-name'>{user?.name || 'User'}</h3>
							<p className='user-email'>{user?.email}</p>
						</div>
					</div>

					<div className='history-card wow-bg'>
						<div className='card-header'>
							<h2 className='card-title'>Recently Viewed Models</h2>
						</div>
						<div className='card-content'>
							{loading ? (
								<div className='loading-container'>
									<div className='loading-spinner'></div>
									<p className='loading-text'>Loading history...</p>
								</div>
							) : error ? (
								<div className='error-container'>
									<p className='error-text'>{error}</p>
								</div>
							) : history.length > 0 ? (
								<div className='history-container'>
									<ul className='model-list'>
										{currentItems.map((model, index) => (
											<li
												key={`${model.modelId}-${index}`}
												className='model-item'
											>
												<div className='model-info'>
													<div
														className='model-icon '
														onClick={() =>
															openImageModal(
																model.image,
																model.name || 'Unnamed Model'
															)
														}
														style={{ cursor: 'pointer' }}
														title='View model preview'
													>
														<Eye className='h-5 w-5' />
													</div>
													<div className='model-details'>
														<p className='model-name'>
															{model.name || 'Unnamed Model'}
														</p>
														<p className='model-date'>
															Viewed {formatDate(model.viewedAt)}
														</p>
													</div>
												</div>
												<div className='model-actions'>
													<button
														className='view-btn inner__btn'
														onClick={() =>
															(window.location.href = `/canvas?modelId=${model.modelId}`)
														}
													>
														View
													</button>
													<button
														className='delete-btn inner__btn'
														onClick={e => {
															e.stopPropagation()
															if (
																window.confirm(
																	'Are you sure you want to delete this item from your history?'
																)
															) {
																deleteHistoryItem(model.modelId, setHistory)
															}
														}}
													>
														<Trash2 className='h-4 w-4' />
													</button>
												</div>
											</li>
										))}
									</ul>

									{/* Пагинация */}
									{totalPages > 1 && (
										<div className='pagination-container'>
											<div className='pagination'>
												<button
													className={`pagination-btn prev ${currentPage === 1 ? 'disabled' : ''}`}
													onClick={prevPage}
													disabled={currentPage === 1}
												>
													Previous
												</button>

												{getPageNumbers().map((number, index) =>
													number === 'ellipsis' ? (
														<span
															key={`ellipsis-${index}`}
															className='pagination-ellipsis'
														>
															...
														</span>
													) : (
														<button
															key={`page-${number}`}
															className={`pagination-number ${currentPage === number ? 'active' : ''}`}
															onClick={() => paginate(number as number)}
														>
															{number}
														</button>
													)
												)}

												<button
													className={`pagination-btn next ${currentPage === totalPages ? 'disabled' : ''}`}
													onClick={nextPage}
													disabled={currentPage === totalPages}
												>
													Next
												</button>
											</div>
										</div>
									)}
								</div>
							) : (
								<div className='empty-container'>
									<p className='empty-text'>No models viewed yet</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Добавляем модальное окно для просмотра изображения */}
				<ImageModal
					isOpen={modalOpen}
					imageUrl={selectedImage}
					modelName={selectedModelName}
					onClose={closeImageModal}
				/>
			</div>
		</div>
	)
}
