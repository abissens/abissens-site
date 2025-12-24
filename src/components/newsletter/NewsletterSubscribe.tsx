'use client';

import styles from './NewsletterSubscribe.module.scss';

const SUBSTACK_URL = 'https://abissens.substack.com';

interface NewsletterSubscribeProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function NewsletterSubscribe({
  variant = 'default',
  className
}: NewsletterSubscribeProps) {
  return (
    <section className={`${styles.newsletter} ${styles[variant]} ${className || ''}`}>
      <div className={styles.content}>
        <h3 className={styles.title}>Subscribe to the newsletter</h3>
        <p className={styles.description}>
          Get notified when new articles are published. No spam, unsubscribe anytime.
        </p>
      </div>

      <form
        action={`${SUBSTACK_URL}/api/v1/free`}
        method="post"
        target="_blank"
        className={styles.form}
      >
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          className={styles.input}
          aria-label="Email address"
        />
        <button type="submit" className={styles.button}>
          Subscribe
        </button>
      </form>

      <p className={styles.powered}>
        Powered by{' '}
        <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer">
          Substack
        </a>
      </p>
    </section>
  );
}
