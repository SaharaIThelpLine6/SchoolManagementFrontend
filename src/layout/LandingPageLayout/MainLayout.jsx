import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/LandingPageComponent/Header';
import Footer from '../../components/LandingPageComponent/Footer';

const MainLayout = () => {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default MainLayout;
