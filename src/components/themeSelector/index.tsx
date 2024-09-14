"use client";

import styles from './index.module.scss';
import {useTheme} from '@/components/providers/ThemeContext';

export const ThemeSelector = () => {
    const {toggleTheme} = useTheme();

    return (
        <button
            className={styles.themeButton}
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light mode"
        />
    );
};