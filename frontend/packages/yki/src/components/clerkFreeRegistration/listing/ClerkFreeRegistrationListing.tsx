import {
  BlockFlipped,
  CheckCircle,
  HourglassBottom,
} from '@mui/icons-material';
import { Box } from '@mui/system';
import { ClockIcon } from '@mui/x-date-pickers';
import i18next from 'i18next';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CustomCircularProgress, H2 } from 'shared/components';
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
  FreeRegistrationStatus,
} from 'interfaces/clerkFreeRegistration';
import { loadClerkFreeRegistrations } from 'redux/reducers/clerkFreeRegistration';
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
  const { status } = useAppSelector(clerkFreeRegistrationSelector);
  const filteredFreeRegistrations = useAppSelector(
    selectFilteredFreeRegistrations,
  );
  const rows = filteredFreeRegistrations.filter((registration) =>
    activeTab === 'pending'
      ? [
          'PENDING',
          'INFORMATION_REQUESTED',
          'INFORMATION_REQUEST_ANSWERED',
        ].includes(registration.status)
      : ['APPROVED', 'REJECTED'].includes(registration.status),
  );

  const pagination = {
    page,
    setPage,
    pageSize,
  };

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeRegistration',
  });

  const renderStatusColumn = (status: FreeRegistrationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <div className="columns gapped-xxs align-items-center">
            <ClockIcon color="warning" style={{ fontSize: '2rem' }} />
            <span style={{ fontWeight: '600' }}>
              {t(`status.${status}.part1`)}
            </span>
          </div>
        );
      case 'APPROVED':
        return (
          <div className="columns gapped-xxs align-items-center">
            <CheckCircle color="success" style={{ fontSize: '2rem' }} />
            <span style={{ fontWeight: '600' }}>
              {t(`status.${status}.part1`)}
            </span>
          </div>
        );
      case 'INFORMATION_REQUESTED':
        return (
          <div className="columns gapped-xxs align-items-start">
            <HourglassBottom color="success" style={{ fontSize: '2rem' }} />
            <div className="rows gapped-xxs">
              <span style={{ fontWeight: '600' }}>
                {t(`status.${status}.part1`)}
              </span>
              <span>{t(`status.${status}.part2`)}</span>
            </div>
          </div>
        );
      case 'INFORMATION_REQUEST_ANSWERED':
        return (
          <div className="columns gapped-xxs align-items-start">
            <ClockIcon color="error" style={{ fontSize: '2rem' }} />
            <div className="rows gapped-xxs">
              <span style={{ fontWeight: '600' }}>
                {t(`status.${status}.part1`)}
              </span>
              <span>{t(`status.${status}.part2`)}</span>
            </div>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="columns gapped-xxs align-items-center">
            <BlockFlipped color="error" style={{ fontSize: '2rem' }} />
            <span style={{ fontWeight: '600' }}>
              {t(`status.${status}.part1`)}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const commonTranslation = useCommonTranslation();

  const createPersonColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'person',
    title: t('listing.header.person'),
    render: (rowProps) => (
      <div className="rows gapped-xs">
        <span>{rowProps.person.fullName}</span>
        <span>{rowProps.person.socialSecurityNumber}</span>
        <span>{rowProps.person.oid}</span>
      </div>
    ),
  });

  const createStatusColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'status',
    title: t('listing.header.status'),
    render: (rowProps) => renderStatusColumn(rowProps.status),
  });

  const createDueDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'dueDate',
    title: t('listing.header.dueDate'),
    render: (rowProps) => (
      <span>
        {rowProps.supplementRequestDueDate
          ? DateUtils.formatOptionalDate(rowProps.supplementRequestDueDate, 'l')
          : ''}
      </span>
    ),
  });

  const createAssessmentDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'assessmentDate',
    title: t('listing.header.assessmentDate'),
    render: (rowProps) => (
      <span>
        {rowProps.assessmentDate
          ? DateUtils.formatOptionalDate(rowProps.assessmentDate, 'l')
          : ''}
      </span>
    ),
  });

  const createExamDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'examDate',
    title: t('listing.header.examDate'),
    render: (rowProps) => (
      <span>{DateUtils.formatOptionalDate(rowProps.examDate, 'l')}</span>
    ),
  });

  const createRegistrationColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'registration',
    title: t('listing.header.registration'),
    render: (rowProps) => (
      <span>
        {rowProps.registration.kind === 'ADMISSION'
          ? t('listing.registrationStatus.enrolled')
          : t('listing.registrationStatus.queued', {
              positionInQueue: rowProps.registration.positionInQueue,
              queue: rowProps.registration.queue,
            })}
      </span>
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

  const dispatch = useAppDispatch();
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
            <span>{rows.length} ilmoittautujaa</span>
            <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
          </div>
          <ListTable
            className="clerk-free-registration-listing__table"
            rows={rows}
            rowKeyProp="id"
            columns={columns}
            translateHeader={false}
            pagination={pagination}
            setSort={() => {}}
          />
        </>
      );
  }
};
