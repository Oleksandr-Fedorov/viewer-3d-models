// StatsPanel.tsx
import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { statsFactory } from './statsFactory'

// Импортируем наши модули с регистрацией Stats
// Эти импорты важны, так как они регистрируют функции создания в фабрике
import './StatsGL'
import './StatsThree'

interface StatsPanelProps {
	canvasRef: React.RefObject<HTMLElement>
	type: 'statsGL' | 'statsThree' // Поддерживаемые типы
}

const StatsPanel = ({ canvasRef, type }: StatsPanelProps) => {
	const { gl } = useThree()
	const statsRef = useRef<any>(null)
	const attachedRef = useRef<boolean>(false)

	useEffect(() => {
		// Очищаем предыдущую панель, если она существует и была прикреплена
		if (
			statsRef.current &&
			statsRef.current.dom &&
			canvasRef.current &&
			attachedRef.current
		) {
			try {
				canvasRef.current.removeChild(statsRef.current.dom)
			} catch (error) {
				console.warn('Failed to remove stats DOM node:', error)
			}
			attachedRef.current = false
		}

		statsRef.current = statsFactory.create(type)

		if (statsRef.current && canvasRef.current) {
			statsRef.current.dom.height = '48px'
			statsRef.current.dom.style.position = 'absolute'
			statsRef.current.dom.style.top = '0px'
			statsRef.current.dom.style.left = '0px'

			// Некоторым Stats нужно передать контекст WebGL
			if (typeof statsRef.current.init === 'function') {
				statsRef.current.init(gl)
			}

			// Добавляем DOM-элемент
			try {
				canvasRef.current.appendChild(statsRef.current.dom)
				attachedRef.current = true
			} catch (error) {
				console.warn('Failed to append stats DOM node:', error)
			}
		}

		return () => {
			// Удаляем при размонтировании компонента только если был прикреплен
			if (
				statsRef.current &&
				statsRef.current.dom &&
				canvasRef.current &&
				attachedRef.current
			) {
				try {
					canvasRef.current.removeChild(statsRef.current.dom)
				} catch (error) {
					console.warn('Failed to remove stats DOM node during cleanup:', error)
				}
				attachedRef.current = false
			}
		}
	}, [type])

	// Обновляем Stats в каждом кадре
	useFrame(() => {
		if (statsRef.current) {
			statsRef.current.update()
		}
	})

	return null
}

export default StatsPanel
