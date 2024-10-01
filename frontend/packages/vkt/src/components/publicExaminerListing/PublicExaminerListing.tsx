import { Paper, TableCell, TableHead, TableRow } from '@mui/material';
import { useState } from 'react';
import { CustomTable, H2, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { LanguageFilter } from 'components/common/LanguageFilter';
import { ExamLanguage } from 'enums/app';
import { PublicExaminer } from 'interfaces/publicExaminer';

const PublicExaminerListingHeader = () => {
  const { isPhone } = useWindowProperties();

  return (
    <TableHead className="heading-text">
      {!isPhone && (
        <TableRow>
          <TableCell>Tutkinnon vastaanottaja</TableCell>
          <TableCell>Kieli</TableCell>
          <TableCell>Paikkakunta</TableCell>
          <TableCell>Tutkintopäivät</TableCell>
          <TableCell>Toiminnot</TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};

const mockExaminerData: Array<PublicExaminer> = [];

const getRowDetails = ({
  name,
  language,
  municipality,
  examDates,
}: PublicExaminer) => {
  // TODO Rendering for mobile users
  return (
    <TableRow>
      <TableCell>
        <Text>{name}</Text>
      </TableCell>
      <TableCell>
        <Text>{language}</Text>
      </TableCell>
      <TableCell>
        <Text>{municipality}</Text>
      </TableCell>
      <TableCell>
        <Text>{examDates.length > 0 ? 'dipdap' : 'Ei määritelty'}</Text>
      </TableCell>
      <TableCell>dsadad</TableCell>
    </TableRow>
  );
};

export const PublicExaminerListing = () => {
  const [languageFilter, setLanguageFilter] = useState(ExamLanguage.ALL);

  return (
    <Paper elevation={3} className="public-examiner-listing">
      <div className="columns">
        <div className="grow">
          <H2>Ota yhteyttä tutkinnon vastaanottajiin</H2>
        </div>
      </div>
      <LanguageFilter
        value={languageFilter}
        onChange={(e) => setLanguageFilter(e.target.value as ExamLanguage)}
      />
      <CustomTable
        className="table-layout-auto"
        data={mockExaminerData}
        getRowDetails={getRowDetails}
        header={<PublicExaminerListingHeader />}
      />
    </Paper>
  );
};
