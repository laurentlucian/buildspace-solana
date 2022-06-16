import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import theme from './libs/theme';
import Fonts from './libs/fonts';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/700.css';
import './main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Fonts />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
);
