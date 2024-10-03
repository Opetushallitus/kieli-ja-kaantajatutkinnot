import { Box, Grid } from '@mui/material';
import { FC, useEffect } from 'react';
import { H1, HeaderSeparator, Text } from 'shared/components';

import { PublicExaminerListing } from 'components/publicExaminerListing/PublicExaminerListing';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { loadPublicExaminers } from 'redux/reducers/publicExaminer';

export const PublicGoodAndSatisfactoryLevelLandingPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.goodAndSatisfactoryLevel',
  });
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(loadPublicExaminers());
  }, [dispatch]);

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <Grid item className="public-homepage__grid-container__item-header">
          <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
          <HeaderSeparator />
          <Text>
            Jotain infotekstiä hyvän ja tyydyttävän taidon tutkinnoista. <br />
            Mahdollisesti lyhyet ohjeet yhteydenottoon liittyen. <br />
            Kenties linkki OPH:n sivuille.
          </Text>
        </Grid>
        <Grid item className="public-homepage__grid-container__result-box">
          <PublicExaminerListing />
        </Grid>
      </Grid>
    </Box>
  );
};
