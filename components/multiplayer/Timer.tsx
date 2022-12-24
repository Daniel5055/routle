import { useEffect, useState } from 'react';

export const Timer = (props: { state: 'idle' | 'start' | 'countdown' | 'done' }) => {
  const [time, setTime] = useState(0);
  const [countdownTime, setCountdownTime] = useState(30 + 1);

  useEffect(() => {
    if (props.state === 'start' || props.state === 'countdown') {
      const id = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);

      return () => clearInterval(id);
    }
  }, [props.state]);

  useEffect(() => {
    if (props.state === 'countdown') {
      setCountdownTime((t) => (t <= 0 ? 0 : t - 1));
    }
  }, [props.state, time]);

  return (
    <>
      <h2>
        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
      </h2>
      <p>
        {props.state === 'idle'
          ? 'Starting soon!'
          : props.state === 'countdown'
          ? `You have ${countdownTime} seconds left`
          : props.state === 'start'
          ? 'Get there first!'
          : 'Game is over!'}
      </p>
    </>
  );
};
