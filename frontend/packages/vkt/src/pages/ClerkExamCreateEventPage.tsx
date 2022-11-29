import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import { Box, Grid, Paper } from '@mui/material';
import dayjs from 'dayjs';
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
import {
  APIResponseStatus,
  Color,
  TextFieldVariant,
  Variant,
} from 'shared/enums';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, ExamLanguage, ExamLevel } from 'enums/app';
import {
  saveClerkNewExamDate,
  updateClerkNewExamDate,
} from 'redux/reducers/clerkNewExamDate';
import { clerkNewExamDateSelector } from 'redux/selectors/clerkNewExamDate';

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

const isValidForm = (examDate) => {
  if (!examDate) {
    return false;
  }

  if (!examDate.date || !examDate.registrationCloses) {
    return false;
  }

  if (
    examDate.date.isBefore(dayjs()) ||
    examDate.registrationCloses.isBefore(dayjs())
  ) {
    return false;
  }

  if (examDate.date.isBefore(examDate.registrationCloses)) {
    return false;
  }

  if (!examDate.maxParticipants) {
    return false;
  }

  if (!examDate.language || !examDate.level) {
    return false;
  }

  return true;
};

const getValueAsText = (examDate): string | null => {
  if (!examDate || !examDate.language || !examDate.level) {
    return null;
  }

  return examDate.language + '-' + examDate.level;
};

const maxParticipantsOpts = (() => {
  return ['10', '20', '30', '40', '50'].map((opt) => ({
    label: opt,
    value: opt,
  }));
})();

export const ClerkExamCreateEventPage: FC = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const translateCommon = useCommonTranslation();
  const { status, examDate } = useAppSelector(clerkNewExamDateSelector);
  const dispatch = useAppDispatch();

  const langLevelOpts = () => {
    const langs = Object.keys(ExamLanguage)
      .splice(1)
      .map((lang) => {
        return Object.keys(ExamLevel).map((level) => {
          return {
            label:
              translateCommon('examLanguage.' + ExamLanguage[lang]) +
              ', ' +
              translateCommon('examLevel.' + level),
            value: lang + '-' + level,
            data: {
              lang: lang,
              level: level,
            },
          };
        });
      });

    return langs?.flat() ?? [];
  };

  const onIsHiddenChange = (_, value) => {
    const examDateDetails = {
      ...examDate,
      isHidden: value,
    };
    dispatch(updateClerkNewExamDate(examDateDetails));
  };

  const onParticipantsChange = (_, num) => {
    const examDateDetails = {
      ...examDate,
      maxParticipants: num.value,
    };
    dispatch(updateClerkNewExamDate(examDateDetails));
  };

  const onComboBoxChange = (_, lang) => {
    const examDateDetails = {
      ...examDate,
      language: lang.data.lang,
      level: lang.data.level,
    };
    dispatch(updateClerkNewExamDate(examDateDetails));
  };

  const onRegistrationClosesChange = (value) => {
    const examDateDetails = {
      ...examDate,
      registrationCloses: value,
    };
    dispatch(updateClerkNewExamDate(examDateDetails));
  };
  const onDateChange = (value) => {
    const examDateDetails = {
      ...examDate,
      date: value,
    };
    dispatch(updateClerkNewExamDate(examDateDetails));
  };

  const isLoading = status === APIResponseStatus.InProgress;

  const onSave = () => examDate && dispatch(saveClerkNewExamDate(examDate));

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
                  values={langLevelOpts()}
                  onChange={onComboBoxChange}
                  value={{ value: getValueAsText(examDate) }}
                />
              </div>
              <div className="rows gapped">
                <H3>{t('header.date')}</H3>
                <CustomDatePicker
                  setValue={onDateChange}
                  label={translateCommon('choose')}
                  value={examDate?.date ?? null}
                />
              </div>
              <div className="rows gapped">
                <H3>{t('header.registrationCloses')}</H3>
                <CustomDatePicker
                  setValue={onRegistrationClosesChange}
                  label={translateCommon('choose')}
                  value={examDate?.registrationCloses ?? null}
                />
              </div>
            </div>
            <div className="columns gapped">
              <div className="rows gapped">
                <H3>{t('header.fillingsTotal')}</H3>
                <ComboBox
                  data-testid="clerk-exam__event-information__max-participants"
                  autoHighlight
                  label={translateCommon('choose')}
                  onChange={onParticipantsChange}
                  variant={TextFieldVariant.Outlined}
                  values={maxParticipantsOpts}
                  value={{ value: examDate?.maxParticipants ?? null }}
                />
              </div>
              <div className="rows gapped">
                <H3>{t('header.showExamDatePublic')}</H3>
                <CustomSwitch
                  dataTestId="clerk-exam__event-information__show-public-dates"
                  leftLabel={translateCommon('no')}
                  rightLabel={translateCommon('yes')}
                  onChange={onIsHiddenChange}
                  value={examDate?.isHidden ?? false}
                />
              </div>
            </div>
            <div className="columns flex-end">
              <LoadingProgressIndicator isLoading={isLoading}>
                <CustomButton
                  data-testid="clerk-translator-overview__translator-details__save-btn"
                  variant={Variant.Contained}
                  color={Color.Secondary}
                  disabled={isLoading || !isValidForm(examDate)}
                  onClick={onSave}
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
