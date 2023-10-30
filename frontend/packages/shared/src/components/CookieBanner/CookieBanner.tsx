import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import Cookies from 'js-cookie';
import { FC, PropsWithChildren, ReactNode, useEffect, useState } from 'react';

import { Color, Variant } from '../../enums/common';
import { CustomButton } from '../CustomButton/CustomButton';

import './CookieBanner.scss';

type CookieBannerProps = {
  languageSelector: ReactNode;
  title: string;
  buttonText: string;
  cookieTag: string;
  buttonAriaLabel: string;
  path: string;
};

export const CookieBanner: FC<PropsWithChildren<CookieBannerProps>> = ({
  languageSelector,
  title,
  buttonText,
  cookieTag,
  children,
  buttonAriaLabel,
  path,
}) => {
  const [open, setOpen] = useState(false);

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

  return (
    <Dialog open={open}>
      <div className="cookie-banner__content">
        {languageSelector}
        <DialogTitle className="cookie-banner__content__dialog-title">
          {title}
        </DialogTitle>
        <DialogContent sx={{ padding: 0 }}>
          <div className="cookie-banner__content__dialog-content gapped space-between rows">
            {children}
          </div>
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
        </DialogContent>
      </div>
    </Dialog>
  );
};
