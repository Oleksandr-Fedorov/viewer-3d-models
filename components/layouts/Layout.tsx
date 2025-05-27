const Layout = ({ children }: { children: React.ReactNode }) => (
	<div
		style={{
			minHeight: '100vh',
			display: 'flex',
			flexDirection: 'column',
		}}
	>
		{children}
	</div>
)

export default Layout
