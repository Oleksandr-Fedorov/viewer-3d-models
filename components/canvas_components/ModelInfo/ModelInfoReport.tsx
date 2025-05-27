// Обновленный ModelInfoReport с интегрированной валидацией
import React, { useEffect, useState } from 'react'
// @ts-ignore
import { validateBytes } from 'gltf-validator'
import { LoaderUtils } from 'three'
import './styles.css'
import './validation-styles.css'
import { Button } from '@/components/ui/button'

interface ModelInfoReportProps {
	model: any
	validatorProps: {
		rootFile: string
		rootPath: string
		assetMap: Map<string, File>
	}
	renderer: any
	onClose: () => void
}

// Константа для классификации серьезности проблем
const SEVERITY_MAP = ['Errors', 'Warnings', 'Infos', 'Hints']

const ModelInfoReport: React.FC<ModelInfoReportProps> = ({
	renderer,
	model,
	validatorProps,
	onClose,
}) => {
	// Состояние для информации о модели
	const [modelStats, setModelStats] = useState({
		bones: 0,
		nodes: 0,
	})

	const [modelInfo, setModelInfo] = useState({
		version: '',
		generator: '',
		copyright: '',
		title: '',
		author: '',
		license: '',
		description: '',
		extensionsUsed: [] as string[],
		extensionsRequired: [] as string[],
	})

	// Состояние для отчета валидации
	const [validationReport, setValidationReport] = useState<any>(null)
	const [validationLoading, setValidationLoading] = useState(true)
	const [validationError, setValidationError] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState('info') // 'info' или 'validation'

	useEffect(() => {
		if (!model) return

		// Собираем информацию о модели
		const stats = calculateModelStats(model)
		setModelStats(stats)

		// Получаем метаданные из модели
		const info = extractModelInfo(model)
		setModelInfo(info)

		// Запускаем валидацию
		runValidation()
	}, [model])

	// Функция запуска валидации
	const runValidation = async () => {
		if (!validatorProps || !validatorProps.rootFile) {
			setValidationLoading(false)
			setValidationError('Недостаточно данных для валидации')
			return
		}

		try {
			setValidationLoading(true)

			// Получаем содержимое файла
			const response = await fetch(validatorProps.rootFile)
			const buffer = await response.arrayBuffer()

			// Выполняем валидацию
			const report = await validateBytes(new Uint8Array(buffer), {
				maxIssues: 100,
				externalResourceFunction: (uri: string) =>
					resolveExternalResource(
						uri,
						validatorProps.rootFile,
						validatorProps.rootPath,
						validatorProps.assetMap
					),
			})
			console.log('Report:', report)
			// Форматируем отчет
			formatReport(report)

			setValidationReport(report)
			setValidationLoading(false)
		} catch (error) {
			console.error('Validation error:', error)
			setValidationError(
				error instanceof Error ? error.message : 'Ошибка валидации'
			)
			setValidationLoading(false)
		}
	}

	// Функция для загрузки внешних ресурсов
	const resolveExternalResource = async (
		uri: string,
		rootFile: string,
		rootPath: string,
		assetMap: Map<string, File>
	) => {
		const baseURL = LoaderUtils.extractUrlBase(rootFile)
		const normalizedURL =
			rootPath +
			decodeURI(uri) // validator applies URI encoding.
				.replace(baseURL, '')
				.replace(/^(\.?\/)/, '')

		let objectURL: string | undefined

		if (assetMap.has(normalizedURL)) {
			const object = assetMap.get(normalizedURL)
			if (object) {
				objectURL = URL.createObjectURL(object)
			}
		}

		try {
			const response = await fetch(objectURL || baseURL + uri)
			const buffer = await response.arrayBuffer()

			if (objectURL) URL.revokeObjectURL(objectURL)

			return new Uint8Array(buffer)
		} catch (error) {
			console.error(`Failed to load resource: ${uri}`, error)
			throw error
		}
	}

	// Форматирование отчета для отображения
	const formatReport = (report: any) => {
		report.generator = (report && report.info && report.info.generator) || ''
		report.issues.maxSeverity = -1

		SEVERITY_MAP.forEach((severity, index) => {
			if (
				report.issues[`num${severity}`] > 0 &&
				report.issues.maxSeverity === -1
			) {
				report.issues.maxSeverity = index
			}
		})

		report.errors = report.issues.messages.filter(
			(msg: any) => msg.severity === 0
		)
		report.warnings = report.issues.messages.filter(
			(msg: any) => msg.severity === 1
		)
		report.infos = report.issues.messages.filter(
			(msg: any) => msg.severity === 2
		)
		report.hints = report.issues.messages.filter(
			(msg: any) => msg.severity === 3
		)

		// Группировка похожих сообщений
		groupMessages(report)
	}

	// Группировка похожих сообщений
	const groupMessages = (report: any) => {
		const CODES: {
			[key: string]: {
				message: string
				pointerCounts: { [key: string]: number }
			}
		} = {
			ACCESSOR_NON_UNIT: {
				message:
					'{count} accessor elements not of unit length: 0. [AGGREGATED]',
				pointerCounts: {},
			},
			ACCESSOR_ANIMATION_INPUT_NON_INCREASING: {
				message:
					'{count} animation input accessor elements not in ascending order. [AGGREGATED]',
				pointerCounts: {},
			},
		}

		report.errors.forEach((message: any) => {
			if (!CODES[message.code]) return
			if (!CODES[message.code].pointerCounts[message.pointer]) {
				CODES[message.code].pointerCounts[message.pointer] = 0
			}
			CODES[message.code].pointerCounts[message.pointer]++
		})

		report.errors = report.errors.filter((message: any) => {
			if (!CODES[message.code]) return true
			if (!CODES[message.code].pointerCounts[message.pointer]) return true
			return CODES[message.code].pointerCounts[message.pointer] < 2
		})

		Object.keys(CODES).forEach(code => {
			Object.keys(CODES[code].pointerCounts).forEach(pointer => {
				report.errors.push({
					code: code,
					pointer: pointer,
					message: CODES[code].message.replace(
						'{count}',
						CODES[code].pointerCounts[pointer].toString()
					),
				})
			})
		})
	}

	// Функция для расчета статистики модели
	const calculateModelStats = (model: any) => {
		let bones = 0
		let nodes = 0
		if (!model.scene) {
			return {
				bones: 0,
				nodes: 0,
			}
		}
		model.scene.traverse((object: any) => {
			nodes++
			if (object.isBone) bones++
		})

		return {
			bones,
			nodes,
		}
	}

	// Извлечение метаданных из модели
	const extractModelInfo = (model: any) => {
		let info = {
			version: '',
			generator: '',
			copyright: '',
			title: '',
			author: '',
			license: '',
			description: '',
			extensionsUsed: [] as string[],
			extensionsRequired: [] as string[],
		}

		if (model.parser && model.parser.json) {
			const json = model.parser.json

			// Базовая информация
			if (json.asset) {
				info.version = json.asset.version || ''
				info.generator = json.asset.generator || ''
				info.copyright = json.asset.copyright || ''

				// Дополнительная информация из extras
				if (json.asset.extras) {
					info.title = json.asset.extras.title || ''
					info.author = json.asset.extras.author || ''
					info.license = json.asset.extras.license || ''
					info.description = json.asset.extras.description || ''
				}
			}

			// Расширения
			info.extensionsUsed = json.extensionsUsed || []
			info.extensionsRequired = json.extensionsRequired || []
		}

		return info
	}

	// Функция для получения сводки о валидации
	const getValidationSummary = () => {
		if (!validationReport) return null

		const { issues } = validationReport
		let statusClass = 'status-valid'
		let statusText = 'Valid'

		if (issues.numErrors > 0) {
			statusClass = 'status-error'
			statusText = 'Invalid'
		}

		return (
			<div className='validation-summary'>
				<div className={`summary-status ${statusClass}`}>{statusText}</div>
				<table className='info-table'>
					<tbody>
						<tr>
							<td>
								<strong>Version:</strong>
							</td>
							<td>{validationReport.info.version}</td>
						</tr>
						<tr>
							<td>
								<strong>Generator:</strong>
							</td>
							<td>{validationReport.info.generator || 'Unknown'}</td>
						</tr>
						<tr>
							<td>
								<strong>Issues found:</strong>
							</td>
							<td>
								{issues.numErrors > 0 && (
									<span className='error-count'>{issues.numErrors} errors</span>
								)}
								{issues.numWarnings > 0 && (
									<span className='warning-count'>
										{issues.numWarnings} warnings
									</span>
								)}
								{issues.numInfos > 0 && (
									<span className='info-count'>{issues.numInfos} infos</span>
								)}
								{issues.numHints > 0 && (
									<span className='hint-count'>{issues.numHints} hints</span>
								)}
								{!issues.numErrors &&
									!issues.numWarnings &&
									!issues.numInfos &&
									!issues.numHints &&
									'None'}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		)
	}

	// Рендер проблем определенного типа
	const renderIssueSection = (
		issues: any[],
		title: string,
		className: string
	) => {
		if (issues.length === 0) return null

		return (
			<section className={`model-info-section ${className}`}>
				<h3>
					{title} ({issues.length})
				</h3>
				<ul className='issue-list'>
					{issues.map((issue, index) => (
						<li key={`${className}-${index}`} className='issue-item'>
							<div className='issue-header'>
								<span className='issue-code'>{issue.code}</span>
								<span className='issue-pointer'>{issue.pointer}</span>
							</div>
							<div className='issue-message'>{issue.message}</div>
						</li>
					))}
				</ul>
			</section>
		)
	}

	return (
		<div className='model-info-overlay'>
			<div className='model-info-container'>
				<div className='model-info-header'>
					<h2>Model Information</h2>
					<div className='model-info-tabs'>
						<button
							className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
							onClick={() => setActiveTab('info')}
						>
							Model Info
						</button>
						<button
							className={`tab-button ${activeTab === 'validation' ? 'active' : ''}`}
							onClick={() => setActiveTab('validation')}
						>
							Validation
							{validationReport && validationReport.issues.numErrors > 0 && (
								<span className='validation-error-indicator'></span>
							)}
						</button>
					</div>
					<button className='close-button' onClick={onClose}>
						×
					</button>
				</div>

				<div className='model-info-content'>
					{activeTab === 'info' && validationReport && (
						<>
							{/* Базовая информация */}
							<section className='model-info-section'>
								<h3>File Information</h3>
								<table className='info-table'>
									<tbody>
										{modelInfo.version && (
											<tr>
												<td>
													<strong>Format Version:</strong>
												</td>
												<td>glTF {modelInfo.version}</td>
											</tr>
										)}
										{modelInfo.generator && (
											<tr>
												<td>
													<strong>Generator:</strong>
												</td>
												<td>{modelInfo.generator}</td>
											</tr>
										)}
										{modelInfo.copyright && (
											<tr>
												<td>
													<strong>Copyright:</strong>
												</td>
												<td>{modelInfo.copyright}</td>
											</tr>
										)}
										{typeof model.rootFile === 'string' ? (
											<tr>
												<td>
													<strong>File:</strong>
												</td>
												<td>{model.rootFile.split('/').pop()}</td>
											</tr>
										) : model.rootFile?.name ? (
											<tr>
												<td>
													<strong>File:</strong>
												</td>
												<td>{model.rootFile.name}</td>
											</tr>
										) : null}
									</tbody>
								</table>
							</section>

							{/* Метаданные, если есть */}
							{(modelInfo.title ||
								modelInfo.author ||
								modelInfo.license ||
								modelInfo.description) && (
								<section className='model-info-section'>
									<h3>Metadata</h3>
									<table className='info-table'>
										<tbody>
											{modelInfo.title && (
												<tr>
													<td>
														<strong>Title:</strong>
													</td>
													<td>{modelInfo.title}</td>
												</tr>
											)}
											{modelInfo.author && (
												<tr>
													<td>
														<strong>Author:</strong>
													</td>
													<td>{modelInfo.author}</td>
												</tr>
											)}
											{modelInfo.license && (
												<tr>
													<td>
														<strong>License:</strong>
													</td>
													<td>{modelInfo.license}</td>
												</tr>
											)}
											{modelInfo.description && (
												<tr>
													<td>
														<strong>Description:</strong>
													</td>
													<td>{modelInfo.description}</td>
												</tr>
											)}
										</tbody>
									</table>
								</section>
							)}

							{/* Статистика модели */}
							<section className='model-info-section'>
								<h3>Model Statistics</h3>
								<table className='info-table'>
									<tbody>
										<tr>
											<td>
												<strong>Triangles:</strong>
											</td>
											<td>
												{validationReport?.info.totalTriangleCount || '0'}
											</td>
										</tr>
										<tr>
											<td>
												<strong>Vertices:</strong>
											</td>
											<td>{validationReport?.info.totalVertexCount || '0'}</td>
										</tr>
										<tr>
											<td>
												<strong>Materials:</strong>
											</td>
											<td>{validationReport?.info.materialCount || '0'}</td>
										</tr>
										<tr>
											<td>
												<strong>Textures:</strong>
											</td>
											<td>
												{validationReport?.info.resources.length - 1 || '0'}
											</td>
										</tr>
										<tr>
											<td>
												<strong>Meshes:</strong>
											</td>
											<td>{validationReport?.info.drawCallCount || '0'}</td>
										</tr>
										<tr>
											<td>
												<strong>Animations:</strong>
											</td>
											<td>{validationReport?.info.animationCount || '0'}</td>
										</tr>
										{modelStats.bones > 0 && (
											<tr>
												<td>
													<strong>Bones:</strong>
												</td>
												<td>{modelStats.bones}</td>
											</tr>
										)}
										<tr>
											<td>
												<strong>Nodes:</strong>
											</td>
											<td>{modelStats.nodes}</td>
										</tr>
									</tbody>
								</table>
							</section>

							{/* Используемые расширения */}
							{modelInfo.extensionsUsed.length > 0 && (
								<section className='model-info-section'>
									<h3>Extensions Used</h3>
									<ul className='extensions-list'>
										{modelInfo.extensionsUsed.map((ext, index) => (
											<li key={index}>{ext}</li>
										))}
									</ul>
								</section>
							)}

							{/* Требуемые расширения */}
							{modelInfo.extensionsRequired.length > 0 && (
								<section className='model-info-section'>
									<h3>Required Extensions</h3>
									<ul className='extensions-list'>
										{modelInfo.extensionsRequired.map((ext, index) => (
											<li key={index}>{ext}</li>
										))}
									</ul>
								</section>
							)}

							{/* Информация о сцене */}
							<section className='model-info-section'>
								<h3>Model Structure</h3>
								<div className='scene-tree'>
									{model.scene ? (
										<ul className='scene-tree-list'>
											<SceneTreeNode node={model.scene} depth={0} />
										</ul>
									) : (
										<p>No model information available</p>
									)}
								</div>
							</section>
						</>
					)}

					{activeTab === 'validation' && (
						<>
							{validationLoading ? (
								<div className='loading-wrapper'>
									<div className='loading-spinner'></div>
									<p>Validating model...</p>
								</div>
							) : validationError ? (
								<div className='validation-error'>
									<h3>Validation Error</h3>
									<p>{validationError}</p>
								</div>
							) : validationReport ? (
								<>
									<section className='model-info-section'>
										<h3>Validation Summary</h3>
										{getValidationSummary()}
									</section>

									{renderIssueSection(
										validationReport.errors,
										'Errors',
										'errors'
									)}
									{renderIssueSection(
										validationReport.warnings,
										'Warnings',
										'warnings'
									)}
									{renderIssueSection(validationReport.infos, 'Infos', 'infos')}
									{renderIssueSection(validationReport.hints, 'Hints', 'hints')}
								</>
							) : (
								<p>No validation data available</p>
							)}
						</>
					)}
				</div>

				<div className='model-info-footer'>
					<button className='close-report-button' onClick={onClose}>
						Close Report
					</button>
				</div>
			</div>
		</div>
	)
}

// Компонент для отображения дерева сцены
// @ts-ignore
const SceneTreeNode = ({ node, depth }) => {
	const [isExpanded, setIsExpanded] = useState(depth < 2)
	const [isVisible, setIsVisible] = useState(true)
	const hasChildren = node.children && node.children.length > 0

	const getNodeType = (node: any) => {
		if (node.isMesh) return 'Mesh'
		if (node.isLight) return 'Light'
		if (node.isCamera) return 'Camera'
		if (node.isBone) return 'Bone'
		if (node.isGroup) return 'Group'
		return 'Object'
	}

	const toggleExpand = () => {
		setIsExpanded(!isExpanded)
	}

	const type = getNodeType(node)

	return (
		<li className='scene-tree-item'>
			<div
				className='scene-tree-node'
				style={{ paddingLeft: `${depth * 20}px` }}
				onClick={hasChildren ? toggleExpand : undefined}
			>
				{hasChildren && (
					<span
						className={`tree-toggle ${isExpanded ? 'expanded' : 'collapsed'}`}
					>
						{isExpanded ? '▼' : '►'}
					</span>
				)}
				<span className={`node-type ${type.toLowerCase()}`}>{type}</span>
				<span className='node-name'>{node.name || '<unnamed>'}</span>
			</div>
			{(type === 'Object' || type === 'Mesh') &&
				(isVisible ? (
					<Button
						onClick={() => {
							node.visible = false
							setIsVisible(false)
						}}
					>
						Hide
					</Button>
				) : (
					<Button
						onClick={() => {
							node.visible = true
							setIsVisible(true)
						}}
					>
						Reveal
					</Button>
				))}
			{isExpanded && hasChildren && (
				<ul className='scene-tree-list'>
					{node.children.map((child: any, index: number) => (
						<SceneTreeNode key={index} node={child} depth={depth + 1} />
					))}
				</ul>
			)}
		</li>
	)
}

export default ModelInfoReport
