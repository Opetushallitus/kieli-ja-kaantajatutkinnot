import { Add as AddIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import {
  CustomButton,
  CustomModal,
  H3,
  Text,
  ToggleFilterGroup,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';

import { AddAuthorisation } from 'components/clerkTranslator/add/AddAuthorisation';
import { AuthorisationListing } from 'components/clerkTranslator/overview/AuthorisationListing';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import { Authorisation } from 'interfaces/authorisation';
import { ClerkTranslator } from 'interfaces/clerkTranslator';
import { addAuthorisation } from 'redux/reducers/authorisation';
import {
  removeAuthorisation,
  updateAuthorisationPublishPermission,
} from 'redux/reducers/clerkTranslatorOverview';
import { loadExaminationDates } from 'redux/reducers/examinationDate';
import { loadMeetingDates } from 'redux/reducers/meetingDate';
import { authorisationSelector } from 'redux/selectors/authorisation';
import { clerkTranslatorOverviewSelector } from 'redux/selectors/clerkTranslatorOverview';
import { selectExaminationDatesByStatus } from 'redux/selectors/examinationDate';
import { selectMeetingDatesByMeetingStatus } from 'redux/selectors/meetingDate';
import { AuthorisationUtils } from 'utils/authorisation';

export const AuthorisationDetails = () => {
  // State
  const [selectedToggleFilter, setSelectedToggleFilter] = useState(
    AuthorisationStatus.Authorised
  );

  const { showDialog } = useDialog();
  const { showToast } = useToast();

  // Redux
  const { selectedTranslator } = useAppSelector(
    clerkTranslatorOverviewSelector
  );
  const passedMeetingDates = useAppSelector(
    selectMeetingDatesByMeetingStatus
  ).passed;
  const examinationDates = useAppSelector(selectExaminationDatesByStatus);
  const passedExaminationDates = examinationDates.passed;

  const { status } = useAppSelector(authorisationSelector);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);
  const [showToastOnAdd, setShowToastOnAdd] = useState(true);

  const handleAddAuthorisation = (authorisation: Authorisation) => {
    setShowToastOnAdd(true);
    dispatch(addAuthorisation(authorisation));
  };

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component',
  });
  const translateCommon = useCommonTranslation();

  useEffect(() => {
    if (status === APIResponseStatus.Success) {
      handleCloseModal();
      if (showToastOnAdd) {
        showToast({
          severity: Severity.Success,
          description: t('newAuthorisation.toasts.success'),
        });
        setShowToastOnAdd(false);
      }
    }
  }, [status, showToast, showToastOnAdd, t]);

  useEffect(() => {
    dispatch(loadMeetingDates());
    dispatch(loadExaminationDates());
  }, [dispatch]);

  if (!selectedTranslator) {
    return null;
  }

  const { authorised, expiring, expired, formerVIR } =
    AuthorisationUtils.groupClerkTranslatorAuthorisationsByStatus(
      selectedTranslator as ClerkTranslator
    );

  // Authorisations with status "Expiring" are shown under Authorised
  const groupedAuthorisations = {
    [AuthorisationStatus.Authorised]: [...authorised, ...expiring],
    [AuthorisationStatus.Expired]: expired,
    [AuthorisationStatus.FormerVIR]: formerVIR,
    [AuthorisationStatus.Expiring]: [],
  };

  const activeAuthorisations = groupedAuthorisations[selectedToggleFilter];
  const toggleFilters = [
    {
      status: AuthorisationStatus.Authorised,
      count: groupedAuthorisations.authorised.length,
      testId: `clerk-translator-overview__authorisation-details__toggle-btn--${AuthorisationStatus.Authorised}`,
      label: t(
        'clerkTranslatorOverview.authorisations.toggleFilters.effectives'
      ),
    },
    {
      status: AuthorisationStatus.Expired,
      count: groupedAuthorisations.expired.length,
      testId: `clerk-translator-overview__authorisation-details__toggle-btn--${AuthorisationStatus.Expired}`,
      label: t('clerkTranslatorOverview.authorisations.toggleFilters.expired'),
    },
    {
      status: AuthorisationStatus.FormerVIR,
      count: groupedAuthorisations.formerVIR.length,
      testId: `clerk-translator-overview__authorisation-details__toggle-btn--${AuthorisationStatus.FormerVIR}`,
      label: t(
        'clerkTranslatorOverview.authorisations.toggleFilters.formerVIR'
      ),
    },
  ];

  const onPermissionToPublishChange = (authorisation: Authorisation) => {
    showDialog({
      title: t(
        'clerkTranslatorOverview.authorisations.actions.changePermissionToPublish.dialog.header'
      ),
      severity: Severity.Info,
      description: t(
        'clerkTranslatorOverview.authorisations.actions.changePermissionToPublish.dialog.description'
      ),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => {
            dispatch(updateAuthorisationPublishPermission(authorisation));
          },
        },
      ],
    });
  };

  const onAuthorisationRemove = (authorisation: Authorisation) => {
    showDialog({
      title: t(
        'clerkTranslatorOverview.authorisations.actions.removal.dialog.header'
      ),
      severity: Severity.Info,
      description: t(
        'clerkTranslatorOverview.authorisations.actions.removal.dialog.description'
      ),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: t(
            'clerkTranslatorOverview.authorisations.actions.removal.dialog.confirmButton'
          ),
          variant: Variant.Contained,
          action: () => {
            dispatch(removeAuthorisation(authorisation.id as number));
          },
          buttonColor: Color.Error,
        },
      ],
    });
  };

  const filterByAuthorisationStatus = (status: AuthorisationStatus) => {
    setSelectedToggleFilter(status);
  };

  return (
    <>
      <CustomModal
        data-testid="authorisation-details__add-authorisation-modal"
        open={open}
        onCloseModal={handleCloseModal}
        ariaLabelledBy="modal-title"
        modalTitle={translateCommon('addAuthorisation')}
      >
        <AddAuthorisation
          translatorId={selectedTranslator.id}
          meetingDates={passedMeetingDates}
          examinationDates={passedExaminationDates}
          onCancel={handleCloseModal}
          onAuthorisationAdd={handleAddAuthorisation}
          isLoading={status === APIResponseStatus.InProgress}
        />
      </CustomModal>
      <div className="rows gapped-xs">
        <div className="columns margin-top-sm">
          <H3 className="grow">
            {t('clerkTranslatorOverview.authorisations.header')}
          </H3>
        </div>
        <div className="columns margin-top-sm space-between">
          <ToggleFilterGroup
            filters={toggleFilters}
            activeStatus={selectedToggleFilter}
            onButtonClick={filterByAuthorisationStatus}
          />
          <CustomButton
            data-testid="clerk-translator-overview__authorisation-details__add-btn"
            variant={Variant.Contained}
            color={Color.Secondary}
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            {translateCommon('addAuthorisation')}
          </CustomButton>
        </div>
        {activeAuthorisations.length ? (
          <AuthorisationListing
            authorisations={activeAuthorisations}
            permissionToPublishReadOnly={false}
            onAuthorisationRemove={onAuthorisationRemove}
            onPermissionToPublishChange={onPermissionToPublishChange}
          />
        ) : (
          <Text className="centered bold margin-top-lg">
            {t('clerkTranslatorOverview.authorisations.noAuthorisations')}
          </Text>
        )}
      </div>
    </>
  );
};
