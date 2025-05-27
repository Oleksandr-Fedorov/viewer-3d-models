// services/s3Service.ts
import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
} from '@aws-sdk/client-s3'

const s3Client = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
})

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!

export class S3Service {
	// Универсальный метод загрузки
	static async uploadFile(
		path: string,
		file: Buffer | Blob | File,
		contentType: string,
		metadata?: Record<string, string>
	) {
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: path,
			Body: file,
			ContentType: contentType,
			Metadata: metadata,
		})

		await s3Client.send(command)

		// Возвращаем URL файла
		return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}`
	}

	// Метод для получения файла
	static async getFile(path: string) {
		const command = new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: path,
		})

		const response = await s3Client.send(command)
		return response.Body
	}

	// Вспомогательные методы для разных типов файлов
	static async uploadUserFile(
		userId: string,
		fileName: string,
		file: Buffer | File,
		contentType: string
	) {
		return this.uploadFile(`user-uploads/${fileName}`, file, contentType, {
			uploadedBy: userId,
			uploadType: 'user',
		})
	}

	static async uploadSystemFile(
		type: string,
		fileName: string,
		file: Buffer,
		contentType: string
	) {
		return this.uploadFile(`system/${type}/${fileName}`, file, contentType, {
			generatedBy: 'system',
			type,
		})
	}
}
