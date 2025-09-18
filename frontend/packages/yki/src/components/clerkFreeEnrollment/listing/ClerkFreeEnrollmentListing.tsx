import { Box } from '@mui/system';
import i18next from 'i18next';
import { useEffect } from 'react';
import { CustomCircularProgress, H2 } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ClerkFreeEnrollment } from 'interfaces/clerkFreeEnrollment';
import { loadClerkFreeEnrollments } from 'redux/reducers/clerkFreeEnrollment';
import {
  clerkFreeEnrollmentSelector,
  selectFilteredFreeEnrollments,
} from 'redux/selectors/clerkFreeEnrollment';

type ClerkRegisterListingProps = {
  page: number;
  setPage: (page: number) => void;
};

export const ClerkFreeEnrollmentListing = ({
  page,
  setPage,
}: ClerkRegisterListingProps) => {
  const { status } = useAppSelector(clerkFreeEnrollmentSelector);
  const filteredFreeEnrollments = useAppSelector(selectFilteredFreeEnrollments);
  const rows = filteredFreeEnrollments.map((enrollment) => ({
    ...enrollment,
  }));

  const pagination = {
    page,
    setPage,
    pageSize: 20,
  };

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeEnrollmentListing',
  });

  const createPersonColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeEnrollment> => ({
    key: 'person',
    title: t('header.person'),
    render: (rowProps) => <span>{rowProps.person.oid}</span>,
  });

  const createStatusColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeEnrollment> => ({
    key: 'status',
    title: t('header.status'),
    render: (rowProps) => <span>{t(`status.${rowProps.status}`)}</span>,
  });

  // freeExam dueDate exists if more information has been requested
  // likely adding assessmentDate column and then render either one based on data
  const createDueDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeEnrollment> => ({
    key: 'dueDate',
    title: t('header.dueDate'),
    render: (rowProps) => <span>{`${rowProps.dueDate}`}</span>,
  });

  const createExamDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeEnrollment> => ({
    key: 'examDate',
    title: t('header.examDate'),
    render: (rowProps) => <span>{`${rowProps.examDate}`}</span>,
  });

  const createRegistrationColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeEnrollment> => ({
    key: 'registration',
    title: t('header.registration'),
    render: (rowProps) => <span>{`${rowProps.registration.kind}`}</span>,
  });

  const createActionColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkFreeEnrollment> => ({
    key: 'actions',
    title: t('header.actions'),
    render: () => <span>Tarkasta Todistus</span>,
  });

  const columns = [
    createPersonColumn(t),
    createStatusColumn(t),
    createDueDateColumn(t),
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
          <H2>{t('errors.loadingFailed')}</H2>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <ListTable
          rows={rows}
          rowKeyProp="id"
          columns={columns}
          translateHeader={false}
          pagination={pagination}
        />
      );
  }
};
