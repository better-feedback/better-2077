import React from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import "../styles/globals.css";
import type { AppProps } from "next/app";
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygonMumbai } from 'wagmi/chains';

// const { wallets } = getDefaultWallets();

// function MyPage() {
//   const { data, error, isLoading } = useQuery({
//     queryKey: ['example'],
//     queryFn: () => fetch('/api/example').then(res => res.json())
//   });

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   return (
//     <div>
//       {data ? data.message : 'No data found'}
//     </div>
//   );
// }

// export default MyPage;

const config = createConfig({
  chains: [polygonMumbai],
  transports: {
    [polygonMumbai.id]: http(),
  },
});

const queryClient = new QueryClient();
console.log("Query Client:", queryClient);

export default function App({ Component, pageProps }: AppProps) {
  console.log("AppProps:", pageProps); // Logs the pageProps to see what is being passed down to components
  // const [stableQueryClient] = React.useState(() => new QueryClient());

  return (
    <UserProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme({
            accentColor: '#EC4899',
          })}>
            <Component {...pageProps} />
            <ReactQueryDevtools initialIsOpen={false} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </UserProvider>
  );
}