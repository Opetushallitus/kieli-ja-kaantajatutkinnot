import { LockOutlined } from '@mui/icons-material';
import { Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { ophColors } from '@opetushallitus/oph-design-system';
import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  CustomButton,
  H1,
  HeaderSeparator,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { getCurrentLang, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { clerkEnabled } from 'featureFlags';
import {
  loadLoginLinkRenew,
  resetLoginLinkRenew,
} from 'redux/reducers/loginLinkRenew';
import { loginLinkRenewSelector } from 'redux/selectors/loginLink';

export const ExpiredLoginLinkPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.expiredLoginLink',
  });

  const dispatch = useAppDispatch();
  const params = useParams();
  const lang = getCurrentLang();
  const loginLinkRenew = useAppSelector(loginLinkRenewSelector);
  const status = loginLinkRenew.status;
  const isLoading = status === APIResponseStatus.InProgress;

  useEffect(() => {
    return () => {
      dispatch(resetLoginLinkRenew());
    };
  }, [dispatch]);

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
          <Paper
            elevation={3}
            style={
              clerkEnabled
                ? { borderTop: '5px solid ' + ophColors.green2 }
                : undefined
            }
          >
            <Box padding={3} gap={2} display={'flex'} flexDirection="column">
              <Text>{t('part1')}</Text>
              {status !== APIResponseStatus.Success && (
                <LoadingProgressIndicator isLoading={isLoading}>
                  <CustomButton
                    className="user-details-page__expired-link-btn"
                    disabled={isLoading}
                    variant={Variant.Contained}
                    color={Color.Secondary}
                    onClick={() => {
                      dispatch(
                        loadLoginLinkRenew({
                          code: params.code || '',
                          lang: lang,
                        }),
                      );
                    }}
                  >
                    {t('buttonText')}
                  </CustomButton>
                </LoadingProgressIndicator>
              )}
              {status == APIResponseStatus.Success && (
                <Text className="bold">{t('reply')}</Text>
              )}
              <Text>{t('part2')}</Text>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
