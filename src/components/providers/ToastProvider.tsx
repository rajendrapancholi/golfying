import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from 'next-themes';

const ToastProvider: React.FC = () => {
    const { theme } = useTheme();

    const lightStyles = {
        background: 'var(--color-background)',
        color: 'var(--color-foreground)',
    };

    const darkStyles = {
        background: 'var(--color-background)',
        color: 'var(--color-foreground)',
    };

    const successLight = {
        background: '#d1fae5',
        color: 'var(--color-success)',
    };

    const successDark = {
        background: 'rgba(16, 185, 129, 0.1)',
        color: 'var(--color-success)',
    };

    const errorLight = {
        background: '#fee2e2',
        color: 'var(--color-destructive)',
    };

    const errorDark = {
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--color-destructive)',
    };

    const loadingLight = {
        background: '#fef3c7',
        color: 'var(--color-warning)',
    };

    const loadingDark = {
        background: 'rgba(245, 158, 11, 0.1)',
        color: 'var(--color-warning)',
    };

    return (
        <Toaster
            position="top-center"
            toastOptions={{
                className: 'text-sm',
                style: theme === 'dark' ? darkStyles : lightStyles,
                success: {
                    style: theme === 'dark' ? successDark : successLight,
                },
                error: {
                    style: theme === 'dark' ? errorDark : errorLight,
                },
                loading: {
                    style: theme === 'dark' ? loadingDark : loadingLight,
                },
            }}
        />
    );
};

export default ToastProvider;
