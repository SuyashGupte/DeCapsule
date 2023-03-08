
import { FC, useEffect, useState } from "react"
import { Button, Grid, Modal, Typography, Stack, TextField, LinearProgress, Card, Paper } from '@mui/material';
import styles from "../styles/Home.module.css"
import { useWorkspace } from "../context/Anchor"
import { useWallet } from "@solana/wallet-adapter-react"
import { getMetaplex } from "../utils/getMetaplex";
import Countdown from "react-countdown"
import Image from "next/image"


export const ListBuriedCapsules: FC = () => {
  const [capsuleData, setCapsuleData] = useState<any>([])
  const [unlockedNfts, setUnlockedNfts] = useState<any>([])
  const [open, setOpen] = useState(false)
  const [buttons, setButtons] = useState<any>({})
  const { program } = useWorkspace()
  const wallet = useWallet()
  const metaplex = getMetaplex(wallet, "secret")

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
            nfts: account.account.nfts,
            location: account.account.location,
            capsuleName: data.name
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
    for (let mintAddress of capsule.nfts) {
      let nft = await metaplex.nfts().findByMint({ mintAddress });
      let nftData = await fetch(nft.uri)
      let data = await nftData.json()
      nftToDisplay.push({
        image: data.image,
        name: data.name,
        description: data.description
      })

    }
    console.log(nftToDisplay)
    setUnlockedNfts([...nftToDisplay])
    setOpen(true)
    /*let tx =  await program?.methods.close().accounts({
       buriedTimeCapsule: account,
     }).rpc()*/
    //console.log(tx)
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
              <Button variant="contained" component="label" id={element.capsule} disabled={buttons[element.capsuleName]} onClick={closeAcc}>Unlocks in&nbsp;<Countdown className={styles.whiteText} key={element.capsuleName} date={new Date("2023-03-09T01:32")} onComplete={enableButtons} /></Button>
            </Paper>
            <Typography variant="h6" component="h2" className={styles.whiteText} >{element.location}</Typography>

          </Stack>
        )
      })}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Card className={styles.formModalStyle}>

          <Stack direction="column" spacing={5} className={styles.center}>
            <Typography id="modal-modal-title" variant="h6" component="h2" className={styles.center}>
              Capsule Contents
            </Typography>
          </Stack>
        </Card>
      </Modal>
    </Stack>
  )
}
