import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createHash } from 'crypto'
import { db } from '@/lib/db'
import { mod } from 'three/tsl'
async function metaHashFiles(files: File[], mainFile: File) {
	// Сортируем файлы для стабильности хеша
	const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name))

	const hash = createHash('sha256')
	if (files.length === 1) {
		const arrayBuffer = await mainFile.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer.slice(0, 1024))
		hash.update(buffer)
	} else {
		// Хешируем метаданные каждого файла
		for (const file of sortedFiles) {
			// Используем только имя и размер (стабильные характеристики)
			const fileInfo = `${file.name}:${file.size}`
			hash.update(fileInfo)
		}

		if (mainFile) {
			// Читаем первые N байт для большей уникальности
			const arrayBuffer = await mainFile.arrayBuffer()
			const buffer = Buffer.from(arrayBuffer.slice(0, 1024))
			hash.update(buffer)
		}
	}
	return {
		hash: hash.digest('hex'),
		format: mainFile.name.split('.').pop() || 'UNKNOWN',
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth()
		const user = session?.user

		if (!user) {
			return NextResponse.json(
				{ success: false, error: 'No user logged in' },
				{ status: 410 }
			)
		}

		const formData = await request.formData()
		const files = formData.getAll('files') as File[]

		if (!files || files.length === 0) {
			return NextResponse.json(
				{ success: false, error: 'No files provided' },
				{ status: 411 }
			)
		}

		// Для основного файла добавляем часть содержимого
		const mainFile = files.find(file => file.name.match(/\.(gltf|glb|fbx)$/))

		if (!mainFile) {
			return NextResponse.json(
				{
					success: false,
					error: 'No main model file (.gltf, .glb, or .fbx) found',
				},
				{ status: 400 }
			)
		}

		const modelParams = await metaHashFiles(files, mainFile)

		console.log('modelHash:', modelParams.hash)
		console.log('modelFormat:', modelParams.format)
		console.log('files:', files)

		// Сохраняем в БД

		const result = await db.$transaction(async tx => {
			// 1. Сначала создаем или обновляем модель
			const model = await tx.threeDModel.upsert({
				where: {
					id: modelParams.hash,
				},
				create: {
					id: modelParams.hash,
					name: mainFile.name,
					format: modelParams.format,
					// При создании не добавляем здесь userViews,
					// чтобы избежать несогласованности, если запись уже существует
				},
				update: {
					updatedAt: new Date(),
				},
			})

			// 2. Затем создаем или обновляем запись в UserModels отдельно
			const userView = await tx.userModels.upsert({
				where: {
					userId_modelId: {
						modelId: model.id,
						userId: user.id as string,
					},
				},
				create: {
					userId: user.id as string,
					modelId: model.id,
				},
				update: { viewedAt: new Date() },
			})

			return { model, userView }
		})

		return NextResponse.json({
			success: true,
			modelId: result.model.id,
			modelName: result.model.name,
		})
	} catch (error) {
		console.error('Error in POST /api/models/upload:', error)
		return NextResponse.json(
			{ success: false, error: 'Internal server error uploading model' },
			{ status: 500 }
		)
	}
}
