'use client';

import styles from './index.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useRoutes } from '@/components/providers/RouteContext';
import { ThemeSelector } from '@/components/themeSelector';
import { metadataInf } from '@/components/metadata';

const Header = () => {
    const { title, description } = metadataInf;
    const { paths } = useRoutes();

    return (
        <header className={styles.header}>
            <div className={styles.logoWrapper}>
                <Image
                    priority
                    src="/assets/logo.svg"
                    height={32}
                    width={32}
                    alt="Abisses site logo"
                />
            </div>
            <div className={styles.siteTitle}>
                <h2>{title}</h2>
                <h3>{description}</h3>
            </div>
            <nav className={styles['nav-menu']}>
                <Link href={paths.blog}>Posts</Link>
                <Link href={paths.tags}>Tags</Link>
                <Link href="/search">Search</Link>
                <Link href="/about">About</Link>
                <ThemeSelector/>
            </nav>
        </header>
    );
}

export default Header;
