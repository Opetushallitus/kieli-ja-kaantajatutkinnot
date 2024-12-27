import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TableCell, TableHead, TableRow } from '@mui/material';
import { useParams } from 'react-router';
import { CustomButtonLink, CustomTable, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useExaminerTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ContactRequest } from 'interfaces/examinerDetails';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';

const ExaminerExamEventListingHeader = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerContactRequest',
  });

  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>{t('firstName')}</TableCell>
        <TableCell>{t('lastName')}</TableCell>
        <TableCell>{t('actions')}</TableCell>
      </TableRow>
    </TableHead>
  );
};

const ExaminerContactRequestListingRow = ({
  contactRequest,
}: {
  contactRequest: ContactRequest;
}) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerContactRequest',
  });
  const params = useParams();
  const oid = params.oid || '';

  return (
    <TableRow>
      <TableCell>
        <Text>{contactRequest.firstName}</Text>
      </TableCell>
      <TableCell>
        <Text>{contactRequest.lastName}</Text>
      </TableCell>
      <TableCell>
        <CustomButtonLink
          sx={{ padding: 0 }}
          variant={Variant.Text}
          color={Color.Secondary}
          endIcon={<ChevronRightIcon />}
          to={AppRoutes.ExaminerEnrollmentContactRequestPage.replace(
            ':oid',
            oid,
          ).replace(
            /:enrollmentContactRequestId/,
            contactRequest.id.toString(),
          )}
        >
          {t('viewDetails')}
        </CustomButtonLink>
      </TableCell>
    </TableRow>
  );
};

const getRowDetails = (contactRequest: ContactRequest) => {
  return <ExaminerContactRequestListingRow contactRequest={contactRequest} />;
};

const ExaminerContactRequestsTable = ({
  contactRequests,
}: {
  contactRequests: Array<ContactRequest>;
}) => {
  return (
    <CustomTable
      className="table-layout-auto"
      data={contactRequests}
      getRowDetails={getRowDetails}
      header={<ExaminerExamEventListingHeader />}
    />
  );
};

export const ExaminerContactRequestListing = () => {
  const { examiner } = useAppSelector(examinerDetailsSelector);

  return (
    examiner?.contactRequests &&
    examiner?.contactRequests?.length > 0 && (
      <ExaminerContactRequestsTable
        contactRequests={examiner.contactRequests}
      />
    )
  );
};
