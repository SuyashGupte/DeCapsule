import "../styles/globals.css"
import type { AppProps } from "next/app"
import WalletContextProvider from "../context/WalletContextProvider"
import { WorkspaceProvider } from "../context/Anchor"
import { StyledEngineProvider } from '@mui/material/styles';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletContextProvider>
      <WorkspaceProvider>
        <StyledEngineProvider injectFirst>
          <Component {...pageProps} />
        </StyledEngineProvider>
      </WorkspaceProvider>
    </WalletContextProvider>
  )
}

export default MyApp
