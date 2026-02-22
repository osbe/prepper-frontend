import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-green-700 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-2 h-14">
        <span className="text-white font-bold text-lg mr-4">Prepper</span>
        <NavLink to="/" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/products" className={linkClass}>
          Products
        </NavLink>
      </div>
    </nav>
  )
}
