import Link from 'next/link'
import styles from '../../styles/Navbar.module.scss'

const NavbarLink = (props: {href: string, children: string}) => {
      return (
      <button className={styles['nav-button']}>
        <Link href={props.href}>
          <a>
            {props.children}
          </a>
          </Link>
      </button>);
}

export default NavbarLink;