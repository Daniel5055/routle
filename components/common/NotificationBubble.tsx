import styles from '../../styles/NotificationBubble.module.scss'

export function NotificationBubble(props: {
  children: JSX.Element,
  text?: String,
}) {

  return (
    <div className={styles['wrapper']}>
      {props.children}
      {props.text ? <span className={styles['bubble']}>
        {props.text}
      </span> : null}
    </div>
  )
}