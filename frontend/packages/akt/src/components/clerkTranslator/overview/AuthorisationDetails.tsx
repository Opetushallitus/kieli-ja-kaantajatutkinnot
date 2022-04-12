import { Add as AddIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';

import { AddAuthorisation } from 'components/clerkTranslator/add/AddAuthorisation';
import { AuthorisationListing } from 'components/clerkTranslator/overview/AuthorisationListing';
import { CustomButton } from 'components/elements/CustomButton';
import { CustomModal } from 'components/elements/CustomModal';
import { H3, Text } from 'components/elements/Text';
import { ToggleFilterGroup } from 'components/elements/ToggleFilterGroup';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIResponseStatus } from 'enums/api';
import { Color, Severity, Variant } from 'enums/app';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import { Authorisation } from 'interfaces/authorisation';
import { ClerkTranslator } from 'interfaces/clerkTranslator';
import { addAuthorisation } from 'redux/actions/authorisation';
import { deleteAuthorisation } from 'redux/actions/clerkTranslatorOverview';
import { loadMeetingDates } from 'redux/actions/meetingDate';
import { showNotifierDialog } from 'redux/actions/notifier';
import { NOTIFIER_ACTION_DO_NOTHING } from 'redux/actionTypes/notifier';
import { authorisationSelector } from 'redux/selectors/authorisation';
import { clerkTranslatorOverviewSelector } from 'redux/selectors/clerkTranslatorOverview';
import { selectMeetingDatesByMeetingStatus } from 'redux/selectors/meetingDate';
import { AuthorisationUtils } from 'utils/authorisation';
import { NotifierUtils } from 'utils/notifier';

export const AuthorisationDetails = () => {
  // State
  const [selectedToggleFilter, setSelectedToggleFilter] = useState(
    AuthorisationStatus.Authorised
  );

  // Redux
  const { selectedTranslator } = useAppSelector(
    clerkTranslatorOverviewSelector
  );
  const { passed } = useAppSelector(selectMeetingDatesByMeetingStatus);

  const { status } = useAppSelector(authorisationSelector);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  const handleAddAuthorisation = (authorisation: Authorisation) => {
    dispatch(addAuthorisation(authorisation));
  };

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.clerkTranslatorOverview.authorisations',
  });
  const translateCommon = useCommonTranslation();

  useEffect(() => {
    if (status === APIResponseStatus.Success) {
      handleCloseModal();
    }
  }, [status]);

  useEffect(() => {
    dispatch(loadMeetingDates);
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
      label: t('toggleFilters.effectives'),
    },
    {
      status: AuthorisationStatus.Expired,
      count: groupedAuthorisations.expired.length,
      testId: `clerk-translator-overview__authorisation-details__toggle-btn--${AuthorisationStatus.Expired}`,
      label: t('toggleFilters.expired'),
    },
    {
      status: AuthorisationStatus.FormerVIR,
      count: groupedAuthorisations.formerVIR.length,
      testId: `clerk-translator-overview__authorisation-details__toggle-btn--${AuthorisationStatus.FormerVIR}`,
      label: t('toggleFilters.formerVIR'),
    },
  ];

  const filterByAuthorisationStatus = (status: AuthorisationStatus) => {
    setSelectedToggleFilter(status);
  };

  const onAuthorisationRemove = (authorisation: Authorisation) => {
    const notifier = NotifierUtils.createNotifierDialog(
      t('actions.removal.dialog.header'),
      Severity.Info,
      t('actions.removal.dialog.description'),
      [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
          action: NOTIFIER_ACTION_DO_NOTHING,
        },
        {
          title: t('actions.removal.dialog.confirmButton'),
          variant: Variant.Contained,
          action: () =>
            dispatch(deleteAuthorisation(authorisation.id as number)),
          buttonColor: Color.Error,
        },
      ]
    );

    dispatch(showNotifierDialog(notifier));
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
          meetingDates={passed}
          onCancel={handleCloseModal}
          onAuthorisationAdd={handleAddAuthorisation}
          isLoading={status === APIResponseStatus.InProgress}
        />
      </CustomModal>
      <div className="rows gapped-xs">
        <div className="columns margin-top-sm">
          <H3 className="grow">{t('header')}</H3>
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
            onAuthorisationRemove={onAuthorisationRemove}
            permissionToPublishReadOnly={false}
          />
        ) : (
          <Text className="centered bold margin-top-lg">
            {t('noAuthorisations')}
          </Text>
        )}
      </div>
    </>
  );
};
