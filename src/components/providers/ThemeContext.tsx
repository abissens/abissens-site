"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { type Theme } from '@/lib/theme';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        return 'light';
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const htmlElement = document.documentElement;
        const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';

        setTheme(currentTheme);
    }, []);

    const toggleTheme = () => {
        if (!mounted) return;

        const newTheme = theme === 'light' ? 'dark' : 'light';

        setTheme(newTheme);

        const htmlElement = document.documentElement;
        htmlElement.classList.remove('light', 'dark');
        htmlElement.classList.add(newTheme);

        htmlElement.style.colorScheme = newTheme;

        localStorage.setItem('theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
