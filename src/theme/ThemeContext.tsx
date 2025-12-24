import React, { createContext, useContext, ReactNode } from 'react';
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { shadows } from './shadows';

export interface Theme {
    colors: typeof colors;
    typography: typeof typography;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    shadows: typeof shadows;
}

const theme: Theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
};

const ThemeContext = createContext<Theme>(theme);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

export const useTheme = (): Theme => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export { theme };
