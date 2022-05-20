import { Add as AddIcon } from '@mui/icons-material';
import { Box, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, CustomModal, H1, H2 } from 'shared/components';
import {
  APIResponseStatus,
  Color,
  Duration,
  Severity,
  Variant,
} from 'shared/enums';

import { AddAuthorisation } from 'components/clerkTranslator/add/AddAuthorisation';
import { BottomControls } from 'components/clerkTranslator/new/BottomControls';
import { NewTranslatorBasicInformation } from 'components/clerkTranslator/new/NewTranslatorBasicInformation';
import { AuthorisationListing } from 'components/clerkTranslator/overview/AuthorisationListing';
import { TopControls } from 'components/clerkTranslator/overview/TopControls';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { Authorisation } from 'interfaces/authorisation';
import {
  resetNewClerkTranslatorDetails,
  resetNewClerkTranslatorRequestStatus,
  updateNewClerkTranslator,
} from 'redux/actions/clerkNewTranslator';
import { loadExaminationDates } from 'redux/actions/examinationDate';
import { loadMeetingDates } from 'redux/actions/meetingDate';
import { showNotifierDialog, showNotifierToast } from 'redux/actions/notifier';
import { NOTIFIER_ACTION_DO_NOTHING } from 'redux/actionTypes/notifier';
import { clerkNewTranslatorSelector } from 'redux/selectors/clerkNewTranslator';
import {
  examinationDatesSelector,
  selectExaminationDatesByStatus,
} from 'redux/selectors/examinationDate';
import {
  meetingDatesSelector,
  selectMeetingDatesByMeetingStatus,
} from 'redux/selectors/meetingDate';
import { NotifierUtils } from 'utils/notifier';

export const ClerkNewTranslatorPage = () => {
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'akt.pages.clerkNewTranslatorPage',
  });
  const translateCommon = useCommonTranslation();

  // Redux
  const { translator, status, id } = useAppSelector(clerkNewTranslatorSelector);
  const meetingDatesState = useAppSelector(meetingDatesSelector).meetingDates;
  const passedMeetingDates = useAppSelector(
    selectMeetingDatesByMeetingStatus
  ).passed;
  const examinationDates = useAppSelector(
    examinationDatesSelector
  ).examinationDates;
  const passedExaminationDates = useAppSelector(
    selectExaminationDatesByStatus
  ).passed;

  const dispatch = useAppDispatch();
  const onAuthorisationAdd = (authorisation: Authorisation) => {
    setHasLocalChanges(true);
    dispatch(
      updateNewClerkTranslator({
        ...translator,
        authorisations: [...translator.authorisations, authorisation],
      })
    );
  };

  const onAuthorisationRemove = (authorisation: Authorisation) => {
    const notifier = NotifierUtils.createNotifierDialog(
      t('removeAuthorisationDialog.title'),
      Severity.Info,
      '',
      [
        {
          title: translateCommon('no'),
          variant: Variant.Outlined,
          action: NOTIFIER_ACTION_DO_NOTHING,
        },
        {
          dataTestId: 'clerk-new-translator-page__dialog-confirm-remove-button',
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () =>
            dispatch(
              updateNewClerkTranslator({
                ...translator,
                authorisations: translator.authorisations.filter((a) => {
                  return a.tempId !== authorisation.tempId;
                }),
              })
            ),
        },
      ]
    );

    dispatch(showNotifierDialog(notifier));
  };

  // Navigation
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !meetingDatesState.meetingDates.length &&
      meetingDatesState.status === APIResponseStatus.NotStarted
    ) {
      dispatch(loadMeetingDates);
    }
  }, [dispatch, meetingDatesState]);

  useEffect(() => {
    if (
      !examinationDates.dates.length &&
      examinationDates.status === APIResponseStatus.NotStarted
    ) {
      dispatch(loadExaminationDates);
    }
  }, [dispatch, examinationDates]);

  useEffect(() => {
    if (status === APIResponseStatus.Success) {
      const successToast = NotifierUtils.createNotifierToast(
        Severity.Success,
        t('toasts.success'),
        Duration.Medium
      );
      dispatch(resetNewClerkTranslatorRequestStatus);
      dispatch(resetNewClerkTranslatorDetails);
      dispatch(showNotifierToast(successToast));
      navigate(
        AppRoutes.ClerkTranslatorOverviewPage.replace(/:translatorId$/, `${id}`)
      );
    } else if (status === APIResponseStatus.Error) {
      dispatch(resetNewClerkTranslatorRequestStatus);
    }
  }, [id, dispatch, navigate, status, t]);

  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  useNavigationProtection(hasLocalChanges);

  return (
    <Box className="clerk-new-translator-page">
      <H1>{t('title')}</H1>
      <Paper
        elevation={3}
        className="clerk-new-translator-page__content-container rows"
      >
        <div className="rows gapped">
          <TopControls />
          <NewTranslatorBasicInformation
            onDetailsChange={() => setHasLocalChanges(true)}
          />
          <CustomModal
            data-testid="authorisation-details__add-authorisation-modal"
            open={open}
            onCloseModal={handleCloseModal}
            ariaLabelledBy="modal-title"
            modalTitle={translateCommon('addAuthorisation')}
          >
            <AddAuthorisation
              meetingDates={passedMeetingDates}
              examinationDates={passedExaminationDates}
              onAuthorisationAdd={onAuthorisationAdd}
              onCancel={handleCloseModal}
            />
          </CustomModal>
          <div className="columns margin-top-sm space-between">
            <H2>{t('addedAuthorisationsTitle')}</H2>
            <CustomButton
              data-testid="clerk-new-translator-page__add-authorisation-button"
              variant={Variant.Contained}
              color={Color.Secondary}
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            >
              {translateCommon('addAuthorisation')}
            </CustomButton>
          </div>
          {translator.authorisations.length ? (
            <AuthorisationListing
              authorisations={translator.authorisations}
              permissionToPublishReadOnly={true}
              onAuthorisationRemove={onAuthorisationRemove}
            />
          ) : null}
          <BottomControls />
        </div>
      </Paper>
    </Box>
  );
};
