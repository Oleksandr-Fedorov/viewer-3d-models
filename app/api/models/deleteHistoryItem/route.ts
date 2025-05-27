import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
	region: process.env.AWS_REGION!,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
})
export async function DELETE(request: NextRequest) {
	try {
		const session = await auth()
		const user = session?.user

		if (!user) {
			return NextResponse.json(
				{ success: false, error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		// Get modelId from request body
		const { modelId } = await request.json()

		if (!modelId) {
			return NextResponse.json(
				{ success: false, error: 'Model ID is required' },
				{ status: 400 }
			)
		}
		// Проверяем, сколько пользователей, которые просматривали эту модель
		const viewers = await db.userModels.findMany({
			where: {
				modelId: modelId,
			},
		})

		// Получаем информацию о модели
		const modelInfo = await db.userModels.findUnique({
			where: {
				userId_modelId: { userId: user.id as string, modelId: modelId },
			},
			select: {
				image: true,
			},
		})
		const modelIMG = modelInfo?.image

		// Удаляем запись из UserModels
		await db.userModels.delete({
			where: {
				userId_modelId: {
					userId: user.id as string,
					modelId: modelId,
				},
			},
		})

		if (!modelIMG) {
			return NextResponse.json(
				{ success: false, error: 'Model image not found' },
				{ status: 404 }
			)
		}

		// Получаем правильный путь для изображения в S3
		if (modelIMG) {
			// Извлекаем ключ S3 из URL
			// URL AWS S3 обычно имеет формат: https://<bucket-name>.s3.<region>.amazonaws.com/<key>
			// Нам нужно получить <key> часть
			const imageUrl = modelIMG

			// Предполагаем, что URL имеет стандартный формат AWS S3
			// Получаем путь после имени хоста (после третьего '/')
			const urlParts = imageUrl.split('/')
			const keyParts = urlParts.slice(3) // Пропускаем протокол и хост (https://bucket.s3.region.amazonaws.com/)
			const s3Key = keyParts.join('/')

			console.log('Deleting S3 object with key:', s3Key)

			try {
				// Удаляем изображение из AWS
				const deleteParams = {
					Bucket: process.env.AWS_BUCKET_NAME!,
					Key: s3Key,
				}

				await s3.send(new DeleteObjectCommand(deleteParams))
				console.log('Successfully deleted image from S3')
			} catch (s3Error) {
				console.error('Error deleting image from S3:', s3Error)
				// Продолжаем выполнение, чтобы удалить запись из БД даже если удаление из S3 не удалось
			}
		}
		// Если нет других просмотров, удаляем модель как таковую
		if (viewers.length === 1) {
			// Удаляем модель из базы данных
			await db.threeDModel.delete({
				where: {
					id: modelId,
				},
			})
		}
		console.log('Successfully deleted model from database')

		return NextResponse.json({
			success: true,
			message: 'History item deleted successfully',
		})
	} catch (error) {
		console.error('Error deleting history item:', error)
		return NextResponse.json(
			{ success: false, error: 'Failed to delete history item' },
			{ status: 500 }
		)
	}
}
