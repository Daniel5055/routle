import Navbar from '../navbar/Navbar';
import styles from '../../styles/Layout.module.scss';
import Head from 'next/head';

const Layout = (props: {
  children: JSX.Element | JSX.Element[];
  title?: string;
  description?: string;
  isMobile: boolean;
}) => {
  return (
    <>
      <Navbar isMobile={props.isMobile} />
      <div className={styles.container}>
        <Head>
          <title>{props.title ? props.title : 'Routle'}</title>
          {props.description ? (
            <meta name="description" content={props.description} />
          ) : null}
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>{props.children}</main>
      </div>
    </>
  );
};

export default Layout;
