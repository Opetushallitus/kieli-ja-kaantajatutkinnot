import {
  BlockFlipped,
  CheckCircle,
  HourglassBottom,
} from '@mui/icons-material';
import { Typography } from '@mui/material';
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
            <Typography style={{ fontWeight: '600' }}>
              {t(`status.${status}.part1`)}
            </Typography>
          </div>
        );
      case 'APPROVED':
        return (
          <div className="columns gapped-xxs align-items-center">
            <CheckCircle color="success" style={{ fontSize: '2rem' }} />
            <Typography style={{ fontWeight: '600' }}>
              {t(`status.${status}.part1`)}
            </Typography>
          </div>
        );
      case 'INFORMATION_REQUESTED':
        return (
          <div className="columns gapped-xxs align-items-start">
            <HourglassBottom color="success" style={{ fontSize: '2rem' }} />
            <div className="rows gapped-xxs">
              <Typography style={{ fontWeight: '600' }}>
                {t(`status.${status}.part1`)}
              </Typography>
              <Typography>{t(`status.${status}.part2`)}</Typography>
            </div>
          </div>
        );
      case 'INFORMATION_REQUEST_ANSWERED':
        return (
          <div className="columns gapped-xxs align-items-start">
            <ClockIcon color="error" style={{ fontSize: '2rem' }} />
            <div className="rows gapped-xxs">
              <Typography style={{ fontWeight: '600' }}>
                {t(`status.${status}.part1`)}
              </Typography>
              <Typography>{t(`status.${status}.part2`)}</Typography>
            </div>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="columns gapped-xxs align-items-center">
            <BlockFlipped color="error" style={{ fontSize: '2rem' }} />
            <Typography style={{ fontWeight: '600' }}>
              {t(`status.${status}.part1`)}
            </Typography>
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
        <Typography>{rowProps.person.fullName}</Typography>
        <Typography>{rowProps.person.socialSecurityNumber}</Typography>
        <Typography>{rowProps.person.oid}</Typography>
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
      <Typography>
        {rowProps.supplementRequestDueDate
          ? DateUtils.formatOptionalDate(rowProps.supplementRequestDueDate, 'l')
          : ''}
      </Typography>
    ),
  });

  const createAssessmentDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'assessmentDate',
    title: t('listing.header.assessmentDate'),
    render: (rowProps) => (
      <Typography>
        {rowProps.assessmentDate
          ? DateUtils.formatOptionalDate(rowProps.assessmentDate, 'l')
          : ''}
      </Typography>
    ),
  });

  const createExamDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'examDate',
    title: t('listing.header.examDate'),
    render: (rowProps) => (
      <Typography>
        {DateUtils.formatOptionalDate(rowProps.examDate, 'l')}
      </Typography>
    ),
  });

  const createRegistrationColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeRegistration> => ({
    key: 'registration',
    title: t('listing.header.registration'),
    render: (rowProps) => (
      <Typography>
        {rowProps.registration.kind === 'ADMISSION'
          ? t('listing.registrationStatus.enrolled')
          : t('listing.registrationStatus.queued', {
              positionInQueue: rowProps.registration.positionInQueue,
              queue: rowProps.registration.queue,
            })}
      </Typography>
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
            {t('listing.amountOfRegistrations', { amount: rows.length })}
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
