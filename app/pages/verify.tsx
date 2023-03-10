import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Header } from '../components/Header'
import { VerifyNFT } from '../components/VerifyNFT'


const Home: NextPage = () => {
  return (
    <div className={styles.App}>
      <Head>
        <title>DeCapsule</title>
      </Head>
      <Header /> 
      <VerifyNFT />
      
    </div>
  )
}

export default Home