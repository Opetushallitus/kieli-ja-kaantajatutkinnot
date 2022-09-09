import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { FC, PropsWithChildren, useEffect, useState } from 'react';

import { Color, Variant } from '../../enums/common';
import { CustomButton } from '../CustomButton/CustomButton';

type CookieBannerProps = {
  title: string;
  buttonText: string;
  cookieTag: string;
};

export const CookieBanner: FC<PropsWithChildren<CookieBannerProps>> = ({
  title,
  buttonText,
  cookieTag,
  children,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(`cookie-consent-${cookieTag}`)) {
      setOpen(true);
    }
  }, [setOpen, cookieTag]);

  const handleClose = ({}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (['backdropClick', 'escapeKeyDown'].includes(reason)) {
      return false;
    }
  };

  const handleAcceptCookies = () => {
    sessionStorage.setItem(`cookie-consent-${cookieTag}`, JSON.stringify(true));
    setOpen(false);
  };

  return (
    <Dialog
      onClose={handleClose}
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
      <DialogTitle align="center">{title}</DialogTitle>
      <DialogContent>
        <div className="rows gapped space-around">
          <div className="cookie-banner__content columns gapped">
            {children}
            <CustomButton
              data-testid="cookie-banner-accept-button"
              color={Color.Secondary}
              variant={Variant.Contained}
              onClick={handleAcceptCookies}
            >
              {buttonText}
            </CustomButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
