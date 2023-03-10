import { useWallet } from "@solana/wallet-adapter-react";
import { getMetaplex } from "../utils/getMetaplex";
import { FC, useState, useEffect } from "react";
import Image from "next/image"
import { Button, Grid, Typography, Stack, Card, CardContent, CardActions, CardMedia, Box } from '@mui/material';
import styles from "../styles/Home.module.css"
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useWorkspace } from "../context/Anchor"




export const Marketplace: FC = () => {
    const wallet = useWallet()
    const metaplex = getMetaplex(wallet, "secret")
    const [nfts, setNfts] = useState<any>([])
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


    return (
        <Grid container spacing={8} className={styles.center}>
            {nfts ?
                nfts.map((element: any) => {
                    return (
                        <Grid item key={element.nftMintAddress.toString()}>
                            <Card sx={{ maxWidth: 545 }} >
                                <CardMedia
                                    sx={{ height: 340, width: 340 }}
                                    image={element.image}
                                    title={element.nftName}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>{element.nftName}</Box>
                                    </Typography>
                                    <Typography gutterBottom variant="body2" color="text.secondary">
                                        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}><LocationOnIcon /> {element.location}</Box>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>{element.nftDescription}</Box>
                                    </Typography>
                                    <Typography gutterBottom variant="body2" color="text.secondary" style={{ margin: "0 auto" }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}> Buried on : {element.buryTime}</Box>
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small">Buy</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    )
                })

                : <p>Nothing available now.</p>}
        </Grid>
    )
}