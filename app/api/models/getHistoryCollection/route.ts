import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
	try {
		const session = await auth()
		const user = session?.user

		if (!user) {
			return NextResponse.json(
				{ success: false, error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		// Получаем историю просмотров текущего пользователя
		// Включая данные о моделях
		const userHistory = await db.userModels.findMany({
			where: {
				userId: user.id,
			},
			include: {
				model: true, // Включаем данные о модели
			},
			orderBy: {
				viewedAt: 'desc', // Сортируем по времени просмотра (новые сверху)
			},
		})

		// Преобразуем данные для удобства использования на клиенте
		const formattedHistory = userHistory.map(item => ({
			modelId: item.modelId,
			name: item.model.name,
			format: item.model.format,
			image: item.image || null,
			viewedAt: item.viewedAt,
		}))

		console.log('Fetched history items:', formattedHistory.length)

		return NextResponse.json({
			success: true,
			history: formattedHistory,
		})
	} catch (error) {
		console.error('Error fetching user history:', error)
		return NextResponse.json(
			{ success: false, error: 'Failed to fetch history' },
			{ status: 500 }
		)
	}
}
