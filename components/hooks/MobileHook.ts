import { useEffect, useState } from 'react';
import { isMobile } from '../../utils/functions/mobile';

export function useMobile() {
  // As navigator doesn't exist on server side, must use isMobile in useEffect to avoid undefined error
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobile());
  }, []);

  return mobile;
}
