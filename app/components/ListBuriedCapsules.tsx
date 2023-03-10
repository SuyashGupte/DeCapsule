
import { FC, useEffect, useState } from "react"
import { Button, Grid, Modal, Typography, Stack, TextField, LinearProgress, Card, Paper, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, CardContent, CardMedia, Box } from '@mui/material';
import styles from "../styles/Home.module.css"
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useWorkspace } from "../context/Anchor"
import { useWallet } from "@solana/wallet-adapter-react"
import { getMetaplex } from "../utils/getMetaplex";
import Countdown from "react-countdown"
import Image from "next/image"
import Link from "next/link"
import * as bs58 from "bs58";
import * as token from "@solana/spl-token";
import { strings } from "../constants/strings";
import * as web3 from "@solana/web3.js"
import { transferNFT } from "../utils/transferNFT";


export const ListBuriedCapsules: FC = () => {
  const [capsuleData, setCapsuleData] = useState<any>([])
  const [unlockedNfts, setUnlockedNfts] = useState<any>([])
  const [open, setOpen] = useState(false)
  const [buttons, setButtons] = useState<any>({})
  const { program } = useWorkspace()
  const wallet = useWallet()
  const metaplex = getMetaplex(wallet, "secret")
  const connection = new web3.Connection(web3.clusterApiUrl(strings.NETWORK as web3.Cluster));

  useEffect(() => {
    const fetchAccounts = async () => {
      if (program) {
        const accounts = (await program.account.timeCapsule.all()) ?? []
        console.log(accounts)
        let capsules: any = []
        for (let account of accounts) {
          console.log(account.account)
          let mintAddress = account.account.capsule
          let nft = await metaplex.nfts().findByMint({ mintAddress });
          let nftData = await fetch(nft.uri)
          let data = await nftData.json()
          console.log("capsule", nft)
          console.log(data)
          capsules.push({
            image: data.image,
            capsule: account.publicKey.toString(),
            sealDuration: account.account.sealDuration,
            buryTime: account.account.buryTime,
            nfts: account.account.nfts,
            location: account.account.location,
            capsuleName: data.name,
            capsuleMintAddress: mintAddress
          })
          console.log(new Date())
          let buttonsCopy = { ...buttons }
          buttonsCopy[data.name] = new Date(account.account.sealDuration) >= new Date()
          setButtons({ ...buttonsCopy })
        }
        setCapsuleData([...capsules])
        console.log(capsules)
      }
    }
    fetchAccounts()
  }, [])

  const enableButtons = (e: any) => {
    let buttonsCopy = { ...buttons }
    capsuleData.forEach((capsule: any) => {
      if (new Date(capsule.sealDuration) <= new Date()) {
        buttonsCopy[capsule.capsuleName] = false
      }
    })
    setButtons({ ...buttonsCopy })
  }
  const closeAcc = async (e: any) => {
    console.log(e.target.id || e.target.parentElement.id)
    let capsuleKey = e.target.id || e.target.parentElement.id
    let capsule = findCapsule(capsuleKey)
    let nftToDisplay = []
    console.log(web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_BURIED_SECRET as string)), wallet.publicKey)
    let payer = web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_BURIED_SECRET as string))
    let mint = capsule.capsuleMintAddress
    let sender = new web3.PublicKey(strings.BURIED_TIME_CAPSULE)
    let receiver = new web3.PublicKey(strings.TIME_CAPSULE_ACCOUNT)
    let tokenAccountSender = await connection.getTokenAccountsByOwner(sender, {
      mint: mint
    });


    let tokenAccountReceiver = await connection.getTokenAccountsByOwner(receiver, {
      mint: mint
    });
    setOpen(true)
    console.log(tokenAccountSender, tokenAccountReceiver)
    for (let mintAddress of capsule.nfts) {
      let nft = await metaplex.nfts().findByMint({ mintAddress });
      let nftData = await fetch(nft.uri)
      let data = await nftData.json()
      nftToDisplay.push({
        image: data.image,
        nftName: data.name,
        nftDescription: data.description,
        buryTime: timeConverter(parseInt(capsule.buryTime)),
        location: capsule.location,
        nftMintAddress: mintAddress
      })

    }
    console.log(nftToDisplay)
    setUnlockedNfts([...nftToDisplay])
    let tx = await program?.methods.close().accounts({
      buriedTimeCapsule: new web3.PublicKey(capsule.capsule),
    }).rpc()
    console.log(tx)
    let transferTx = await transferNFT(tokenAccountSender.value[0].pubkey, tokenAccountReceiver.value[0].pubkey, new web3.PublicKey(capsule.capsule), payer, payer)
    console.log(transferTx)
  }

  const findCapsule = (capsuleKey: string) => {
    for (let capsule of capsuleData) {
      if (capsuleKey === capsule.capsule) {
        return capsule
      }
    }
  }

  const handleClose = () => {
    setOpen(false)
    window.location.reload()
  }
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

    <Stack direction="column" divider={<br />} className={styles.center}>

      <h2 className={styles.whiteText}> Capsules Around the World </h2>

      {capsuleData.map((element: any) => {
        return (
          <Stack direction="column" key={element.capsule} spacing={2} className={styles.center}>
            <Image
              width={370}
              height={525}
              src={element.image}
              alt="null"
            />
            <Paper elevation={3} style={{ backgroundColor: "#C99AF7" }} className={styles.center}>
              <Button variant="contained" component="label" id={element.capsule} disabled={buttons[element.capsuleName]} onClick={closeAcc}>Unlocks in&nbsp;<Countdown className={styles.whiteText} key={element.capsuleName} date={new Date(element.sealDuration)} onComplete={enableButtons} /></Button>
            </Paper>
            <Typography variant="h6" component="h2" className={styles.whiteText} >{element.location}</Typography>

          </Stack>
        )
      })}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Capsule Contents</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="scroll-dialog-description"
            tabIndex={-1}
          >
            <Grid container spacing={4} className={styles.center}>
              {unlockedNfts.map((element: any) => {
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
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions className={styles.center}>
          <Link href="/market">
            <Button variant="contained" component="label">
              Visit Marketplace
            </Button>
          </Link>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
