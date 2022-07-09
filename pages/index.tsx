import type { NextPage } from 'next'
import Layout from '../components/common/Layout'
import styles from '../styles/Home.module.scss'

const Home: NextPage = () => {
  return (
    <Layout description='Routle the game'>
      <h1 className={styles.title}>
        Welcome to <a href="https://nextjs.org">Next.js!</a>
      </h1>
    </Layout>
  )
}

export default Home
