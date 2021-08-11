import '../styles/main.scss'
import { QueryClient, QueryClientProvider } from "react-query";
import Head from 'next/head';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        {/* <script async src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js" /> */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}

export default MyApp
