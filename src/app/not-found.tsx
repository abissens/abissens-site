import Image from 'next/image';
import Link from 'next/link';
import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.imageWrapper}>
          <Image
            src="/assets/notfound.light.png"
            alt="Page not found"
            width={280}
            height={280}
            priority
            className={styles.lightImage}
          />
          <Image
            src="/assets/notfound.dark.png"
            alt="Page not found"
            width={280}
            height={280}
            priority
            className={styles.darkImage}
          />
        </div>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.description}>
          The page you are looking for does not exist or has been moved.
        </p>
        <nav className={styles.navigation}>
          <Link href="/" className={styles.link}>
            <span className={styles.linkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            Home
          </Link>
          <Link href="/blog" className={styles.link}>
            <span className={styles.linkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            Blog
          </Link>
          <Link href="/search" className={styles.link}>
            <span className={styles.linkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            Search
          </Link>
          <Link href="/tags" className={styles.link}>
            <span className={styles.linkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </span>
            Tags
          </Link>
        </nav>
      </div>
    </div>
  );
}
