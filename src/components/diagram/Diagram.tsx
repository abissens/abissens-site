'use client';

import { useTheme } from '@/components/providers/ThemeContext';
import Image from 'next/image';
import styles from './Diagram.module.scss';

interface DiagramProps {
    name: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
}

export default function Diagram({ name, alt, width = 800, height = 400, className }: DiagramProps) {
    const { theme } = useTheme();
    const src = `/diagrams/${name}.${theme}.svg`;

    return (
        <figure className={`${styles.diagram} ${className || ''}`}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={styles.image}
                priority={false}
            />
            <figcaption className={styles.caption}>{alt}</figcaption>
        </figure>
    );
}
