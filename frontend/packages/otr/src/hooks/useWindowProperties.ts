import { useEffect, useState } from 'react';

import { Screenwidth } from 'enums/app';

const getProperties = () => {
  const { innerWidth: width, innerHeight: height } = window;
  const isPhone = width <= Screenwidth.Phone;
  const isTablet = width >= Screenwidth.Tablet && width < Screenwidth.Desktop;
  const isDesktop = width >= Screenwidth.Desktop;

  return {
    isPhone,
    isTablet,
    isDesktop,
    width,
    height,
  };
};

export const useWindowProperties = () => {
  const [windowDimensions, setWindowDimensions] = useState(getProperties());

  useEffect(() => {
    const resizeEvent = 'resize';
    const handleResize = () => {
      setWindowDimensions(getProperties());
    };
    addEventListener(resizeEvent, handleResize);

    return () => removeEventListener(resizeEvent, handleResize);
  }, []);

  return windowDimensions;
};
