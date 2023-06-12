import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import { Box, Grid, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import {
  CustomButton,
  CustomButtonLink,
  H1,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { ClerkExamDate } from 'components/clerkExamEvent/create/ClerkExamDate';
import { ClerkExamHideToggle } from 'components/clerkExamEvent/create/ClerkExamHideToggle';
import { ClerkExamLanguageLevel } from 'components/clerkExamEvent/create/ClerkExamLanguageLevel';
import { ClerkExamMaxParticipants } from 'components/clerkExamEvent/create/ClerkExamMaxParticipants';
import { ClerkExamRegistrationCloses } from 'components/clerkExamEvent/create/ClerkExamRegistrationCloses';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { DraftClerkExamEvent } from 'interfaces/clerkExamEvent';
import {
  resetClerkNewExamDate,
  saveClerkNewExamDate,
} from 'redux/reducers/clerkNewExamDate';
import { clerkNewExamDateSelector } from 'redux/selectors/clerkNewExamDate';
import { ExamCreateEventUtils } from 'utils/examCreateEvent';

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

type SaveButtonProps = {
  isEnabled: boolean;
  onSave: () => void;
};
const SaveButton = ({ isEnabled, onSave }: SaveButtonProps) => {
  const translateCommon = useCommonTranslation();

  return (
    <CustomButton
      data-testid="clerk-translator-overview__translator-details__save-btn"
      variant={Variant.Contained}
      color={Color.Secondary}
      disabled={isEnabled}
      onClick={onSave}
    >
      {translateCommon('save')}
    </CustomButton>
  );
};

export const ClerkExamEventCreatePage: FC = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventCreate',
  });
  const {
    status,
    examDate,
  }: { status: APIResponseStatus; examDate: DraftClerkExamEvent } =
    useAppSelector(clerkNewExamDateSelector);
  const dispatch = useAppDispatch();

  const { showToast } = useToast();

  useEffect(() => {
    if (status === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.addingSucceeded'),
      });
      dispatch(resetClerkNewExamDate());
    }
  }, [showToast, t, status, dispatch]);

  const isLoading = status === APIResponseStatus.InProgress;
  const canSave = isLoading || !ExamCreateEventUtils.isValidExamEvent(examDate);
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
          <Paper
            elevation={3}
            className="clerk-homepage__exam-events clerk-homepage-create-exam-events"
          >
            <div>
              <BackButton />
            </div>
            <div className="grid-columns gapped">
              <ClerkExamLanguageLevel examForm={examDate} />
              <ClerkExamDate examForm={examDate} />
              <ClerkExamRegistrationCloses examForm={examDate} />
            </div>
            <div className="grid-columns gapped flex-stretch">
              <ClerkExamMaxParticipants examForm={examDate} />
              <ClerkExamHideToggle examForm={examDate} />
              <div />
            </div>
            <div className="columns flex-end">
              <LoadingProgressIndicator isLoading={isLoading}>
                <SaveButton isEnabled={canSave} onSave={onSave} />
              </LoadingProgressIndicator>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
