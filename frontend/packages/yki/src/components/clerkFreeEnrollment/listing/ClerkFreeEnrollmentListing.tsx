import { Box } from '@mui/system';
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
  ClerkFreeEnrollment,
  FreeEnrollmentStatus,
} from 'interfaces/clerkFreeEnrollment';
import { loadClerkFreeEnrollments } from 'redux/reducers/clerkFreeEnrollment';
import {
  clerkFreeEnrollmentSelector,
  selectFilteredFreeEnrollments,
} from 'redux/selectors/clerkFreeEnrollment';

type ClerkRegisterListingProps = {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (page: number) => void;
  activeTab: 'pending' | 'previous';
};

export const ClerkFreeEnrollmentListing = ({
  page,
  setPage,
  pageSize,
  setPageSize,
  activeTab,
}: ClerkRegisterListingProps) => {
  const { status } = useAppSelector(clerkFreeEnrollmentSelector);
  const filteredFreeEnrollments = useAppSelector(selectFilteredFreeEnrollments);
  const rows = filteredFreeEnrollments
    .filter((enrollment) =>
      activeTab === 'pending'
        ? [
            'PENDING',
            'INFORMATION_REQUESTED',
            'INFORMATION_REQUEST_ANSWERED',
          ].includes(enrollment.status)
        : ['APPROVED', 'REJECTED'].includes(enrollment.status),
    )
    .map((enrollment) => ({
      ...enrollment,
    }));

  const pagination = {
    page,
    setPage,
    pageSize,
  };

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeEnrollment',
  });

  const getStatusColumnText = (status: FreeEnrollmentStatus) => {
    if (['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return (
        <span style={{ fontWeight: '600' }}>{t(`status.${status}.part1`)}</span>
      );
    }

    return (
      <>
        <span style={{ fontWeight: '600' }}>{t(`status.${status}.part1`)}</span>
        <span>{t(`status.${status}.part2`)}</span>
      </>
    );
  };

  const commonTranslation = useCommonTranslation();

  const createPersonColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeEnrollment> => ({
    key: 'person',
    title: t('listing.header.person'),
    sortable: true,
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
  ): ListTableColumn<ClerkFreeEnrollment> => ({
    key: 'status',
    title: t('listing.header.status'),
    render: (rowProps) => (
      <div className="rows">{getStatusColumnText(rowProps.status)}</div>
    ),
  });

  // freeExam dueDate exists if more information has been requested
  // likely adding assessmentDate column and then render either one based on data
  const createDueDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeEnrollment> => ({
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
  ): ListTableColumn<ClerkFreeEnrollment> => ({
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
  ): ListTableColumn<ClerkFreeEnrollment> => ({
    key: 'examDate',
    title: t('listing.header.examDate'),
    render: (rowProps) => (
      <span>{DateUtils.formatOptionalDate(rowProps.examDate, 'l')}</span>
    ),
  });

  const createRegistrationColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeEnrollment> => ({
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
  ): ListTableColumn<ClerkFreeEnrollment> => ({
    key: 'actions',
    title: t('listing.header.actions'),
    render: (rowProps) => {
      const to = AppRoutes.ClerkFreeEnrollmentDetails.replace(
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
      dispatch(loadClerkFreeEnrollments());
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
            className="clerk-free-enrollment-listing__table"
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
