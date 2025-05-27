import React, { createContext, useContext } from 'react'

const MyContext = createContext(null)

export function MyProvider({
	children,
	value,
}: {
	children: React.ReactNode
	value: any
}) {
	return <MyContext.Provider value={value}>{children}</MyContext.Provider>
}

export function useMyContext() {
	return useContext(MyContext)
}
