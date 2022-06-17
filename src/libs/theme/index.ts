import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import type { GlobalStyleProps } from '@chakra-ui/theme-tools';

const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark',
  },
  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        color: mode('#161616', '#EEE6E2')(props),
        bg: mode('#EEE6E2', '#131415')(props),
        lineHeight: 'base',
      },
    }),
  },
  fonts: {
    heading: 'Roboto Mono, MonoLisa Bold, sans-serif',
    body: 'Roboto Mono, MonoLisa, sans-serif',
  },
});

export default theme;
