import Link from 'next/link';
import styles from '../../styles/Navbar.module.scss';

const NavbarLink = (props: {
  href: string;
  small?: boolean;
  children: string;
}) => {
  return (
    <Link href={props.href}>
      <a
        className={
          props.small ? styles['nav-button-small'] : styles['nav-button']
        }
      >
        {props.children}
      </a>
    </Link>
  );
};

export default NavbarLink;
