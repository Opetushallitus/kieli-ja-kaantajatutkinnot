import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TableCell, TableHead, TableRow } from '@mui/material';
import { CustomButtonLink, CustomTable, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ContactRequest } from 'interfaces/examinerDetails';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';

const ExaminerExamEventListingHeader = () => {
  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>Etunimi</TableCell>
        <TableCell>Sukunimi</TableCell>
        <TableCell>Toiminnot</TableCell>
      </TableRow>
    </TableHead>
  );
};

const ExaminerContactRequestListingRow = ({
  contactRequest,
}: {
  contactRequest: ContactRequest;
}) => {
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
          to={AppRoutes.ClerkEnrollmentContactRequestPage.replace(
            /:enrollmentContactRequestId/,
            contactRequest.id.toString(),
          )}
        >
          Katso tiedot
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
