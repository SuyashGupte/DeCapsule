import { useWallet } from "@solana/wallet-adapter-react";
import { getMetaplex } from "../utils/getMetaplex";
import { FC, useState, useEffect } from "react";
import { Button, Typography, TextField, Stack, Card, CardContent, CardMedia, Box, Paper } from '@mui/material';
import styles from "../styles/Home.module.css"
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useWorkspace } from "../context/Anchor"



export const VerifyNFT: FC = () => {
    const wallet = useWallet()
    const metaplex = getMetaplex(wallet, "secret")
    const [nfts, setNfts] = useState<any>([])
    const [nftValue, setNftValue] = useState("")
    const [submitDisabled, setSubmitDisabled] = useState(true)
    const [validNft, setValidNft] = useState<any>({})
    const [showResult, setShowResult] = useState(false)
    const { program } = useWorkspace()



    useEffect(() => {
        const fetchAccounts = async () => {
            if (program) {
                const accounts = (await program.account.nftState.all()) ?? []
                console.log(accounts)
                let nfts: any = []
                for (let account of accounts) {
                    console.log(account.account)
                    let mintAddress = account.account.nft
                    console.log(mintAddress.toString())
                    let nft = await metaplex.nfts().findByMint({ mintAddress });
                    let nftData = await fetch(nft.uri)
                    let data = await nftData.json()
                    console.log("capsule", nft)
                    console.log(data)
                    if (new Date(account.account.sealDuration) <= new Date()) {
                        nfts.push({
                            image: data.image,
                            sealDuration: account.account.sealDuration,
                            buryTime: timeConverter(parseInt(account.account.buryTime)),
                            location: account.account.location,
                            nftName: data.name,
                            nftDescription: data.description,
                            nftMintAddress: mintAddress
                        })
                    }
                }
                setNfts([...nfts])
                console.log(nfts)
            }
        }
        fetchAccounts()
    }, [])

    const timeConverter = (UNIX_timestamp: number) => {
        let a = new Date(UNIX_timestamp);
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let year = a.getFullYear();
        let month = months[a.getMonth()];
        let date = a.getDate();
        let hour = a.getHours();
        let min = a.getMinutes();
        let sec = a.getSeconds();
        let time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNftValue(e.target.value.trim())
        if (e.target.value.trim() === "") {
            setSubmitDisabled(true)
        } else {
            setSubmitDisabled(false)
        }
        setValidNft({})
        setShowResult(false)

    }

    const validateNFT = () => {
        for (let nft of nfts) {
            console.log(nft.nftMintAddress.toString())
            if (nft.nftMintAddress.toString() == nftValue) {
                setValidNft(nft)
                return
            }
        }
        setShowResult(true)
    }


    return (
        <>
            <Paper elevation={3} style={{ backgroundColor: "#fff", width: "70%" }} className={styles.center}>
                <Stack direction="column" divider={<br />}>

                    <Typography gutterBottom variant="h5" component="div" className={styles.center}>
                        Verify NFTs
                    </Typography>
                    <TextField
                        type="text"

                        placeholder="Enter NFT Address"
                        label="NFT Address"
                        variant="filled"
                        focused
                        value={nftValue}
                        onChange={handleChange}
                        className={styles.whiteText}
                        fullWidth
                        required
                        style={{ width: "300%", marginLeft: "-100%" }}
                    />
                    <Button variant="contained" component="label" onClick={validateNFT} disabled={submitDisabled} className={styles.center}>
                        Submit
                    </Button>

                </Stack >
            </Paper >
            <br />
            <br />
            {validNft.nftName ?
                <Card sx={{ maxWidth: 545 }} className={styles.center}>
                    <CardMedia
                        sx={{ height: 340, width: 340 }}
                        image={validNft.image}
                        title={validNft.nftName}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>{validNft.nftName}</Box>
                        </Typography>
                        <Typography gutterBottom variant="body2" color="text.secondary">
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}><LocationOnIcon /> {validNft.location}</Box>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>{validNft.nftDescription}</Box>
                        </Typography>
                        <Typography gutterBottom variant="body2" color="text.secondary" style={{ margin: "0 auto" }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}> Buried on : {validNft.buryTime}</Box>
                        </Typography>
                    </CardContent>
                </Card> : showResult ? <p className={styles.whiteText}>This is not a valid DeCapusle NFT.</p> : null}
        </>
    )
}
