import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import { Grid, Paper } from '@mui/material';
import { CustomButtonLink, H1, HeaderSeparator, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const LogoutSuccess: React.FC = () => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.logoutSuccessPage',
  });

  return (
    <Grid
      container
      className="logout-success-page"
      rowSpacing={4}
      direction="column"
    >
      <Grid item className="logout-success-page__back-button">
        <CustomButtonLink
          to={AppRoutes.PublicHomePage}
          variant={Variant.Text}
          startIcon={<ArrowBackIosOutlinedIcon />}
          className="color-secondary-dark"
        >
          {translateCommon('backToHomePage')}
        </CustomButtonLink>
      </Grid>
      <Grid item className="logout-success-page__heading">
        <H1>{t('heading')}</H1>
        <HeaderSeparator />
      </Grid>
      <Grid item>
        <Paper
          elevation={3}
          className="logout-success-page__content rows gapped-xl"
        >
          <Text>{t('info')}</Text>
          <CustomButtonLink
            to={AppRoutes.PublicHomePage}
            variant={Variant.Contained}
            color={Color.Secondary}
          >
            {translateCommon('backToHomePage')}
          </CustomButtonLink>
        </Paper>
      </Grid>
    </Grid>
  );
};
