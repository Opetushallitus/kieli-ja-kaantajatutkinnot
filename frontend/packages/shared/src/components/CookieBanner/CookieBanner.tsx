import { Paper } from '@mui/material';
import Cookies from 'js-cookie';
import { FC, PropsWithChildren, useEffect, useState } from 'react';

import { Color, Variant } from '../../enums/common';
import { useWindowProperties } from '../../hooks';
import { CustomButton } from '../CustomButton/CustomButton';

import './CookieBanner.scss';

type CookieBannerProps = {
  title: string;
  buttonText: string;
  cookieTag: string;
  buttonAriaLabel: string;
  path: string;
};

export const CookieBanner: FC<PropsWithChildren<CookieBannerProps>> = ({
  title,
  buttonText,
  cookieTag,
  children,
  buttonAriaLabel,
  path,
}) => {
  const [open, setOpen] = useState(false);

  const { isDesktop } = useWindowProperties();

  useEffect(() => {
    if (!Cookies.get(cookieTag)) {
      setOpen(true);
    }
  }, [setOpen, cookieTag]);

  const handleAcceptCookies = () => {
    Cookies.set(cookieTag, 'true', {
      expires: 365,
      path,
    });
    setOpen(false);
  };

  if (!open) return null;

  return (
    <Paper
      square
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        borderRadius: 0,
        zIndex: 3,
      }}
    >
      <section
        className="cookie-banner__content"
        aria-labelledby="cookie-banner__title"
      >
        <h2 id="cookie-banner__title">{title}</h2>
        <div className="cookie-banner__content__dialog-container">
          <div
            className={`cookie-banner__content__dialog-content gapped space-between ${
              isDesktop ? 'columns' : 'rows'
            }`}
          >
            {children}
            <CustomButton
              aria-label={buttonAriaLabel}
              className="cookie-banner__content__accept-button"
              data-testid="cookie-banner-accept-button"
              color={Color.Secondary}
              variant={Variant.Contained}
              onClick={handleAcceptCookies}
            >
              {buttonText}
            </CustomButton>
          </div>
        </div>
      </section>
    </Paper>
  );
};
