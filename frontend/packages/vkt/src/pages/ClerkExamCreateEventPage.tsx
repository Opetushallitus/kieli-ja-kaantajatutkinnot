import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import { Box, Grid, Paper } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
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
import { AutocompleteValue, ComboBoxOption } from 'shared/interfaces';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, ExamLanguage, ExamLevel } from 'enums/app';
import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
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
      data-testid="clerk-create-exam__back-btn"
    >
      {translateCommon('back')}
    </CustomButtonLink>
  );
};

const isValidForm = (examDate: DraftClerkExamEvent | undefined) => {
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

const maxParticipantsOpts = ((): ComboBoxOption[] => {
  return ['10', '20', '30', '40', '50'].map(
    (opt): ComboBoxOption => ({
      label: opt,
      value: opt,
    })
  );
})();

export const ClerkExamCreateEventPage: FC = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const translateCommon = useCommonTranslation();
  const {
    status,
    examDate,
  }: { status: APIResponseStatus; examDate: DraftClerkExamEvent } =
    useAppSelector(clerkNewExamDateSelector);
  const dispatch = useAppDispatch();

  const translateExamLang = (lang: string, level: string) =>
    translateCommon('examLanguage.' + lang) +
    ', ' +
    translateCommon('examLevel.' + level);

  const getDateComboOpt = (
    examDate: DraftClerkExamEvent
  ): ComboBoxOption | null => {
    if (!examDate || !examDate.language || !examDate.level) {
      return null;
    }

    return {
      label: translateExamLang(examDate.language, examDate.level),
      value: examDate.language + '-' + examDate.level,
    };
  };

  const getParticipantsComboOpt = (
    examDate: DraftClerkExamEvent
  ): ComboBoxOption | null => {
    if (!examDate || !examDate.maxParticipants) {
      return null;
    }

    return {
      label: String(examDate.maxParticipants),
      value: String(examDate.maxParticipants),
    };
  };

  const langLevelOpts = (): ComboBoxOption[] => {
    const langs = Object.keys(ExamLanguage)
      .splice(1)
      .map((lang) => {
        return Object.keys(ExamLevel).map((level) => {
          return {
            label: translateExamLang(lang, level),
            value: lang + '-' + level,
          };
        });
      });

    return langs?.flat() ?? [];
  };

  const onIsHiddenChange = ({}, checked: boolean) => {
    const examDateDetails: DraftClerkExamEvent = {
      ...examDate,
      isHidden: checked,
    };
    dispatch(updateClerkNewExamDate(examDateDetails));
  };

  const onParticipantsChange = ({}, num: AutocompleteValue) => {
    const examDateDetails: DraftClerkExamEvent = {
      ...examDate,
      maxParticipants: Number(num?.value),
    };
    dispatch(updateClerkNewExamDate(examDateDetails));
  };

  const onComboBoxChange = ({}, value: AutocompleteValue) => {
    const split: Array<string> = value?.value.split('-') || [];

    if (split[0] && split[1]) {
      const lang: ExamLanguage = split[0] as Exclude<
        ExamLanguage,
        ExamLanguage.ALL
      >;
      const level: ExamLevel = split[1] as ExamLevel;

      const examDateDetails: DraftClerkExamEvent = {
        ...examDate,
        language: lang,
        level: level,
      };
      dispatch(updateClerkNewExamDate(examDateDetails));
    }
  };

  const onRegistrationClosesChange = (value: Dayjs | null) => {
    const examDateDetails: DraftClerkExamEvent = {
      ...examDate,
      registrationCloses: value ?? undefined,
    };
    dispatch(updateClerkNewExamDate(examDateDetails));
  };
  const onDateChange = (value: Dayjs | null) => {
    const examDateDetails: DraftClerkExamEvent = {
      ...examDate,
      date: value ?? undefined,
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
                  value={getDateComboOpt(examDate)}
                />
              </div>
              <div
                className="rows gapped"
                data-testid="clerk-exam__event-information__date"
              >
                <H3>{t('header.date')}</H3>
                <CustomDatePicker
                  setValue={onDateChange}
                  label={translateCommon('choose')}
                  value={examDate?.date ?? null}
                />
              </div>
              <div
                className="rows gapped"
                data-testid="clerk-exam__event-information__registration"
              >
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
                  value={getParticipantsComboOpt(examDate)}
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
