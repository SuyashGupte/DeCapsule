import "../styles/globals.css"
import type { AppProps } from "next/app"
import WalletContextProvider from "../context/WalletContextProvider"
import { WorkspaceProvider } from "../context/Anchor"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletContextProvider>
        <WorkspaceProvider>
          <Component {...pageProps} />
        </WorkspaceProvider>
    </WalletContextProvider>
  )
}

export default MyApp
