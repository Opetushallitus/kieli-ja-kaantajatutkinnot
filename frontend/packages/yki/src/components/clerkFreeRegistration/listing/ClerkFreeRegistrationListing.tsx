import {
  BlockFlipped,
  CheckCircle,
  ErrorOutline,
  HourglassBottom,
} from '@mui/icons-material';
import { Box } from '@mui/system';
import { ClockIcon } from '@mui/x-date-pickers';
import i18next from 'i18next';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CustomCircularProgress } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ListTable } from 'components/oph-design/table/list-table';
import { PageSizeSelector } from 'components/oph-design/table/page-size-selector';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  ClerkFreeRegistration,
  ClerkFreeRegistrationSort,
  FreeRegistrationStatus,
} from 'interfaces/clerkFreeRegistration';
import { H2, Text } from 'ophTheme/Text';
import {
  loadClerkFreeRegistrations,
  setFreeRegistrationsSort,
} from 'redux/reducers/clerkFreeRegistration';
import {
  clerkFreeRegistrationSelector,
  selectFilteredFreeRegistrations,
} from 'redux/selectors/clerkFreeRegistration';

type ClerkRegisterListingProps = {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (page: number) => void;
  activeTab: 'pending' | 'previous';
};

export const ClerkFreeRegistrationListing = ({
  page,
  setPage,
  pageSize,
  setPageSize,
  activeTab,
}: ClerkRegisterListingProps) => {
  const { status, freeRegistrationsSort } = useAppSelector(
    clerkFreeRegistrationSelector,
  );
  const dispatch = useAppDispatch();
  const filteredFreeRegistrations = useAppSelector(
    selectFilteredFreeRegistrations,
  );
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeRegistration',
  });
  const commonTranslation = useCommonTranslation();

  const isPendingReqistation = (status: FreeRegistrationStatus) =>
    [
      'PENDING',
      'SUPPLEMENT_REQUESTED',
      'SUPPLEMENT_REQUEST_ANSWERED',
      'SUPPLEMENT_REQUEST_EXPIRED',
    ].includes(status);

  const rows = filteredFreeRegistrations.filter((registration) =>
    activeTab === 'pending'
      ? isPendingReqistation(registration.status)
      : !isPendingReqistation(registration.status),
  );

  const renderStatusColumn = (status: FreeRegistrationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <div className="columns gapped-xxs align-items-start">
            <ClockIcon color="warning" fontSize="large" />
            <Text className="bold">{t(`status.${status}.part1`)}</Text>
          </div>
        );
      case 'APPROVED':
        return (
          <div className="columns gapped-xxs align-items-start">
            <CheckCircle color="success" fontSize="large" />
            <Text className="bold">{t(`status.${status}.part1`)}</Text>
          </div>
        );
      case 'SUPPLEMENT_REQUESTED':
        return (
          <div className="columns gapped-xxs align-items-start">
            <HourglassBottom color="success" fontSize="large" />
            <div className="rows gapped-xxs">
              <Text className="bold">{t(`status.${status}.part1`)}</Text>
              <Text>{t(`status.${status}.part2`)}</Text>
            </div>
          </div>
        );
      case 'SUPPLEMENT_REQUEST_ANSWERED':
        return (
          <div className="columns gapped-xxs align-items-start">
            <ClockIcon color="error" fontSize="large" />
            <div className="rows gapped-xxs">
              <Text className="bold">{t(`status.${status}.part1`)}</Text>
              <Text>{t(`status.${status}.part2`)}</Text>
            </div>
          </div>
        );
      case 'SUPPLEMENT_REQUEST_EXPIRED':
        return (
          <div className="columns gapped-xxs align-items-start">
            <ErrorOutline color="error" fontSize="large" />
            <div className="rows gapped-xxs">
              <Text className="bold">{t(`status.${status}.part1`)}</Text>
              <Text>{t(`status.${status}.part2`)}</Text>
            </div>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="columns gapped-xxs align-items-start">
            <BlockFlipped color="error" fontSize="large" />
            <Text className="bold">{t(`status.${status}.part1`)}</Text>
          </div>
        );
      default:
        return null;
    }
  };

  const createPersonColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'person',
    title: t('listing.header.person'),
    sortable: true,
    render: (rowProps) => (
      <div className="rows gapped-xs">
        <Text>{`${rowProps.person.firstName} ${rowProps.person.lastName}`}</Text>
        <Text>{rowProps.person.socialSecurityNumber}</Text>
        <Text>{rowProps.person.oid}</Text>
      </div>
    ),
  });

  const createStatusColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'status',
    title: t('listing.header.status'),
    sortable: true,
    render: (rowProps) => renderStatusColumn(rowProps.status),
  });

  const createDueDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'supplementRequestDueDate',
    title: t('listing.header.supplementRequestDueDate'),
    sortable: true,
    render: (rowProps) => (
      <Text>
        {rowProps.supplementRequestDueDate
          ? DateUtils.formatOptionalDate(rowProps.supplementRequestDueDate, 'l')
          : ''}
      </Text>
    ),
  });

  const createAssessmentDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'assessmentDate',
    title: t('listing.header.assessmentDate'),
    sortable: true,
    render: (rowProps) => (
      <Text>
        {rowProps.assessmentDate
          ? DateUtils.formatOptionalDate(rowProps.assessmentDate, 'l')
          : ''}
      </Text>
    ),
  });

  const createExamDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'examDate',
    title: t('listing.header.examDate'),
    sortable: true,
    render: (rowProps) => (
      <Text>{DateUtils.formatOptionalDate(rowProps.examDate, 'l')}</Text>
    ),
  });

  const createRegistrationColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'registration',
    title: t('listing.header.registration'),
    sortable: true,
    render: (rowProps) => (
      <Text>
        {rowProps.registration.kind === 'ADMISSION'
          ? t('listing.registrationStatus.enrolled')
          : t('listing.registrationStatus.queued', {
              positionInQueue: rowProps.registration.positionInQueue,
              queue: rowProps.registration.queue,
            })}
      </Text>
    ),
  });

  const createActionColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'actions',
    title: t('listing.header.actions'),
    render: (rowProps) => {
      const to = AppRoutes.ClerkFreeRegistrationDetails.replace(
        /:id$/,
        `${rowProps.id}`,
      );

      return (
        <Link to={to}>
          {rowProps.status !== 'PENDING'
            ? t('listing.showDetails')
            : t('listing.assessCertificate')}
        </Link>
      );
    },
  });

  const columns = [
    createPersonColumn(t),
    createStatusColumn(t),
    activeTab === 'pending'
      ? createDueDateColumn(t)
      : createAssessmentDateColumn(t),
    createExamDateColumn(t),
    createRegistrationColumn(t),
    createActionColumn(t),
  ];

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadClerkFreeRegistrations());
    }
  }, [dispatch, status]);

  switch (status) {
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
      return <CustomCircularProgress color={Color.Secondary} />;
    case APIResponseStatus.Cancelled:
    case APIResponseStatus.Error:
      return (
        <Box
          minHeight="10vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <H2>{commonTranslation('errors.loadingFailed')}</H2>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <>
          <div className="columns space-between">
            {t('listing.amountOfRegistrations', { amount: rows.length })}
            <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
          </div>
          <ListTable
            className="clerk-free-registration-listing__table"
            rows={rows}
            rowKeyProp="id"
            columns={columns}
            translateHeader={false}
            pagination={{ page, setPage, pageSize }}
            sort={freeRegistrationsSort}
            setSort={(sort: string) =>
              dispatch(
                setFreeRegistrationsSort(sort as ClerkFreeRegistrationSort),
              )
            }
          />
        </>
      );
  }
};
