import Link from 'next/link';
import Image from 'next/image';
import info from '../../public/info.png';
import styles from '../../styles/Navbar.module.scss';
import { NotificationBubble } from '../common/NotificationBubble';
import { getLastReadPost } from '../../utils/functions/lastReadPost';
import posts from '../../public/blog/posts.json';

export function BlogLink() {
  const lastRead = getLastReadPost();
  const unread = lastRead ? posts.length - lastRead : undefined;

  // Show number if greater than 0, or ! if first visited
  const notificationText =
    unread !== undefined ? (unread > 0 ? unread.toString() : undefined) : '!';

  return (
    <Link href={'/blog'}>
      <a className={styles['nav-info']}>
        <NotificationBubble text={notificationText}>
          <Image src={info} alt="info" width={24} height={24} />
        </NotificationBubble>
      </a>
    </Link>
  );
}
