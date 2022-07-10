import styles from '../../styles/Slider.module.scss'

export const Slider = ({
  min,
  max,
  value,
  setValue,
  className,
}:{
  min: number;
  max: number;
  value: number;
  setValue: (value: number) => void;
  className?: string;
}) => {

  return (
    <div className={styles.container}>
      <hr className={styles.line}/>
      <input 
        title='difficulty'
        type='range'
        min={min}
        max={max}
        value={value}
        onInput={(e) => { setValue(parseInt(e.currentTarget.value)) }}
        className={styles['slider']}/>
    </div>
  )

}