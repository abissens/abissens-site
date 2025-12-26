import Image from 'next/image';
import styles from './Loading.module.scss';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Loading({
  message = 'Loading...',
  size = 'medium'
}: LoadingProps) {
  const dimensions = {
    small: 80,
    medium: 120,
    large: 180,
  };

  return (
    <div className={`${styles.loading} ${styles[size]}`}>
      <div className={styles.imageWrapper}>
        <Image
          src="/assets/loading.png"
          alt="Loading"
          width={dimensions[size]}
          height={dimensions[size]}
          priority
        />
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
