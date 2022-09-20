import { useRef, useState } from 'react';
import styles from '../../styles/Singleplayer.module.scss';

export const CityInput = (props: {
  handleEntry: (entry: string) => void;
  placeholder?: string;
}) => {
  // What is shown in the input box before typing, removed after typing
  const [placeholder, setPlaceholder] = useState(props.placeholder ?? '');
  const [entry, setEntry] = useState('');

  // Keep focus on text input on deskop broswer
  const focusInput = useRef<HTMLInputElement>(null);
  setInterval(() => focusInput.current?.focus(), 5);

  // On enter press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // On enter press
    if (e.key === 'Enter') {
      if (entry.trim().length > 0) {
        props.handleEntry(entry.trim());
        setEntry('');
      }
    }
  };

  return (
    <>
      <input
        type="text"
        aria-label="input"
        autoFocus
        onKeyDown={handleKeyDown}
        value={entry}
        onChange={(e) => {
          setEntry(e.target.value);

          // Clear placeholder after first typing
          if (placeholder !== '') {
            setPlaceholder('');
          }
        }}
        placeholder={placeholder}
        ref={focusInput}
      />
      <hr className={styles['input-line']} />
    </>
  );
};
