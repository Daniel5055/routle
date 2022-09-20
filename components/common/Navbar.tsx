import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/Navbar.module.scss';
import NavbarLink from './NavbarLink';
import info from '../../public/info.png';

export default function Navbar() {
  return (
    <header className={styles.container}>
      <Link href={'/blog'}>
        <a className={styles['nav-info']}>
          <Image src={info} alt="info" width={24} height={24} />
        </a>
      </Link>
      <NavbarLink href="/singleplayer">Singleplayer</NavbarLink>
      <h1 className={styles['title']}>Routle</h1>
      <NavbarLink href="/multiplayer">Multiplayer</NavbarLink>
      <hr className={styles.seperator} />
    </header>
  );
}
