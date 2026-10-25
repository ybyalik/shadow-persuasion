import { EB_Garamond, Special_Elite } from 'next/font/google';

// The book's reading face, plus the typewriter used for small "case file" labels.
export const appSerif = EB_Garamond({ subsets: ['latin'], variable: '--font-app-serif', display: 'swap' });
export const appType = Special_Elite({ subsets: ['latin'], weight: '400', variable: '--font-app-type', display: 'swap' });
