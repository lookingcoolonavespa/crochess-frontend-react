import NavBar from './NavBar';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className: string;
}

const Layout = ({ className, children }: LayoutProps) => {
  return (
    <>
      <NavBar />
      <main className={className}>{children}</main>
    </>
  );
};

export default Layout;
