import { readFileSync } from 'fs'
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import Link from 'next/link'
import Layout from '../../components/common/Layout'
import styles from '../../styles/Singleplayer.module.scss'
import { MapData } from '../../utils/types/MapData'

const Singleplayer: NextPage = ({mapData}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Layout description='Singleplayer Routle'>
      <h2 className={styles.prompt}>Where to?</h2>
      <hr className={styles.underline} />
      {mapData
        .sort((a: MapData, b: MapData) => {
          return a.name > b.name
        })
        .map((map: MapData) => {
          return <button className={styles.option} key={map.name}>
              <Link href={`/singleplayer/${map.name}`}>
                <a className={styles['nav-link']}>
                  {map.name}
                </a>
              </Link>
            </button>
        })}
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const data = readFileSync('public/mapList.json');
  const mapData: MapData[] = JSON.parse(data.toString());

  return {
    props: {
      mapData,
    }
  }

}

export default Singleplayer