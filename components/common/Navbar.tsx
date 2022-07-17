import styles from '../../styles/Navbar.module.scss';
import NavbarLink from './NavbarLink';

export default function Navbar() {
  return (
    <header className={styles.container}>
      <NavbarLink href="/singleplayer">Singleplayer</NavbarLink>
      <h1 className={styles['title']}>Routle</h1>
      <NavbarLink href="/multiplayer">Multiplayer</NavbarLink>
      <hr className={styles.seperator} />
    </header>
  );
}
