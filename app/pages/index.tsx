import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Header } from '../components/Header'
import { Upload } from '../components/MintTimeCapsules'

const Home: NextPage = () => {
  return (
    <div className={styles.App}>
      <Head>
        <title>DeCapsule</title>
      </Head>
      <Header />
      
    </div>
  )
}

export default Home
