import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { ChatClientProvider } from './services/chatClientContext';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChatClientProvider>
        <App />
      </ChatClientProvider>
      {import.meta.env.DEV ? (
        <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  </React.StrictMode>
);
