import { Add as AddIcon } from '@mui/icons-material';
import { Box, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, CustomModal, H1, H2 } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { StringUtils } from 'shared/utils';

import { AuthorisationFields } from 'components/clerkTranslator/authorisation/AuthorisationFields';
import { BottomControls } from 'components/clerkTranslator/new/BottomControls';
import { NewTranslatorBasicInformation } from 'components/clerkTranslator/new/NewTranslatorBasicInformation';
import { AuthorisationListing } from 'components/clerkTranslator/overview/AuthorisationListing';
import { BackButton } from 'components/common/BackButton';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { Authorisation } from 'interfaces/authorisation';
import {
  initialiseClerkNewTranslatorByIdentityNumber,
  initialiseClerkNewTranslatorByPerson,
  resetClerkNewTranslator,
  saveClerkNewTranslator,
  updateClerkNewTranslator,
} from 'redux/reducers/clerkNewTranslator';
import { loadExaminationDates } from 'redux/reducers/examinationDate';
import { loadMeetingDates } from 'redux/reducers/meetingDate';
import { clerkNewTranslatorSelector } from 'redux/selectors/clerkNewTranslator';
import { clerkPersonSearchSelector } from 'redux/selectors/clerkPersonSearch';
import {
  examinationDatesSelector,
  selectExaminationDatesByStatus,
} from 'redux/selectors/examinationDate';
import {
  meetingDatesSelector,
  selectMeetingDatesByMeetingStatus,
} from 'redux/selectors/meetingDate';
import { AuthorisationUtils } from 'utils/authorisation';

export const ClerkNewTranslatorPage = () => {
  const [authorisation, setAuthorisation] = useState<Authorisation>(
    AuthorisationUtils.newAuthorisation,
  );
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => {
    setOpen(false);
    setAuthorisation(AuthorisationUtils.newAuthorisation);
  };
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  const { showToast } = useToast();
  const { showDialog } = useDialog();

  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.pages.clerkNewTranslatorPage',
  });
  const translateCommon = useCommonTranslation();

  // Redux
  const { translator, status, id } = useAppSelector(clerkNewTranslatorSelector);
  const { identityNumber, person } = useAppSelector(clerkPersonSearchSelector);
  const meetingDatesState = useAppSelector(meetingDatesSelector).meetingDates;
  const passedMeetingDates = useAppSelector(
    selectMeetingDatesByMeetingStatus,
  ).passed;
  const examinationDates = useAppSelector(
    examinationDatesSelector,
  ).examinationDates;
  const passedExaminationDates = useAppSelector(
    selectExaminationDatesByStatus,
  ).passed;

  useNavigationProtection(
    hasLocalChanges && status !== APIResponseStatus.Success,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Initialise translator by clerkPersonSearch
  useEffect(() => {
    if (person) {
      dispatch(initialiseClerkNewTranslatorByPerson(person));
    } else if (identityNumber) {
      dispatch(initialiseClerkNewTranslatorByIdentityNumber(identityNumber));
    } else {
      navigate(AppRoutes.ClerkHomePage);
    }
  }, [dispatch, person, identityNumber, navigate]);

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
        AppRoutes.ClerkTranslatorOverviewPage.replace(
          /:translatorId$/,
          `${id}`,
        ),
      );
    }
  }, [id, dispatch, navigate, status, showToast, t]);

  useEffect(() => {
    return () => {
      dispatch(resetClerkNewTranslator());
    };
  }, [dispatch]);

  const isLoading = status == APIResponseStatus.InProgress;
  const isSaveButtonDisabled =
    isLoading ||
    StringUtils.isBlankString(translator.lastName) ||
    StringUtils.isBlankString(translator.firstName) ||
    StringUtils.isBlankString(translator.nickName) ||
    translator.authorisations.length < 1;

  const onSave = () => dispatch(saveClerkNewTranslator(translator));

  const handleSaveAuthorisation = () => {
    dispatch(
      updateClerkNewTranslator({
        ...translator,
        authorisations: [...translator.authorisations, authorisation],
      }),
    );

    handleCloseModal();
    setHasLocalChanges(true);
  };

  const onAuthorisationRemove = (authorisation: Authorisation) => {
    showDialog({
      title: t('removeAuthorisationDialog.title'),
      severity: Severity.Warning,
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
              }),
            ),
        },
      ],
    });
  };

  return (
    <Box className="clerk-new-translator-page">
      <H1>{t('title')}</H1>
      <Paper
        elevation={3}
        className="clerk-new-translator-page__content-container rows"
      >
        <div className="rows gapped">
          <BackButton to={AppRoutes.ClerkPersonSearchPage} />
          <NewTranslatorBasicInformation
            onDetailsChange={() => setHasLocalChanges(true)}
          />
          <CustomModal
            open={open}
            onCloseModal={handleCloseModal}
            aria-labelledby="modal-title"
            modalTitle={t('modalTitle.addAuthorisation')}
          >
            <AuthorisationFields
              authorisation={authorisation}
              setAuthorisation={setAuthorisation}
              meetingDates={passedMeetingDates}
              examinationDates={passedExaminationDates}
              onSave={handleSaveAuthorisation}
              onCancel={handleCloseModal}
              isLoading={false}
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
              {t('modalTitle.addAuthorisation')}
            </CustomButton>
          </div>
          {translator.authorisations.length ? (
            <AuthorisationListing
              authorisations={translator.authorisations}
              showEditButton={false}
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
