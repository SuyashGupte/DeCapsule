
import * as token from "@solana/spl-token";
import * as web3 from "@solana/web3.js"
import { strings } from "../constants/strings";

export const transferNFT = async (tokenAccountSender:any, tokenAccountReceiver:any, nftMintAddress:web3.PublicKey, payer:web3.Keypair, owner:web3.Keypair) => {
    const connection = new web3.Connection(web3.clusterApiUrl(strings.NETWORK as web3.Cluster));
    let txhash = await token.transferChecked(
        connection, // connection
        payer, // payer
        tokenAccountSender, // from (should be a token account)
        nftMintAddress, // mint
        tokenAccountReceiver, // to (should be a token account)
        owner, // from's owner
        1, // amount, if your decimals is 8, send 10^8 for 1 token
        0 // decimals
    )
    return txhash
}