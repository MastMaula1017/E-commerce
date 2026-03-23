import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <p className="footer__text">&copy; {new Date().getFullYear()} Ecommerce. All rights reserved.</p>
    </footer>
  )
}

export default Footer
