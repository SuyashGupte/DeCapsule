import { useWallet } from "@solana/wallet-adapter-react";
import { getMetaplex } from "../utils/getMetaplex";
import { FC, useState, useEffect } from "react";
import { strings } from "../constants/strings";
import * as web3 from "@solana/web3.js"
import Image from "next/image"
import Link from "next/link"
import { Button, Grid, Modal, Box, Typography, Stack, InputLabel, Select, MenuItem, FormControl, LinearProgress, Card } from '@mui/material';
import styles from "../styles/Home.module.css"
import * as bs58 from "bs58";
import * as token from "@solana/spl-token";

export const ListTimeCapsules: FC = () => {
    const wallet = useWallet()
    const metaplex = getMetaplex(wallet, "secret")
    const [showOwnedCapsules, setSHowOwnedCapsules] = useState(false)
    const [timeCapsules, setTimeCapsules] = useState<any>([])
    const connection = new web3.Connection(web3.clusterApiUrl(strings.NETWORK as web3.Cluster));


    useEffect(() => {
        const fetchNFTs = async () => {
            let nfts: any = []
            let myNfts: any = []
            if (!wallet.connected) {
                return
            }
            if (wallet.publicKey) {
                myNfts = await metaplex.nfts().findAllByOwner({
                    owner: wallet.publicKey,
                });
            }
            for (let element of myNfts) {
                console.log(element)
                let nft = await fetch(element.uri)
                let data = await nft.json()
                // @ts-ignore
                if(element.creators[0].address.toString() === strings.TIME_CAPSULE_ACCOUNT)
                    nfts.push({ name: data.name, imageUrl: data.image.toString(), address: element.address.toString(), mint: element.mintAddress.toString() })
            }

            nfts.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            myNfts.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            setTimeCapsules(nfts)
            if(nfts.length !==0)
                setSHowOwnedCapsules(true)
            else
                setSHowOwnedCapsules(false)
        }
        fetchNFTs()
    }, [wallet])
    return (
        <Grid className={styles.center}>
            {!showOwnedCapsules ?
                wallet.connected ?
                    <Grid>
                        <h2 className={styles.whiteText}>No Capsules Found. Buy one now!</h2>
                        <Button variant="contained" component="label" className={styles.center}>
                            <Link href="/buy">Buy</Link>
                        </Button>
                    </Grid> : <h2 className={styles.whiteText}>Wallet not connected! Please connect wallet</h2>
                : 
                timeCapsules.map((element: any) => {
                    return (
                        <Grid item key={element.name}>
                            <Stack spacing={2} className={styles.center}>
                                <Image
                                    width={370}
                                    height={525}
                                    src={element.imageUrl}
                                    alt="null"
                                />
                                <Button variant="contained" component="label" id={element.mint}>Use {element.name} </Button>
                            </Stack>
                        </Grid>
                    )
                })}
        </Grid>
    )
}