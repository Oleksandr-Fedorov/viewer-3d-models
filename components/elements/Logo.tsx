import Link from 'next/link'
import Image from 'next/image'
const Logo = () => {
	return (
		<Link className='logo' href='/'>
			<Image
				className='logo_img'
				src='/img/SVG_icons/logo_1.svg'
				alt='Web-logo'
				width={70}
				height={70}
			/>
			<div className='text'>Prisma</div>
		</Link>
	)
}

export default Logo
