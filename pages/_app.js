import '../styles/globals.css'
import FloatingLogo from '../components/FloatingLogo'

export default function App({ Component, pageProps }) {
  return (
    <>
      <FloatingLogo />
      <Component {...pageProps} />
    </>
  )
}
