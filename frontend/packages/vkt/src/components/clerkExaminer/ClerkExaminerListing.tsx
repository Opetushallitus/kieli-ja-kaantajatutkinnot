import {
  Divider,
  SelectChangeEvent,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { CustomButtonLink, CustomTable, H2, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { LanguageFilter } from 'components/common/LanguageFilter';
import {
  useClerkTranslation,
  useCommonTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, ExamLanguage } from 'enums/app';
import { ExaminerDetails } from 'interfaces/examinerDetails';
import { setExamEventLanguageFilter } from 'redux/reducers/clerkListExamEvent';
import { clerkListExamEventsSelector } from 'redux/selectors/clerkListExamEvent';
import { clerkListExaminerSelector } from 'redux/selectors/clerkListExaminer';
import { ExaminerUtils } from 'utils/examiner';

const ClerkExaminerListingHeader = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExaminerListing.header',
  });

  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>{t('examiner')}</TableCell>
        <TableCell>{t('language')}</TableCell>
        <TableCell>{t('examLocation')}</TableCell>
        <TableCell>{t('examDates')}</TableCell>
        <TableCell>{t('actions')}</TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

const ExaminerListingRow = ({ examiner }: { examiner: ExaminerDetails }) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExaminerListing',
  });
  const translateCommon = useCommonTranslation();
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();

  const examinerUrl = AppRoutes.ExaminerDetailsPage.replace(
    /:oid/,
    `${examiner.oid}`,
  );

  return (
    <>
      <TableRow
        className="clerk-exam-event-listing__row"
        data-testid={`clerk-examiners__id-${examiner.id}-row`}
      >
        <TableCell>
          <Link
            className="clerk-exam-event-listing__row__link"
            to={examinerUrl}
          >
            <Text>{`${examiner.firstName} ${examiner.lastName}`}</Text>
          </Link>
        </TableCell>
        <TableCell>
          <Text>
            {ExaminerUtils.renderExamLanguages(examiner, translateCommon)}
          </Text>
        </TableCell>
        <TableCell>
          <Text>
            {ExaminerUtils.renderExamLocations(examiner, translateMunicipality)}
          </Text>
        </TableCell>
        <TableCell>
          <Text>TODO Ei määritelty?</Text>
        </TableCell>
        <TableCell>
          <CustomButtonLink
            variant={Variant.Outlined}
            color={Color.Secondary}
            to={examinerUrl}
          >
            {t('buttons.viewDetails')}
          </CustomButtonLink>
        </TableCell>
      </TableRow>
    </>
  );
};

const getRowDetails = (examiner: ExaminerDetails) => {
  return <ExaminerListingRow examiner={examiner} />;
};

export const ClerkExaminerListing = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExaminerListing',
  });
  const dispatch = useAppDispatch();

  const { languageFilter } = useAppSelector(clerkListExamEventsSelector);

  const handleLanguageFilterChange = (event: SelectChangeEvent) => {
    dispatch(setExamEventLanguageFilter(event.target.value as ExamLanguage));
  };

  const { examiners } = useAppSelector(clerkListExaminerSelector);

  return (
    <>
      <div className="clerk-homepage__grid-container__heading columns grow">
        <H2>{t('title')}</H2>
      </div>
      <Divider />
      <LanguageFilter
        value={languageFilter}
        onChange={handleLanguageFilterChange}
      />
      <CustomTable
        className="table-layout-auto"
        data={examiners}
        header={<ClerkExaminerListingHeader />}
        getRowDetails={getRowDetails}
        stickyHeader
      />
    </>
  );
};
