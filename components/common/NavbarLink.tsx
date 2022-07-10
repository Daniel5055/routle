import Link from 'next/link'
import styles from '../../styles/Navbar.module.scss'

const NavbarLink = (props: {href: string, children: string}) => {
      return (
        <Link href={props.href}>
            <a className={styles['nav-button']}>{props.children}</a>
        </Link>
      );
}

export default NavbarLink;