import { LockOutlined } from '@mui/icons-material';
import { Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { FC } from 'react';
import { CustomButton, H1, HeaderSeparator, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';

const _ExpiredLoginLinkPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.expiredLoginLink',
  });

  return (
    <Box className="user-details-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="user-details-page__grid-container"
      >
        <Grid className="user-details-page__grid-container__expired-login-link">
          <H1>
            <div className="columns gapped-xs">
              <LockOutlined fontSize="large" />
              {t('title')}
            </div>
          </H1>
          <HeaderSeparator />
          <Paper elevation={3}>
            <Box padding={3} gap={2} display={'flex'} flexDirection="column">
              <Text>{t('part1')}</Text>
              <CustomButton
                className="user-details-page__expired-link-btn"
                variant={Variant.Contained}
                color={Color.Secondary}
                href={`${APIEndpoints.Authenticate}?toUserPortal=true`}
              >
                {t('buttonText')}
              </CustomButton>
              <Text>{t('part2')}</Text>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
