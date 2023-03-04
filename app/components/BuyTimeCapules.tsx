import { useWallet } from "@solana/wallet-adapter-react";
import { getMetaplex } from "../utils/getMetaplex";
import { FC, useState, useEffect } from "react";
import { strings } from "../constants/strings";
import * as web3 from "@solana/web3.js"
import Image from "next/image"
import { Button, Grid, Modal, Box, Typography, Stack, InputLabel, Select, MenuItem, FormControl, LinearProgress, Card } from '@mui/material';
import styles from "../styles/Home.module.css"
import * as bs58 from "bs58";
import * as token from "@solana/spl-token";




export const BuyTimeCapusles: FC = () => {
    const wallet = useWallet()
    const metaplex = getMetaplex(wallet, "secret")
    const connection = new web3.Connection(web3.clusterApiUrl(strings.NETWORK as web3.Cluster));
    const [timeCapsules, setTimeCapsules] = useState<any>([])
    const [nfts, setNfts] = useState<any>([])
    const [showCapsules, setshowCapsules] = useState(false)
    const [open, setOpen] = useState(false)
    const [progress, setProgress] = useState(0);
    const [progressColor, setProgressColor] = useState("primary" as any)
    const [progressText, setProgressText] = useState("Checking if wallet is connected")
    useEffect(() => {
        const fetchNFTs = async () => {
            let nfts: any = []
            const myNfts = await metaplex.nfts().findAllByOwner({
                owner: new web3.PublicKey(strings.TIME_CAPSULE_ACCOUNT)
            });
            for (let element of myNfts) {
                let nft = await fetch(element.uri)
                let data = await nft.json()
                // @ts-ignore
                nfts.push({ name: data.name, imageUrl: data.image.toString(), address: element.address.toString(), mint: element.mintAddress.toString() })

            }

            nfts.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            myNfts.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            setTimeCapsules(nfts)
            setNfts(myNfts)
            if (nfts.length !== 0)
                setshowCapsules(true)
        }
        fetchNFTs()
    }, [wallet])

    const checkBalance = async () => {
        if (wallet.publicKey) {
            let balance = await connection.getBalance(wallet.publicKey)
            let sols = balance / web3.LAMPORTS_PER_SOL
            console.log(sols)
            if (sols >= 1) {
                return true
            }
        }
        return false
    }
    const buyCapsule = async (e: any) => {
        setOpen(true)
        if (!wallet.connected) {
            setProgressText("Wallet not connected")
            setProgressColor("error")
        }
        if (wallet.publicKey?.toString() === strings.TIME_CAPSULE_ACCOUNT) {
            alert("Can't buy from same account")
            return
        }
        setProgress(15)
        setProgressText("Wallet Connected")
        let enoughBalance = await checkBalance()
        let capsulePubKey = e.target.id
        console.log(capsulePubKey)
        if (!enoughBalance) {
            alert("Not Enough Balance!")
            setProgressText("Not Enough Balance!")
            setProgressColor("error")
            return
        }
        if (wallet.publicKey) {
            const transferTransaction = new web3.Transaction().add(
                web3.SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: new web3.PublicKey(strings.TIME_CAPSULE_ACCOUNT),
                    lamports: web3.LAMPORTS_PER_SOL,
                })
            );
            try {
                await wallet.sendTransaction(transferTransaction, connection);
                setProgress(30)
                setProgressText("Enough Sol Available!")
            } catch {
                setProgressText("Transfer Failed!")
                setProgressColor("error")
                return
            }
            let nftOrSft = nfts.find((o: any) => o.name === e.target.id);
            console.log(nftOrSft)
            setProgress(40)
            setProgressText("Finding Token Accounts!")
            let tokenAccountSender;
            let tokenAccountReceiver;
            try {
                tokenAccountSender = await token.getOrCreateAssociatedTokenAccount(
                    connection,
                    web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_ACCOUNT_SECRET as string)),
                    new web3.PublicKey(capsulePubKey),
                    new web3.PublicKey(strings.TIME_CAPSULE_ACCOUNT),
                )

                tokenAccountReceiver = await token.getOrCreateAssociatedTokenAccount(
                    connection,
                    web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_ACCOUNT_SECRET as string)),
                    new web3.PublicKey(capsulePubKey),
                    new web3.PublicKey(wallet.publicKey),
                )
                setProgress(60)
                setProgressText("Token Accounts Found!")
            } catch {

                setProgressText("Token Accounts not found!")
                setProgressColor("error")
                return
            }
            setProgress(70)
            setProgressText("Tranfering Time Caspule")
            try {
                let txhash = await token.transferChecked(
                    connection, // connection
                    web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_ACCOUNT_SECRET as string)), // payer
                    tokenAccountSender.address, // from (should be a token account)
                    new web3.PublicKey(capsulePubKey), // mint
                    tokenAccountReceiver.address, // to (should be a token account)
                    web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_ACCOUNT_SECRET as string)), // from's owner
                    1, // amount, if your deciamls is 8, send 10^8 for 1 token
                    0 // decimals
                );
                setProgress(100)
                setProgressText("Hurray! Time Caspule Bought! Check your wallet or visit Home Page.")
            } catch {
                setProgressText("Buying Failed! Refunding Sol")
                setProgressColor("error")
                const refundTransaction = new web3.Transaction().add(
                    web3.SystemProgram.transfer({
                        fromPubkey: new web3.PublicKey(strings.TIME_CAPSULE_ACCOUNT),
                        toPubkey: wallet.publicKey,
                        lamports: web3.LAMPORTS_PER_SOL,
                    }))
                await wallet.sendTransaction(refundTransaction, connection);
                setProgressText("1 Sol refunded")
            }

            return
        }

    }

    const handleClose = () => {
        setOpen(false)
        window.location.reload()
    }
    return (
        <Grid container spacing={4} className={styles.center}>
            {showCapsules ?
                timeCapsules.map((element: any) => {
                    return (
                        <Grid item key={element.name}>
                            <Stack spacing={2} className={styles.center}>
                                <Image
                                    width={444}
                                    height={630}
                                    src={element.imageUrl}
                                    alt="null"
                                />
                                <Button variant="contained" component="label" onClick={buyCapsule} id={element.mint}>Buy {element.name}   1SOL</Button>
                            </Stack>
                        </Grid>
                    )
                })

                : <p>No Capsules available at this moment.</p>}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Card className={styles.modalStyle}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Buying In Progress
                    </Typography>
                    <br />
                    <LinearProgress variant="determinate" value={progress} color={progressColor} />
                    <p>{progressText}</p>
                </Card>
            </Modal>
        </Grid>
    )
}