import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }){
  return (
    <div>
      <header>
        <div className="container">
          <Navbar />
        </div>
      </header>
      <main className="container" style={{paddingTop: '1rem'}}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
