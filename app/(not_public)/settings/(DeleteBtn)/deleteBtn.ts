import toast from 'react-hot-toast'
import api from '@/actions/api_instance'

export const deleteHistoryItem = async (modelId: string, setHistory: any) => {
	try {
		const response = await api.delete('/api/models/deleteHistoryItem', {
			data: { modelId },
		})

		if (response.data && response.data.success) {
			setHistory((prevHistory: any) =>
				prevHistory.filter((item: any) => item.modelId !== modelId)
			)
			toast.success('History item deleted successfully')
		} else toast.error(response.data?.error || 'Failed to delete history item')
	} catch (error) {
		console.error('Delete Error:', error)
		// Show error toast
		toast.error('Failed to delete history item')
	}
}
