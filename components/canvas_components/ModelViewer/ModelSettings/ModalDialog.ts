const createDialog = () => {
	return new Promise(resolve => {
		// Create dialog elements
		const dialog = document.createElement('div')
		dialog.className = 'custom-dialog'
		dialog.style.cssText =
			'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.3); z-index: 1000;'

		const heading = document.createElement('h3')
		heading.textContent = 'Message from gltf.report:'
		heading.style.cssText =
			'font-size: 20px; font-weight: bold; color: #666; margin-top: 10px;'
		const message = document.createElement('p')
		message.textContent =
			'Requires spec/gloss materials (KHR_materials_pbrSpecularGlossiness), which this viewer cannot display. Materials will be converted to metal/rough.'
		message.style.cssText = 'font-size: 14px; color: #666; margin-top: 10px;'

		const buttonContainer = document.createElement('div')
		buttonContainer.style.cssText =
			'display: flex; justify-content: flex-end; margin-top: 20px;'

		const okButton = document.createElement('button')
		okButton.textContent = 'OK'
		okButton.style.cssText =
			'background: #0078d7; color: white; border: none; padding: 5px 20px; margin-right: 10px; cursor: pointer;'
		okButton.onclick = () => {
			document.body.removeChild(dialog)
			document.body.removeChild(overlay)
			resolve(true)
		}

		const cancelButton = document.createElement('button')
		cancelButton.textContent = 'Cancel'
		cancelButton.style.cssText =
			'background: #dc2626; color: white; border: none; padding: 5px 20px; cursor: pointer;'
		cancelButton.onclick = () => {
			document.body.removeChild(dialog)
			document.body.removeChild(overlay)
			resolve(false)
		}

		buttonContainer.appendChild(okButton)
		buttonContainer.appendChild(cancelButton)

		dialog.appendChild(heading)
		dialog.appendChild(message)
		dialog.appendChild(buttonContainer)

		// Create overlay
		const overlay = document.createElement('div')
		overlay.style.cssText =
			'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;'

		// Add to document
		document.body.appendChild(overlay)
		document.body.appendChild(dialog)
	})
}

export default createDialog
