import { useEffect, useState } from 'react';

export const Timer = (props: {
  state: 'idle' | 'start' | 'countdown' | 'done';
}) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (props.state === 'start' || props.state === 'countdown') {
      const id = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);

      return () => clearInterval(id);
    }
  }, [props.state]);

  return (
    <>
      <h2>
        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
      </h2>
      <p>
        {props.state === 'idle'
          ? 'Starting soon!'
          : props.state === 'countdown'
          ? `You have 30 seconds left`
          : props.state === 'start'
          ? 'Get there first!'
          : 'Game is over!'}
      </p>
    </>
  );
};
