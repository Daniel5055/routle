import { useEffect, useState } from 'react';
import styles from '../../styles/NotificationBubble.module.scss';

export function NotificationBubble(props: {
  children: JSX.Element;
  text?: String;
}) {
  // FIXME Notification text can only have max 2 characters.

  // Fixes hydration errors
  const [state, setState] = useState(false);
  useEffect(() => {
    setState(true);
  }, []);

  return state ? (
    <div className={styles['wrapper']}>
      {props.children}
      {props.text ? (
        <span className={styles['bubble']}>{props.text}</span>
      ) : null}
    </div>
  ) : null;
}
