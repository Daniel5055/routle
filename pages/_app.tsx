import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import { Fragment } from 'react';
import Navbar from '../components/common/Navbar';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
export default MyApp;
