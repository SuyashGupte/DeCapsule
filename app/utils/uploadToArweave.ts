import * as web3 from "@solana/web3.js"
import {
    Metaplex,
    toMetaplexFile,
} from "@metaplex-foundation/js"
import { strings } from "../constants/strings"



export const uploadToArweave = async (fileBuffer: any, fileName: string, metaplex: Metaplex) => {

    const file = toMetaplexFile(fileBuffer, fileName)
    try{
    const imageUri = await metaplex.storage().upload(file)
    return imageUri
    } catch (err) {
        return err
    }
    

}