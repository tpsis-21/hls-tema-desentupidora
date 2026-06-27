/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
        // --- Admin CMS - Hub Local Sites (branco, laranja, preto) ---
        'adm-bg': 'rgb(var(--c-bg) / <alpha-value>)',
        'adm-surface': 'rgb(var(--c-surface) / <alpha-value>)',
        'adm-elev': 'rgb(var(--c-elev) / <alpha-value>)',
        'adm-border': 'rgb(var(--c-border) / <alpha-value>)',
        'adm-rule': 'rgb(var(--c-rule) / <alpha-value>)',
        'adm-ink': 'rgb(var(--c-ink) / <alpha-value>)',
        'adm-ink-muted': 'rgb(var(--c-ink-muted) / <alpha-value>)',
        'adm-ink-faint': 'rgb(var(--c-ink-faint) / <alpha-value>)',
        'adm-primary': 'rgb(var(--c-primary) / <alpha-value>)',
        'adm-primary-soft': 'rgb(var(--c-primary-soft) / <alpha-value>)',
        'adm-sidebar': 'rgb(var(--c-sidebar) / <alpha-value>)',
        'adm-sidebar-fg': 'rgb(var(--c-sidebar-fg) / <alpha-value>)',
        'adm-sidebar-muted': 'rgb(var(--c-sidebar-muted) / <alpha-value>)',
        'adm-sidebar-accent': 'rgb(var(--c-sidebar-accent) / <alpha-value>)',
        'adm-sidebar-border': 'rgb(var(--c-sidebar-border) / <alpha-value>)',
                violet: {
                    50:  '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    950: '#2e1065',
                },
            },
        },
    },
    plugins: [],
}
