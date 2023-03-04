import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Header } from '../components/Header'
import { BuyTimeCapusles } from '../components/BuyTimeCapules'

const Home: NextPage = () => {
  return (
    <div className={styles.App}>
      <Head>
        <title>DeCapsule</title>
      </Head>
      <Header />
      <BuyTimeCapusles />
    </div>
  )
}

export default Home
