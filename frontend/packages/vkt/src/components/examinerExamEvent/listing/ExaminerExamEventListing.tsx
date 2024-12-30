import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Divider,
  SelectChangeEvent,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { CustomButtonLink, CustomTable, H2, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { LanguageFilter } from 'components/common/LanguageFilter';
import { ExaminerExamEventToggleFilters } from 'components/examinerExamEvent/listing/ExaminerExamEventToggleFilters';
import {
  useCommonTranslation,
  useExaminerTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  AppRoutes,
  EnrollmentAppointmentStatus,
  ExamLanguage,
} from 'enums/app';
import { ExaminerExamEvent } from 'interfaces/examinerExamEvent';
import { setExaminerExamEventLanguageFilter } from 'redux/reducers/examinerDetails';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';
import { selectFilteredExaminerExamEvents } from 'redux/selectors/examinerListExamEvent';

const ExaminerExamEventListingHeader = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventListing.table.header',
  });

  // TODO Sorting per table column

  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>{t('language')}</TableCell>
        <TableCell>{t('examDate')}</TableCell>
        <TableCell>{t('location')}</TableCell>
        <TableCell>{t('participants')}</TableCell>
        <TableCell>{t('isPublic')}</TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

const ExaminerExamEventListingRow = ({
  examEvent,
}: {
  examEvent: ExaminerExamEvent;
}) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventListing.table',
  });
  const translateCommon = useCommonTranslation();
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const {
    language,
    date,
    municipality,
    maxParticipants,
    enrollments,
    isHidden,
    id,
  } = examEvent;
  const { examiner } = useAppSelector(examinerDetailsSelector);

  // TODO Clarify which enrollments should be counted here
  const participantsCount = enrollments.filter(
    (e) => e.status === EnrollmentAppointmentStatus.COMPLETED,
  ).length;

  return (
    <TableRow>
      <TableCell>
        <Text>{translateCommon(`examLanguage.${language}`)}</Text>
      </TableCell>
      <TableCell>
        <Text>{DateUtils.formatOptionalDate(date)}</Text>
      </TableCell>
      <TableCell>
        <Text>{translateMunicipality(municipality.code)}</Text>
      </TableCell>
      <TableCell>
        <Text>
          {maxParticipants
            ? `${participantsCount}/${maxParticipants}`
            : `${participantsCount}`}
        </Text>
      </TableCell>
      <TableCell>
        <Text>{translateCommon(isHidden ? 'no' : 'yes')}</Text>
      </TableCell>
      <TableCell>
        <CustomButtonLink
          sx={{ padding: 0 }}
          variant={Variant.Text}
          color={Color.Secondary}
          endIcon={<ChevronRightIcon />}
          to={AppRoutes.ExaminerExamEventPage.replace(
            /:oid/,
            examiner?.oid || '',
          ).replace(/:examEventId/, `${id}`)}
        >
          {t('actions.more')}
        </CustomButtonLink>
      </TableCell>
    </TableRow>
  );
};

const getRowDetails = (examEvent: ExaminerExamEvent) => {
  return <ExaminerExamEventListingRow examEvent={examEvent} />;
};

const ExaminerExamEventsTable = () => {
  const filteredExamEvents = useAppSelector(selectFilteredExaminerExamEvents);

  return (
    <CustomTable
      className="table-layout-auto"
      data={filteredExamEvents}
      getRowDetails={getRowDetails}
      header={<ExaminerExamEventListingHeader />}
    />
  );
};

export const ExaminerExamEventListing = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventListing',
  });

  const filteredExamEvents = useAppSelector(selectFilteredExaminerExamEvents);
  const { examiner, examEventFilters } = useAppSelector(
    examinerDetailsSelector,
  );
  const dispatch = useAppDispatch();

  const handleLanguageFilterChange = (event: SelectChangeEvent) => {
    dispatch(
      setExaminerExamEventLanguageFilter(event.target.value as ExamLanguage),
    );
  };
  const allExamEvents = examiner?.examEvents || [];

  return (
    <div className="examiner-homepage__exam-events rows gapped-xl margin-top-sm margin-bottom-lg">
      <div className="columns">
        <H2 className="grow">{t('heading')}</H2>
        <div className="flex-end">
          <CustomButtonLink
            data-testid="clerk-exam-events__create-exam-event-btn"
            startIcon={<AddIcon />}
            color={Color.Secondary}
            variant={Variant.Contained}
            to={AppRoutes.ExaminerExamEventCreatePage.replace(
              /:oid/,
              examiner?.oid || '',
            )}
          >
            {t('actions.createExamEvent')}
          </CustomButtonLink>{' '}
        </div>
      </div>
      <Divider />
      <ExaminerExamEventToggleFilters />
      {allExamEvents.length > 0 && (
        <LanguageFilter
          value={examEventFilters.languageFilter}
          onChange={handleLanguageFilterChange}
        />
      )}
      {filteredExamEvents.length === 0 && (
        <Text className="empty-results">{t('labels.noExamEvents')}</Text>
      )}
      {filteredExamEvents.length > 0 && <ExaminerExamEventsTable />}
    </div>
  );
};
