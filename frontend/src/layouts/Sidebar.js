import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span>OMS</span>
          <strong>Inventory Control</strong>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={onClose} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {open && <button type="button" className="mobile-scrim" onClick={onClose} aria-label="Close navigation" />}
    </>
  );
}

export default Sidebar;
