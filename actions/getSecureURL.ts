'use server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
	region: process.env.AWS_REGION!,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
})

const maxLength = 1024 * 1024 * 100 // 100 MB

export async function getSecureURL({
	modelId,
	name,
	type = 'application/octet-stream',
	size,
	checkSum,
}: {
	modelId: string
	name: string
	type?: string
	size?: number
	checkSum?: string
}) {
	const session = await auth()
	const userId = session?.user?.id

	if (!userId) {
		return { error: 'Unauthorized' }
	}

	if (maxLength < size!) return { error: 'File is too large' }

	const putObjctCommand = new PutObjectCommand({
		Bucket: process.env.AWS_BUCKET_NAME!,
		Key: `auto-next-update/${userId}/${name}`,
		ContentType: type,
		ContentLength: size,
		ChecksumSHA256: checkSum,
		// Metadata is a set of key-value pairs that you can associate with an object in S3.
		//Пока не уверен, что это нужно, но в документации написано, что это нужно для того, чтобы потом можно было искать по этим метаданным
		// и фильтровать по ним. Например, можно искать по модели, по типу файла и т.д.
		Metadata: {
			modelId: modelId,
		},
	})

	const url = await getSignedUrl(s3, putObjctCommand, {
		expiresIn: 60,
	})

	// //Тут уже обновляем запист в БД с ссылкой с AWS на загруженный файл как поле image
	await db.userModels.update({
		where: {
			userId_modelId: {
				userId: userId,
				modelId: modelId,
			},
		},
		data: {
			image: url.split('?')[0],
		},
	})

	return { success: true, url }
}
