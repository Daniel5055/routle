import { readFileSync } from 'fs';
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { LoadingLink } from '../../components/common/LoadingLink';
import { Slider } from '../../components/common/Slider';
import styles from '../../styles/Singleplayer.module.scss';
import { MapData } from '../../utils/types/MapData';
import Cookies from 'js-cookie'

const Singleplayer: NextPage = ({
  mapData,
}: InferGetStaticPropsType<typeof getStaticProps>) => {

  const [difficulty, setDifficulty] = useState(parseInt(Cookies.get('Difficulty') ?? '3.0'))
  const [difficultyText, setDifficultyText] = useState('Normal')

  useEffect(() => {
    handleDifficultyChange(difficulty)
  }, [])

  const handleDifficultyChange = (value: number) => {
    setDifficulty(value);
    switch(value) {
      case 1:
        setDifficultyText('Baby Mode')
        Cookies.set('Difficulty', '1')
        break;
      case 2:
        setDifficultyText('Easy')
        Cookies.set('Difficulty', '2')
        break;
      case 3:
        setDifficultyText('Normal')
        Cookies.set('Difficulty', '3')
        break;
      case 4:
        setDifficultyText('Hard')
        Cookies.set('Difficulty', '4')
        break;
      case 5:
        setDifficultyText('Fredrik mode')
        Cookies.set('Difficulty', '5')
        break;
      default:
        setDifficultyText('Unknwon territory?: ' + value)
        Cookies.set('Difficulty', '1.0')
        break;
    }
  }

  return (
    <Layout description="Singleplayer Routle">
      <h2 className={styles.header}>Where to?</h2>
      <hr className={styles.underline} />
      {mapData
        .sort((a: MapData, b: MapData) => {
          return a.name > b.name;
        })
        .map((map: MapData) => {
          return (
            <LoadingLink
              key={map.name}
              src={`/singleplayer/${map.name}`}
              className={styles.option}
            >
              {map.name}
            </LoadingLink>
          );
        })}
      <hr className={styles.underline} />
      <h2 className={styles.header}>Difficulty</h2>
      <h3 className={styles.tag}>{difficultyText}</h3>
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
