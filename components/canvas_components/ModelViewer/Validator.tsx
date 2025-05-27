import React, { useState, useEffect } from 'react'
import { LoaderUtils } from 'three'
// @ts-ignore
import { validateBytes } from 'gltf-validator'
import ValidatorToggle from '@/app/components/validator-toggle'
import ValidatorReport from '@/app/components/validator-report'

const SEVERITY_MAP = ['Errors', 'Warnings', 'Infos', 'Hints']

interface ValidatorProps {
	rootFile: string
	rootPath: string
	assetMap: Map<string, File>
	response: any // Уточните тип, если возможно
}

interface Report {
	generator?: string // Добавляем generator как опциональное свойство
	issues: {
		maxSeverity: number
		numErrors?: number
		numWarnings?: number
		numInfos?: number
		numHints?: number
		messages: Array<{
			severity: number
			code: string
			pointer: string
			message: string
		}>
	}
	errors: Array<any>
	warnings: Array<any>
	infos: Array<any>
	hints: Array<any>
	info?: {
		generator?: string // Добавляем generator в info
		extras?: {
			author?: string
			license?: string
			source?: string
			title?: string
		}
	}
}

const Validator: React.FC<ValidatorProps> = ({
	rootFile,
	rootPath,
	assetMap,
	response,
}) => {
	const [report, setReportState] = useState<Report | null>(null)
	const [showToggle, setShowToggle] = useState(false)

	useEffect(() => {
		validate(rootFile, rootPath, assetMap, response)
	}, [rootFile, rootPath, assetMap, response])

	const validate = async (
		rootFile: string,
		rootPath: string,
		assetMap: Map<string, File>,
		response: any
	) => {
		try {
			const buffer = await fetch(rootFile).then(res => res.arrayBuffer())
			const report = await validateBytes(new Uint8Array(buffer), {
				externalResourceFunction: (uri: string) =>
					resolveExternalResource(uri, rootFile, rootPath, assetMap),
			})
			setReport(report, response)
		} catch (e) {
			setReportException(e)
		}
	}

	const resolveExternalResource = async (
		uri: string,
		rootFile: string,
		rootPath: string,
		assetMap: Map<string, File>
	) => {
		const baseURL = LoaderUtils.extractUrlBase(rootFile)
		const normalizedURL =
			rootPath +
			decodeURI(uri)
				.replace(baseURL, '')
				.replace(/^(\.?\/)/, '')
		let objURL: string | undefined

		if (assetMap.has(normalizedURL)) {
			const object = assetMap.get(normalizedURL)
			if (object) {
				objURL = URL.createObjectURL(object)
			}
		}

		const buffer = await fetch(objURL || baseURL + uri).then(res =>
			res.arrayBuffer()
		)
		if (objURL) URL.revokeObjectURL(objURL)
		return new Uint8Array(buffer)
	}

	const setReport = (report: Report, response: any) => {
		report.generator = (report && report.info && report.info.generator) || ''
		report.issues.maxSeverity = -1
		SEVERITY_MAP.forEach((severity, index) => {
			const key = `num${severity}` as
				| 'numErrors'
				| 'numWarnings'
				| 'numInfos'
				| 'numHints'
			if (
				report.issues[key] &&
				report.issues[key]! > 0 &&
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
		groupMessages(report)
		setReportState(report)
		setResponse(response)
		setShowToggle(true)
	}

	const setResponse = (response: any) => {
		const json = response && response.parser && response.parser.json
		if (!json) return

		if (json.asset && json.asset.extras && report) {
			const extras = json.asset.extras
			report.info = report.info || {}
			report.info.extras = {}
			if (extras.author) {
				report.info.extras.author = linkify(escapeHTML(extras.author))
			}
			if (extras.license) {
				report.info.extras.license = linkify(escapeHTML(extras.license))
			}
			if (extras.source) {
				report.info.extras.source = linkify(escapeHTML(extras.source))
			}
			if (extras.title) {
				report.info.extras.title = extras.title
			}
		}
	}

	const setReportException = (e: any) => {
		setReportState(null)
		setShowToggle(true)
	}

	const groupMessages = (report: Report) => {
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

	const escapeHTML = (unsafe: string) => {
		return unsafe
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;')
	}

	const linkify = (text: string) => {
		const urlPattern =
			/\b(?:https?):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim
		const emailAddressPattern =
			/(([a-zA-Z0-9_\-\.]+)@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6}))+/gim
		return text
			.replace(urlPattern, '<a target="_blank" href="$&">$&</a>')
			.replace(
				emailAddressPattern,
				'<a target="_blank" href="mailto:$1">$1</a>'
			)
	}

	return (
		<div className={`report-toggle-wrap ${showToggle ? '' : 'hidden'}`}>
			{report && (
				<ValidatorToggle issues={report.issues} reportError={report.errors} />
			)}
		</div>
	)
}

export default Validator
