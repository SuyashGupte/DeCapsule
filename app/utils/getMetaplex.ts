import { strings } from "../constants/strings";
import {
    Metaplex,
    walletAdapterIdentity,
    bundlrStorage,
    keypairIdentity
} from "@metaplex-foundation/js"
import { WalletContextState } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js"
import * as bs58 from "bs58";

export const getMetaplex = (wallet: WalletContextState, type: string) => {
    const connection = new web3.Connection(web3.clusterApiUrl(strings.NETWORK as web3.Cluster));
    if (type === "wallet") {
        const metaplex = Metaplex.make(connection)
            .use(walletAdapterIdentity(wallet))
            .use(
                bundlrStorage({
                    address: strings.BUNDLR_STORAGE_ADDRESS,
                    providerUrl: strings.BUNDLR_STORAGE_PROVIDER_URL,
                    timeout: 60000,
                })
            )
        return metaplex
    }else{
        const keypair = web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_BURIED_SECRET as string));
        const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(keypair))
        .use(
            bundlrStorage({
                address: strings.BUNDLR_STORAGE_ADDRESS,
                providerUrl: strings.BUNDLR_STORAGE_PROVIDER_URL,
                timeout: 60000,
            })
        )
    return metaplex
    }
}