import {Metaplex} from "@metaplex-foundation/js";

export const mintNFT = async (metaplex: Metaplex, metaDataUri: string, nftName: string, nftSellerFeeBasisPoints: number, symbol : string, creators: any) => {
    const { nft } = await metaplex
                .nfts()
                .create({
                    uri: metaDataUri,
                    name: nftName,
                    sellerFeeBasisPoints: nftSellerFeeBasisPoints,
                    symbol: symbol,
                    isMutable: false,
                    creators: creators

                }, { commitment: "finalized" });
    return nft

}