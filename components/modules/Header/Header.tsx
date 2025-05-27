import Logo from '@/components/elements/Logo'
import Link from 'next/link'
import './Header.css'

const Header = () => {
	return (
		<header className='header'>
			<div className='container header_container'>
				{/* Меню */}
				<button className='button-reset header_menu'>Menu</button>
				{/* Логотип посередині */}
				<div className='header_logo'>
					<Logo />
				</div>
				{/* Кнопки вибору */}
				<ul className='header_links list-reset'>
					<li className='header_links_item'>
						<button className='button-reset header_links_item_btn header_links_item_btn--search' />
					</li>
					<li className='header_links_item'>
						<Link
							href='/favorites'
							className='header_links_item_btn 
						header_links_item_btn--favorites'
						/>
					</li>
					<li className='header_links_item'>
						<Link
							href='/cart'
							className='header_links_item_btn 
						header_links_item_btn--cart'
						/>
					</li>
					<li className='header_links_item header_links_item--profile'>
						<Link
							href='/profile'
							className='header_links_item_btn 
						header_links_item_btn--profile'
						/>
					</li>
				</ul>
			</div>
		</header>
	)
}

export default Header
