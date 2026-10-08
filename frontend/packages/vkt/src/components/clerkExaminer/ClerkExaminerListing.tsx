import {
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Link } from 'react-router';
import { CustomButtonLink, CustomTable, H2, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { ExaminerExamDatesSummary } from 'components/examiner/ExaminerExamDatesSummary';
import {
  useClerkTranslation,
  useCommonTranslation,
  useExaminerTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, ExamLanguage } from 'enums/app';
import { ExaminerDetails } from 'interfaces/examinerDetails';
import { setClerkListExaminerFilters } from 'redux/reducers/clerkListExaminer';
import {
  clerkListExaminerSelector,
  selectFilteredExaminers,
} from 'redux/selectors/clerkListExaminer';
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

  const examinerUrl = AppRoutes.ExaminerHomePage.replace(
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
          <Text>
            <ExaminerExamDatesSummary examiner={examiner} />
          </Text>
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

const ExaminerFilter = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerFilter',
  });
  const { examLanguage } = useAppSelector(clerkListExaminerSelector).filters
    .examiners;
  const dispatch = useAppDispatch();

  return (
    <FormControl className="margin-top-lg" component="fieldset">
      <FormLabel component="legend" className="heading-label">
        {t('label')}:
      </FormLabel>
      <RadioGroup
        data-testid="examiner-filter"
        name="examiner-filter"
        value={examLanguage}
        onChange={(e) => {
          dispatch(
            setClerkListExaminerFilters({
              examLanguage: e.target.value as ExamLanguage,
            }),
          );
        }}
      >
        <div className="columns margin-left-sm">
          {Object.entries(ExamLanguage).map(([key, language]) => {
            return (
              <FormControlLabel
                key={key}
                value={language}
                checked={examLanguage === language}
                label={t(`options.${key}`)}
                control={<Radio />}
              />
            );
          })}
        </div>
      </RadioGroup>
    </FormControl>
  );
};

export const ClerkExaminerListing = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExaminerListing',
  });

  const examiners = useAppSelector(selectFilteredExaminers);

  return (
    <div className="rows gapped clerk-homepage__extra-padding-top">
      <div className="clerk-homepage__grid-container__heading columns grow">
        <H2>{t('title')}</H2>
      </div>
      <Divider />
      <ExaminerFilter />
      <CustomTable
        className="table-layout-auto"
        data={examiners}
        header={<ClerkExaminerListingHeader />}
        getRowDetails={getRowDetails}
        stickyHeader
      />
    </div>
  );
};
