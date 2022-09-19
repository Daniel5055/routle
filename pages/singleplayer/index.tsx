import { readFileSync } from 'fs';
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { LoadingLink } from '../../components/common/LoadingLink';
import { Slider } from '../../components/common/Slider';
import styles from '../../styles/Singleplayer.module.scss';
import { MapData } from '../../utils/types/MapData';
import Cookies from 'js-cookie';
import { applyDifficulty } from '../../utils/functions/difficulty';

const Singleplayer: NextPage = ({
  mapData,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [difficulty, setDifficulty] = useState(
    parseInt(Cookies.get('Difficulty') ?? '3.0')
  );
  const [difficultyText, setDifficultyText] = useState('Normal');

  const handleDifficultyChange = (value: number) => {
    setDifficulty(value);
    setDifficultyText(applyDifficulty(value));
  };

  useEffect(() => {
    handleDifficultyChange(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout description="Singleplayer Routle">
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
      <h2 className={styles.header}>Difficulty</h2>
      <p className={styles.tag}>{difficultyText}</p>
      <Slider
        min={1}
        max={5}
        value={difficulty}
        setValue={handleDifficultyChange}
      />
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
