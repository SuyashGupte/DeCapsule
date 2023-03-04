import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { strings } from '../constants/strings'
import { Button, Grid, Card, CardContent, TextField, Typography, Stack, InputLabel, Select, MenuItem, FormControl, LinearProgress } from '@mui/material';
import styles from "../styles/Home.module.css"
import Image from "next/image"
import { uploadToArweave } from '@/utils/uploadToArweave';
import { getMetaplex } from '../utils/getMetaplex';
import {toBigNumber} from '@metaplex-foundation/js'
import * as web3 from "@solana/web3.js"
import * as bs58 from "bs58";


export const MintTimeCapsules: FC = () => {

    const wallet = useWallet()
    const [authorizedUser, setAuthourizedUser] = useState(false)
    const [submitDisabled, setSubmitDisabled] = useState(true)
    const [image, setImage] = useState<FileList | null>(null)
    const [timeCapsuleNumber, setTimeCapsuleNumber] = useState(0)
    const [standard, setStandard] = useState("Base")
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [nftAddress, setNftAddress] = useState("")
    const metaplex = getMetaplex(wallet, "wallet")
    const nftMetaData = {
        nftName: 'Time Capsule',
        description: 'Time Capsule for your memories.',
        attributes: [
            { trait_type: 'Standard', value: '' },
        ],
        sellerFeeBasisPoints: 500,//500 bp = 5%
        symbol: 'DCPSLE',
        creators: [
            { address: wallet.publicKey, share: 100 }
        ]
    };

    useEffect(() => {
        if (wallet.publicKey?.toString() === strings.TIME_CAPSULE_ACCOUNT) {
            setAuthourizedUser(true)
        } else {
            setAuthourizedUser(false)
        }
    }, [wallet])

    const validateForm = (image: FileList | null | undefined, num: number) => {
        if (image && num) {
            setSubmitDisabled(false)
        } else {
            setSubmitDisabled(true)
        }
    }

    const fileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setImage(e.target.files)
        validateForm(e.target.files, timeCapsuleNumber)
    }

    const handleStandard = (e: any) => {
        setStandard(e.target.value)
        nftMetaData.attributes[0].value = e.target.value;
    }

    const updateNFTData = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTimeCapsuleNumber(e.target.valueAsNumber)
        validateForm(image, e.target.valueAsNumber)
    }
    const mintNFT = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true)
        setProgress(0)
        setSubmitDisabled(true)
        if (image) {
            nftMetaData.nftName = `${nftMetaData.nftName} #${timeCapsuleNumber}`
            nftMetaData.symbol = `${nftMetaData.symbol} #${timeCapsuleNumber}`
            nftMetaData.attributes[0].value = standard
            let fileBuffer = await image[0].arrayBuffer()
            let imageUri = await uploadToArweave(fileBuffer, image[0].name, metaplex)
            console.log(imageUri)
            setProgress(33)
            const { uri } = await metaplex
                .nfts()
                .uploadMetadata({
                    name: nftMetaData.nftName,
                    description: nftMetaData.description,
                    image: imageUri as string,
                    attributes: nftMetaData.attributes,
                });
            //let uri = "https://arweave.net/o4rxFZFfgz4Ut0vWiQKj_Oo0nVX5G24Mrd2-OrHMpqs"
            setProgress(66)
            const { nft } = await metaplex
                .nfts()
                .create({
                    uri: uri,
                    name: nftMetaData.nftName,
                    sellerFeeBasisPoints: nftMetaData.sellerFeeBasisPoints,
                    symbol: nftMetaData.symbol,
                    isMutable: false,
                    //useNewMint: web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_MINT_SECRET as string)),
                    //mintAuthority:  web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_MINT_SECRET as string)),
                    //useExistingMint: new web3.PublicKey("3XtjtH5G6mkwrxqe7btccEmUZ5qMo2XEWhs3ch55sKpb")
                    
                }, { commitment: "finalized" });

            console.log(`   Success!🎉`);
            console.log(`   Minted NFT: https://explorer.solana.com/address/${nft.address}?cluster=devnet`);
            setProgress(100)
            setNftAddress(nft.address.toString())
        }

    }

    return (
        authorizedUser ?
            <div>
                <Grid>
                    <Card className={`${styles.formGroup} ${styles.center}`}>
                        <CardContent >
                            <Typography gutterBottom variant="h5">
                                Time Capsule Details
                            </Typography>
                            <form onSubmit={mintNFT}>
                                <Stack direction="column" spacing={5} className={styles.center}>
                                    {image ?
                                        <Image
                                            width={500}
                                            height={500}
                                            src={image ? URL.createObjectURL(image[0]) : ""}
                                            alt={image ? URL.createObjectURL(image[0]) : ""}
                                        /> : null}

                                    <Button variant="outlined" component="label">
                                        Upload image
                                        <input hidden accept="image/*" type="file" name="image-upload" onChange={fileHandler} required />
                                    </Button>
                                    <TextField
                                        type="number"
                                        placeholder="Enter time capsule number"
                                        label="Time Capsule Number"
                                        variant="outlined"
                                        fullWidth
                                        onChange={updateNFTData}
                                        required
                                    />
                                    <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">Age</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={standard}
                                            label="Standard"
                                            onChange={handleStandard}
                                        >
                                            <MenuItem value={"Base"}>Base</MenuItem>
                                            <MenuItem value={"Silver"}>Silver</MenuItem>
                                            <MenuItem value={"Gold"}>Gold</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Button
                                        size="large"
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={submitDisabled}
                                    >
                                        Submit
                                    </Button>
                                    {loading ?
                                        <LinearProgress variant="determinate" value={progress} /> : null}

                                    {nftAddress ? <h2>{nftAddress}</h2> : null}
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </div> : <div>
                <h2>You are not authorized to view this page.</h2>
            </div>
    )
}


