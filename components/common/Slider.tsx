import { useState } from 'react';
import styles from '../../styles/Slider.module.scss';

export const Slider = ({
  min,
  max,
  initialValue,
  initialText,
  onValueChange,
}: {
  min: number;
  max: number;
  initialValue: number;
  initialText?: string;
  onValueChange: (value: number) => string | void;
}) => {

  const [value, setValue] = useState(initialValue);
  const [tag, setTag] = useState(initialText);

  return (
    <div className={styles.container}>
      {tag ? <p className={styles.tag}>{tag}</p> : null}
      <hr className={styles.line} />
      <input
        title="difficulty"
        type="range"
        min={min}
        max={max}
        value={value}
        onInput={(e) => {
          setValue(parseInt(e.currentTarget.value));
          setTag(onValueChange(parseInt(e.currentTarget.value)) ?? '');
        }}
        className={styles['slider']}
      />
    </div>
  );
};
