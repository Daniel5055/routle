import styles from '../../styles/Navbar.module.scss';
import NavbarLink from './NavbarLink';
import { useEffect, useState } from 'react';
import { BlogLink } from './BlogLink';

export default function Navbar(props: { isMobile: boolean }) {
  const [portrait, setPortrait] = useState(props.isMobile);

  // Check the window size and adjust navbar accordingly
  useEffect(() => {
    if (window.innerWidth < 768) {
      setPortrait(true);
    } else {
      setPortrait(false);
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth < 768) {
        setPortrait(true);
      } else {
        setPortrait(false);
      }
    });
  }, []);

  return (
    <header className={styles.container}>
      <BlogLink/>
      {portrait ? (
        <>
          <h1 className={styles['title-alone']}>Routle</h1>
          <NavbarLink small href="/singleplayer">
            Singleplayer
          </NavbarLink>
          <NavbarLink small href="/multiplayer">
            Multiplayer
          </NavbarLink>
        </>
      ) : (
        <>
          <NavbarLink href="/singleplayer">Singleplayer</NavbarLink>
          <h1 className={styles['title']}>Routle</h1>
          <NavbarLink href="/multiplayer">Multiplayer</NavbarLink>
        </>
      )}
      <hr className={styles.separator} />
    </header>
  );
}
