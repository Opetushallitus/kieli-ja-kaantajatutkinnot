import { Add as AddIcon } from '@mui/icons-material';
import { Box, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, CustomModal, H1, H2 } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';

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
  resetClerkNewTranslator,
  saveClerkNewTranslator,
  updateClerkNewTranslator,
} from 'redux/reducers/clerkNewTranslator';
import { loadExaminationDates } from 'redux/reducers/examinationDate';
import { loadMeetingDates } from 'redux/reducers/meetingDate';
import { clerkNewTranslatorSelector } from 'redux/selectors/clerkNewTranslator';
import {
  examinationDatesSelector,
  selectExaminationDatesByStatus,
} from 'redux/selectors/examinationDate';
import {
  meetingDatesSelector,
  selectMeetingDatesByMeetingStatus,
} from 'redux/selectors/meetingDate';

export const ClerkNewTranslatorPage = () => {
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  const { showToast } = useToast();
  const { showDialog } = useDialog();

  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.pages.clerkNewTranslatorPage',
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
      updateClerkNewTranslator({
        ...translator,
        authorisations: [...translator.authorisations, authorisation],
      })
    );
  };

  const onAuthorisationRemove = (authorisation: Authorisation) => {
    showDialog({
      title: t('removeAuthorisationDialog.title'),
      severity: Severity.Info,
      description: '',
      actions: [
        {
          title: translateCommon('no'),
          variant: Variant.Outlined,
        },
        {
          dataTestId: 'clerk-new-translator-page__dialog-confirm-remove-button',
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () =>
            dispatch(
              updateClerkNewTranslator({
                ...translator,
                authorisations: translator.authorisations.filter((a) => {
                  return a.tempId !== authorisation.tempId;
                }),
              })
            ),
        },
      ],
    });
  };

  // Navigation
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !meetingDatesState.meetingDates.length &&
      meetingDatesState.status === APIResponseStatus.NotStarted
    ) {
      dispatch(loadMeetingDates());
    }
  }, [dispatch, meetingDatesState]);

  useEffect(() => {
    if (
      !examinationDates.dates.length &&
      examinationDates.status === APIResponseStatus.NotStarted
    ) {
      dispatch(loadExaminationDates());
    }
  }, [dispatch, examinationDates]);

  useEffect(() => {
    if (status === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.success'),
      });
      navigate(
        AppRoutes.ClerkTranslatorOverviewPage.replace(/:translatorId$/, `${id}`)
      );
    }
  }, [id, dispatch, navigate, status, showToast, t]);

  useEffect(() => {
    return () => {
      dispatch(resetClerkNewTranslator());
    };
  }, [dispatch]);

  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  useNavigationProtection(
    hasLocalChanges && status !== APIResponseStatus.Success
  );

  const isLoading = status == APIResponseStatus.InProgress;
  const isSaveButtonDisabled =
    isLoading ||
    !translator.firstName ||
    !translator.lastName ||
    translator.authorisations.length < 1;
  const onSave = () => dispatch(saveClerkNewTranslator(translator));

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
          <BottomControls
            isLoading={isLoading}
            isSaveDisabled={isSaveButtonDisabled}
            onSave={onSave}
          />
        </div>
      </Paper>
    </Box>
  );
};
