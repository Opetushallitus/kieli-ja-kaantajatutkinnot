import { Dialog, DialogContent, DialogTitle } from '@mui/material';
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
};

export const CookieBanner: FC<PropsWithChildren<CookieBannerProps>> = ({
  title,
  buttonText,
  cookieTag,
  children,
  buttonAriaLabel,
}) => {
  const [open, setOpen] = useState(false);

  const { isDesktop } = useWindowProperties();

  useEffect(() => {
    if (!Cookies.get(`cookie-consent-${cookieTag}`)) {
      setOpen(true);
    }
  }, [setOpen, cookieTag]);

  const handleAcceptCookies = () => {
    Cookies.set(`cookie-consent-${cookieTag}`, 'true', {
      expires: 365,
      path: '/akr',
    });
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      maxWidth={false}
      fullWidth
      sx={{
        '& .MuiPaper-root': {
          position: 'absolute',
          bottom: 0,
          width: '100%',
          maxWidth: '100%',
          margin: 0,
          borderRadius: 0,
        },
      }}
    >
      <div className="cookie-banner__content">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
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
        </DialogContent>
      </div>
    </Dialog>
  );
};
