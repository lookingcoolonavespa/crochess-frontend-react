import styles from '../styles/Navbar.module.scss';

const NavBar = () => {
  // left hand side will have logo that leads back to home page
  // right hand side will have settings button
  //

  return (
    <nav className={`${styles.main} two-column-view`}>
      <div>croChess</div>
    </nav>
  );
};

export default NavBar;
