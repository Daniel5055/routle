import { NextPage, InferGetStaticPropsType } from 'next';
import { getStaticProps } from './blog';
import Layout from '../components/common/Layout';
import { useMobile } from '../components/hooks/MobileHook';
import styles from '../styles/Singleplayer.module.scss';
import { Slider } from '../components/common/Slider';
import { useRef, useState } from 'react';
import difficulty, {
  difficultyName,
} from '../utils/functions/settings/difficulty';
import { LoadingLink } from '../components/common/LoadingLink';
import priority, {
  cityPriorities,
  CityPriority,
} from '../utils/functions/settings/priority';
import holes from '../utils/functions/settings/holes';

const Settings: NextPage = ({}: InferGetStaticPropsType<
  typeof getStaticProps
>) => {
  const isMobile = useMobile();

  const difficultyValue = useRef(difficulty.getValue());
  const holesValue = useRef(holes.getValue());
  const [priorityValue, setPriorityValue] = useState(priority.getValue());
  return (
    <Layout description="Singleplayer Routle" isMobile={isMobile}>
      <h2 className={styles.header}>Settings</h2>
      <hr className={styles.underline} />
      <div
        className={styles.setting}
        title="How big the radius of the circle is"
      >
        <h3 className={styles.header}>Difficulty</h3>
        <Slider
          min={1}
          max={5}
          initialValue={difficultyValue.current}
          initialText={difficultyName(difficultyValue.current)}
          onValueChange={(v) => {
            difficulty.setValue(v);
            return difficultyName(v);
          }}
        />
      </div>
      <div
        className={styles.setting}
        title="How to pick cities with the same name"
      >
        <h3 className={styles.header}>City Priority</h3>
        <select
          value={priorityValue}
          onChange={(e) => {
            priority.setValue(e.target.value as CityPriority);
            setPriorityValue(e.target.value as CityPriority);
          }}
          className={styles['setting-select']}
        >
          {cityPriorities.map((p) => (
            <option
              value={p}
              key={p}
              className={styles['setting-option']}
              title={
                p === 'Hybrid'
                  ? 'Pick the largest city within range, and the closest out of range'
                  : p === 'Proximity'
                  ? 'Pick the closest city always'
                  : p === 'Population'
                  ? 'Pick the largest city always'
                  : ''
              }
            >
              {p}
            </option>
          ))}
        </select>
      </div>
      <div
        className={styles.setting}
        title="Holes are inaccessible areas on the map, how many do you want?"
      >
        <h3 className={styles.header}>Holes</h3>
        <Slider
          min={0}
          max={5}
          initialValue={holesValue.current}
          initialText={holesValue.current.toString()}
          onValueChange={(v) => {
            holes.setValue(v);
            return v.toString();
          }}
        />
      </div>
      <hr className={styles.underline} />
      <LoadingLink src={`/singleplayer/`} className={styles.option}>
        Back
      </LoadingLink>
    </Layout>
  );
};

export default Settings;
