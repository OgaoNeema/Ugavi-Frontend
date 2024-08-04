import React, { useState, useEffect, useRef } from 'react';
import Section1 from './Section1';
import Footer from './Footer';
import LandingPage from './LandingPage';
import Loading from './Loading';
import './HomeFinal.css';
import { FaArrowUp } from 'react-icons/fa';

const HomeFinal = () => {
  const [loading, setLoading] = useState(true);
  const [showScroll, setShowScroll] = useState(false);
  const section1Ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection1 = () => {
    section1Ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoadingComplete = () => {
    console.log('Loading animation completed');
  };

  return (
    <>
      {loading ? (
        <Loading onLoadComplete={handleLoadingComplete} />
      ) : (
        <>
          <div ref={section1Ref} className='Home-Section1'><Section1 /></div>
          <div className='Home-Section2'><LandingPage /></div>
          <div className='Home-Section3'><Footer /></div>
          <div className={`scroll-to-top ${showScroll ? 'show' : ''}`} onClick={scrollToSection1}>
            <FaArrowUp />
          </div>
        </>
      )}
    </>
  );
};

export default HomeFinal;
// VISIBILITY OF THE ARROW