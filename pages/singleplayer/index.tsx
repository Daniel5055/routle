import { readFileSync } from 'fs';
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import Layout from '../../components/common/Layout';
import { LoadingLink } from '../../components/common/LoadingLink';
import styles from '../../styles/Singleplayer.module.scss';
import { MapData } from '../../utils/types/MapData';
import { useMobile } from '../../components/hooks/MobileHook';

const Singleplayer: NextPage = ({
  mapData,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const isMobile = useMobile();

  return (
    <Layout description="Singleplayer Routle" isMobile={isMobile}>
      <h2 className={styles.header}>Where to?</h2>
      <hr className={styles.underline} />
      <div className={styles['options-container']}>
        {mapData
          .sort((a: MapData, b: MapData) => {
            return a.name.localeCompare(b.name);
          })
          .map((map: MapData) => {
            return (
              <LoadingLink
                key={map.name}
                src={`/singleplayer/${map.webPath}`}
                className={styles.option}
              >
                {map.name}
              </LoadingLink>
            );
          })}
      </div>
      <hr className={styles.underline} />
      <LoadingLink src={`/settings`} className={styles['setting-button']}>
        Settings
      </LoadingLink>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const data = readFileSync('public/mapList.json');
  const mapData: MapData[] = JSON.parse(data.toString());

  return {
    props: {
      mapData,
    },
  };
};

export default Singleplayer;
