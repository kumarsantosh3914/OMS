function Navbar({ onMenuClick }) {
  return (
    <header className="topbar">
      <button type="button" className="menu-button" onClick={onMenuClick} aria-label="Open navigation">
        =
      </button>
      <div>
        <span>Operations</span>
        <strong>Inventory & Order Management</strong>
      </div>
    </header>
  );
}

export default Navbar;
