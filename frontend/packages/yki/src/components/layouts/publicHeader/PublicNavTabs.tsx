import { Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Color } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes, HeaderTabNav } from 'enums/app';

export const PublicNavTabs = (): JSX.Element => {
  const translateCommon = useCommonTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [value, setValue] = useState<HeaderTabNav | boolean>(false);

  const handleChange = ({}, newValue: HeaderTabNav) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (pathname === AppRoutes.Registration) {
      setValue(HeaderTabNav.Registration);
    } else if (pathname === AppRoutes.Reassessment) {
      setValue(HeaderTabNav.Reassessment);
    }
  }, [pathname]);

  return (
    <Tabs
      value={value}
      onChange={handleChange}
      textColor={Color.Secondary}
      indicatorColor={Color.Secondary}
    >
      <Tab
        data-testid={'public-nav-tab__registration'}
        value={HeaderTabNav.Registration}
        label={translateCommon(HeaderTabNav.Registration)}
        onClick={() => navigate(AppRoutes.Registration)}
      />
      <Tab
        data-testid={'public-nav-tab__reassessment'}
        value={HeaderTabNav.Reassessment}
        label={translateCommon(HeaderTabNav.Reassessment)}
        onClick={() => navigate(AppRoutes.Reassessment)}
      />
    </Tabs>
  );
};
