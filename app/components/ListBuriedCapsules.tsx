
import { FC, useEffect, useState } from "react"

import { useWorkspace } from "../context/Anchor"
import { useWallet } from "@solana/wallet-adapter-react"

export const ListBuriedCapsules: FC = () => {
  const [account, setAccount] = useState<any>(null)
  const { program } = useWorkspace()
  const wallet = useWallet()

  useEffect(() => {
    const fetchAccounts = async () => {
      if (program) {
        const accounts = (await program.account.timeCapsule.all())?? []

       console.log(accounts.length, accounts)
       setAccount(accounts[0].publicKey)
      }
    }
    fetchAccounts()
  }, [])
  
  const closeAcc = async () => {
   let tx =  await program?.methods.close().accounts({
      buriedTimeCapsule: account,
    }).rpc()
  console.log(tx)
  }
  

  return (
   <div onClick = {closeAcc}>Buried</div>
  )
}
