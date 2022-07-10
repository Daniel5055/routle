import Link from 'next/link';
import { useState } from 'react';

export const LoadingLink = ({
  src,
  children,
  className,
}: {
  className: string;
  src: string;
  children: string;
}) => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <p className={className}>Loading...</p>;
  } else {
    return (
      <Link href={src}>
        <a className={className} onClick={() => setLoading(true)}>
          {children}
        </a>
      </Link>
    );
  }
};
