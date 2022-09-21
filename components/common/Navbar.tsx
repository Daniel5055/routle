import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/Navbar.module.scss';
import NavbarLink from './NavbarLink';
import info from '../../public/info.png';
import { useEffect, useState } from 'react';

export default function Navbar(props: { isMobile: boolean}) {
  const [portrait, setPortrait] = useState(props.isMobile)

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
    })
  }, [])

  return (
    <header className={styles.container}>
      <Link href={'/blog'}>
        <a className={styles['nav-info']}>
          <Image src={info} alt="info" width={24} height={24} />
        </a>
      </Link>
      { portrait ? 
        <>
          <h1 className={styles['title-alone']}>Routle</h1>
          <NavbarLink small href="/singleplayer">Singleplayer</NavbarLink>
          <NavbarLink small href="/multiplayer">Multiplayer</NavbarLink>
        </>
        :
        <>
          <NavbarLink href="/singleplayer">Singleplayer</NavbarLink>
          <h1 className={styles['title']}>Routle</h1>
          <NavbarLink href="/multiplayer">Multiplayer</NavbarLink>
        </>
      }
      <hr className={styles.seperator} />
    </header>
  );
}
