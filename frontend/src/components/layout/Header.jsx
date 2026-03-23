import { Link, NavLink } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          Ecommerce
        </Link>
        <nav className="header__nav">
          <NavLink to="/" end className="header__link">
            Home
          </NavLink>
          <NavLink to="/products" className="header__link">
            Products
          </NavLink>
          <NavLink to="/cart" className="header__link">
            Cart
          </NavLink>
        </nav>
        <div className="header__auth">
          <NavLink to="/login" className="header__link">
            Login
          </NavLink>
          <NavLink to="/register" className="header__button">
            Sign up
          </NavLink>
        </div>
      </div>
    </header>
  )
}

export default Header
