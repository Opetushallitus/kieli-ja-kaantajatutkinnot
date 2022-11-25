import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import { Box, Grid, Paper } from '@mui/material';
import { FC } from 'react';
import {
  ComboBox,
  CustomButton,
  CustomButtonLink,
  CustomDatePicker,
  CustomSwitch,
  H1,
  H3,
  LoadingProgressIndicator,
} from 'shared/components';
import { Color, TextFieldVariant, Variant } from 'shared/enums';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

const BackButton = () => {
  const translateCommon = useCommonTranslation();

  return (
    <CustomButtonLink
      to={AppRoutes.ClerkHomePage}
      variant={Variant.Text}
      startIcon={<ArrowBackIosOutlinedIcon />}
      className="color-secondary-dark"
    >
      {translateCommon('back')}
    </CustomButtonLink>
  );
};

export const ClerkExamCreateEventPage: FC = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const translateCommon = useCommonTranslation();

  const onComboBoxChange = () => {
    return '';
  };

  const onDatePickerChange = () => {
    return '';
  };

  const onPublicDateChange = () => {
    return '';
  };

  const isLoading = false;

  return (
    <Box className="clerk-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-homepage__grid-container"
      >
        <Grid item>
          <H1>{t('addExamDate')}</H1>
        </Grid>
        <Grid item>
          <Paper elevation={3} className="clerk-homepage__exam-events">
            <div>
              <BackButton />
            </div>
            <div className="grid-columns gapped">
              <div className="rows gapped">
                <H3>{t('header.language')}</H3>
                <ComboBox
                  data-testid="clerk-exam__event-information__lang-and-level"
                  autoHighlight
                  label={translateCommon('choose')}
                  variant={TextFieldVariant.Outlined}
                  values={[{ label: 'foo', value: '' }]}
                  onChange={onComboBoxChange}
                  value={null}
                />
              </div>
              <div className="rows gapped">
                <H3>{t('header.date')}</H3>
                <CustomDatePicker
                  setValue={onDatePickerChange}
                  label={translateCommon('choose')}
                  value={null}
                />
              </div>
              <div className="rows gapped">
                <H3>{t('header.registrationCloses')}</H3>
                <CustomDatePicker
                  setValue={onDatePickerChange}
                  label={translateCommon('choose')}
                  value={null}
                />
              </div>
            </div>
            <div className="columns gapped">
              <div className="rows gapped">
                <H3>{t('header.fillingsTotal')}</H3>
                <ComboBox
                  data-testid="clerk-exam__event-information__lang-and-level"
                  autoHighlight
                  label={translateCommon('choose')}
                  variant={TextFieldVariant.Outlined}
                  values={[{ label: 'foo', value: '' }]}
                  onChange={onComboBoxChange}
                  value={null}
                />
              </div>
              <div className="rows gapped">
                <H3>{t('header.showExamDatePublic')}</H3>
                <CustomSwitch
                  dataTestId="clerk-exam__event-information__show-public-dates"
                  onChange={onPublicDateChange}
                  leftLabel={translateCommon('no')}
                  rightLabel={translateCommon('yes')}
                />
              </div>
            </div>
            <div className="columns flex-end">
              <LoadingProgressIndicator isLoading={isLoading}>
                <CustomButton
                  data-testid="clerk-translator-overview__translator-details__save-btn"
                  variant={Variant.Contained}
                  color={Color.Secondary}
                  disabled={isLoading}
                >
                  {translateCommon('save')}
                </CustomButton>
              </LoadingProgressIndicator>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
