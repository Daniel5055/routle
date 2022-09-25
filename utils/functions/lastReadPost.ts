import Cookies from "js-cookie";

const POST_COOKIE = 'lastRead';

/**
 * Fetches the last read post using cookies
 * 
 * @returns The last read post id or undefined if not set
 */
export function getLastReadPost(): number | undefined {
  const lastRead = parseInt(Cookies.get(POST_COOKIE) ?? '');
  return isNaN(lastRead) ? undefined : lastRead;
}

/**
 * Sets the last read post using cookies
 * @param post The id of the last read post
 */
export function setLastReadPost(post: number): void {
  Cookies.set(POST_COOKIE, post.toString());
}