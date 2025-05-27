'use client'
import Header from '../Header/Header_'
import Content from '../TitlePage_Main_Content/Content'
import Footer from '../Footer/Footer'
import './styles.css'
export default function Main_title() {
	return (
		<div className='main-page-container'>
			<Header />
			<Content />
			<Footer />
		</div>
	)
}
