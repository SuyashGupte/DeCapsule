import {Metaplex} from "@metaplex-foundation/js";

export const uploadMetadata = async (metaplex: Metaplex, nftName: string, nftDescription: string, imageUri : string, attributes: any) => {
    const { uri } = await metaplex
                .nfts()
                .uploadMetadata({
                    name: nftName,
                    description: nftDescription,
                    image: imageUri,
                    attributes: attributes,
                });
    return uri
}