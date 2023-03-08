import { useWallet } from "@solana/wallet-adapter-react";
import { getMetaplex } from "../utils/getMetaplex";
import { FC, useState, useEffect } from "react";
import { strings } from "../constants/strings";
import * as web3 from "@solana/web3.js"
import Image from "next/image"
import Link from "next/link"
import { Button, Grid, Modal, Typography, Stack, TextField, LinearProgress, Card } from '@mui/material';
import styles from "../styles/Home.module.css"
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import * as bs58 from "bs58";
import * as token from "@solana/spl-token";
import { uploadToArweave } from "../utils/uploadToArweave";
import { uploadMetadata } from "../utils/uploadMetadata";
import { mintNFT } from "../utils/mintNFT";
import { useWorkspace } from "../context/Anchor"


export const ListTimeCapsules: FC = () => {
    const wallet = useWallet()
    const metaplex = getMetaplex(wallet, "secret")
    const [showOwnedCapsules, setSHowOwnedCapsules] = useState(false)
    const [timeCapsules, setTimeCapsules] = useState<any>([])
    const [image, setImage] = useState<FileList | null>(null)
    const [open, setOpen] = useState(false)
    const [titleValue, setTitleValue] = useState("")
    const [descriptionValue, setDescriptionValue] = useState("")
    const [locationValue, setLocationValue] = useState("")
    const [unlockTimeValue, setUnlockTimeValue] = useState(new Date().toISOString().slice(0, 16))
    const [uploadDisabled, setUploadDisabled] = useState(false)
    const [addNewDisabled, setAddNewDisabled] = useState(true)
    const [buryDisabled, setBuryDisabled] = useState(true)
    const [showDeleteButton, setShowDeleteButton] = useState(false)
    const [capsuleData, setCapsuleData] = useState<any>([])
    const [currentCapsule, setCurrentCapsule] = useState("")
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressColor, setProgressColor] = useState("primary" as any)
    const [progressText, setProgressText] = useState("Checking if wallet is connected")
    const connection = new web3.Connection(web3.clusterApiUrl(strings.NETWORK as web3.Cluster));
    const workspace = useWorkspace()
    const program = workspace.program


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
                if (element.creators[0].address.toString() === strings.TIME_CAPSULE_ACCOUNT)
                    nfts.push({ name: data.name, imageUrl: data.image.toString(), address: element.address.toString(), mint: element.mintAddress.toString() })
            }

            nfts.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            setTimeCapsules(nfts)
            if (nfts.length !== 0)
                setSHowOwnedCapsules(true)
            else
                setSHowOwnedCapsules(false)
        }
        fetchNFTs()
    }, [wallet])

    const validateForm = () => {
        if (image && titleValue && descriptionValue) {
            setAddNewDisabled(false)
        } else {
            setAddNewDisabled(true)
        }
        if (capsuleData.length >= 1 && locationValue && unlockTimeValue) {
            setBuryDisabled(false)
        } else {
            setBuryDisabled(true)
        }
    }

    const openTimeCapsuleForm = (e: any) => {
        setOpen(true)
        setCurrentCapsule(e.target.id)
    }

    const handleClose = () => {
        setOpen(false)
        setImage(null)
        setTitleValue("")
        setDescriptionValue("")
        setBuryDisabled(true)
        window.location.reload()
    }
    const fileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setImage(e.target.files)
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleValue(e.target.value)
        validateForm()
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescriptionValue(e.target.value)
        validateForm()
    }

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocationValue(e.target.value)
        console.log(capsuleData)
        validateForm()
    }

    const handleUnlockTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUnlockTimeValue(e.target.value)
        validateForm()
    }

    const addToCapsule = (e: any) => {
        setCapsuleData([...capsuleData, {
            image: image,
            title: titleValue,
            description: descriptionValue,
        }])
        setImage(null)
        setTitleValue("")
        setDescriptionValue("")
        validateForm()
    }

    const removeFromCapsule = (e: any) => {
        setImage(null)
        setTitleValue("")
        setDescriptionValue("")
        setShowDeleteButton(false)
        validateForm()
    }

    const popRequiredImage = (data: any) => {
        for (let i = 0; i < capsuleData.length; i++) {
            if (capsuleData[i].title == data.title) {
                capsuleData.splice(i, 1)
                setCapsuleData([...capsuleData])
                return
            }
        }
    }

    const findRequiredImage = (title: string) => {
        for (let i = 0; i < capsuleData.length; i++) {
            if (capsuleData[i].title == title) {
                return capsuleData[i]
            }
        }
    }

    const editCapsuleImage = (e: any) => {
        if (uploadDisabled) {
            return
        }
        let data = findRequiredImage(e.target.id)
        setImage(data.image)
        setTitleValue(data.title)
        setDescriptionValue(data.description)
        setShowDeleteButton(true)
        popRequiredImage(data)
    }
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const buryCapsule = async () => {
        setImage(null)
        setTitleValue("")
        setDescriptionValue("")
        setBuryDisabled(true)
        setAddNewDisabled(true)
        setUploadDisabled(true)
        setLoading(true)
        setProgress(10)
        setProgressText("Converting images to NFTs")
        let creators = [
            { address: wallet.publicKey, share: 60 },
            { address: new web3.PublicKey(strings.BURIED_TIME_CAPSULE), share: 40 }
        ]
        let nftList = []
        if (wallet.publicKey) {
            for (let i = 0; i < capsuleData.length; i++) {
                try {
                    let fileBuffer = await capsuleData[i].image[0].arrayBuffer()
                    let imageUri = await uploadToArweave(fileBuffer, capsuleData[i].image[0].name, metaplex)
                    let progessValue = progress + 10
                    setProgress(progessValue)
                    setProgressText(`Uploaded Image ${i + 1} to Arweave.`)
                    const metadataUri = await uploadMetadata(metaplex, capsuleData[i].title, capsuleData[i].description, imageUri as string, [])
                    progessValue = progress + 10
                    setProgress(progessValue)
                    setProgressText(`Uploaded Metadata of Image ${i + 1} to Arweave.`)
                    const nft = await mintNFT(metaplex, metadataUri, capsuleData[i].title, 500, capsuleData[i].title.toUpperCase().slice(0, 5), creators)
                    progessValue = progress + 10
                    setProgress(progessValue)
                    setProgressText(`Converted Image ${i + 1} to NFT.`)
                    console.log(nft)
                    nftList.push(nft.address)
                    console.log(nft.address.toString())
                    await delay(2000)
                    progessValue = progress + 10
                    setProgress(progessValue)
                    //setProgressText(`Transfered Image ${i + 1} to Capsule.`)

                } catch (e) {
                    console.log(e)
                    setProgressColor("error")
                    setProgressText("Failed to bury capsule!")
                    return
                }
            }
            let currentTime = (Date.now()).toString();
            console.log(currentTime, "----")
            if (program) {
                let nfts = nftList
                let capsule = new web3.PublicKey(currentCapsule)
                let owner = wallet.publicKey.toString()
                let buryTime = currentTime
                let sealDuration = unlockTimeValue
                let location = locationValue
                console.log(nfts, capsule, owner, buryTime, sealDuration, location)
                try {
                    const instruction = await program.methods
                        .buryTimeCapsule(nfts, capsule, buryTime, sealDuration, location)
                        .rpc()
                    console.log(instruction)
                } catch {
                    setProgressColor("error")
                    setProgressText("Failed to bury capsule!")
                }
                for (let nft of nfts) {
                    try {
                        let nftInstruction = await program.methods
                            .buryNft(nft, buryTime, sealDuration, location)
                            .rpc()
                        console.log(nftInstruction)
                    } catch {
                        setProgressColor("error")
                        setProgressText("Failed to bury capsule!")
                    }

                }
                console.log(web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_BURIED_SECRET as string)), wallet.publicKey)
                let tokenAccountSender = await token.getOrCreateAssociatedTokenAccount(
                    connection,
                    web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_BURIED_SECRET as string)),
                    capsule,
                    wallet.publicKey,
                )

                let tokenAccountReceiver = await token.getOrCreateAssociatedTokenAccount(
                    connection,
                    web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_TIME_CAPSULE_ACCOUNT_SECRET as string)),
                    capsule,
                    new web3.PublicKey(strings.BURIED_TIME_CAPSULE),
                )
                console.log(tokenAccountReceiver, tokenAccountSender)
                let tx = new web3.Transaction().add(
                    token.createTransferCheckedInstruction(
                        tokenAccountSender.address, // from (should be a token account)
                        capsule, // mint
                        tokenAccountReceiver.address, // to (should be a token account)
                        wallet.publicKey, // from's owner
                        1, // amount, if your deciamls is 8, send 10^8 for 1 token
                        0 // decimals
                    )
                );
                let txhash = await wallet.sendTransaction(tx, connection)
                console.log(txhash)
                setProgress(100)
                setProgressColor("success")
                setProgressText(`Buried Capsule Successfully!`)
            }
        }
    }

    return (
        <Grid className={styles.center}>
            {!showOwnedCapsules ?
                wallet.connected ?
                    <Grid>
                        <h2 className={styles.whiteText}>No Capsules Found. Buy one now!</h2>
                        <Button variant="contained" component="label" className={styles.center}>
                            <Link href="/buy">Buy</Link>
                        </Button>
                    </Grid> : <h2 className={styles.whiteText}>Wallet not connected! Please connect wallet.</h2>
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
                                <Button variant="contained" component="label" id={element.mint} onClick={openTimeCapsuleForm}>Use {element.name}</Button>
                            </Stack>
                        </Grid>
                    )
                })}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Card className={styles.formModalStyle}>
                    <form>
                        <Stack direction="row" divider={<div className={styles.verticalLine}></div>}>
                            <Stack direction="column" spacing={5} className={styles.center}>
                                {image ?
                                    <Image
                                        style={{ width: "auto", height: "auto", maxWidth: "500px", maxHeight: "500px" }}
                                        width={500}
                                        height={500}
                                        src={image ? URL.createObjectURL(image[0]) : ""}
                                        alt={image ? URL.createObjectURL(image[0]) : ""}
                                    /> : null}

                                <Button variant="outlined" component="label" disabled={uploadDisabled}>
                                    Upload image
                                    <input hidden accept="image/*" type="file" name="image-upload" onChange={fileHandler} required />
                                </Button>
                                {image ? <>
                                    <TextField
                                        type="text"
                                        placeholder="Enter title for this image"
                                        label="Title"
                                        variant="outlined"
                                        value={titleValue}
                                        onChange={handleTitleChange}
                                        required
                                    />
                                    <TextField
                                        type="txt"
                                        placeholder="Enter description for this image"
                                        label="Description"
                                        variant="outlined"
                                        value={descriptionValue}
                                        onChange={handleDescriptionChange}
                                        multiline={true}
                                        required
                                    />
                                    <Stack direction="row" spacing={5}>
                                        <Button variant="outlined" component="label" endIcon={<AddIcon />} disabled={addNewDisabled} onClick={addToCapsule}>
                                            Add To Capsule
                                        </Button>
                                        {showDeleteButton ? <Button variant="outlined" component="label" endIcon={<DeleteIcon />} color="error" onClick={removeFromCapsule}>
                                            Delete From Caspule
                                        </Button> : null}
                                    </Stack></> : null}
                            </Stack>
                            <Stack direction="column" spacing={5} className={styles.center}>
                                <Typography id="modal-modal-title" variant="h6" component="h2" className={styles.center}>
                                    Capsule Contents
                                </Typography>
                                <Grid container spacing={4} className={styles.center}>
                                    {capsuleData.map((item: any) => {
                                        return (<Grid item key={item.title}>
                                            <Image
                                                id={item.title}
                                                width={50}
                                                height={50}
                                                src={item.image ? URL.createObjectURL(item.image[0]) : ""}
                                                onClick={editCapsuleImage}
                                                alt="null"
                                            />
                                        </Grid>)
                                    })}
                                </Grid>
                                <hr />
                                <TextField
                                    type="text"
                                    placeholder="Enter location"
                                    label="Location"
                                    variant="outlined"
                                    value={locationValue}
                                    onChange={handleLocationChange}
                                    disabled={uploadDisabled}
                                    required
                                />
                                <TextField
                                    type="datetime-local"
                                    label="Unlock Time"
                                    variant="outlined"
                                    disabled={uploadDisabled}
                                    inputProps={{
                                        // only needs the first 16 characters in the date string
                                        min: new Date().toISOString().slice(0, 16),
                                    }}
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                    value={unlockTimeValue}
                                    onChange={handleUnlockTimeChange}
                                    required
                                />
                                <Button variant="contained" component="label" disabled={buryDisabled} onClick={buryCapsule}>
                                    Bury Capsule
                                </Button>
                                <br />
                                {loading ?
                                    <>
                                        <LinearProgress variant="determinate" value={progress} color={progressColor} />
                                        <p>{progressText}</p>
                                    </> : null}
                            </Stack>
                        </Stack>
                    </form>
                </Card>
            </Modal>
        </Grid>
    )
}