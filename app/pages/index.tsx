import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Header } from '../components/Header'
import { ListTimeCapsules } from '../components/ListTimeCapsules'
import { ListBuriedCapsules } from '../components/ListBuriedCapsules'

const Home: NextPage = () => {
  return (
    <div className={styles.App}>
      <Head>
        <title>DeCapsule</title>
      </Head>
      <Header />
      <ListTimeCapsules />
      <ListBuriedCapsules />
    </div>
  )
}

export default Home
