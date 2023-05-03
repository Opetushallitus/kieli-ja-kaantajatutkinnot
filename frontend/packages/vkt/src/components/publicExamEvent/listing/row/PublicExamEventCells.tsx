import { Checkbox, TableCell } from '@mui/material';
import { Text } from 'shared/components';
import { Color } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { ExamLevel } from 'enums/app';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { ExamEventUtils } from 'utils/examEvent';

const getOpeningsText = (
  examEvent: PublicExamEvent,
  t: (key: string) => string
) => {
  if (examEvent.hasCongestion) {
    return (
      <>
        <Text>{t('openings.congestion.part1')}</Text>
        <Text>{t('openings.congestion.part2')}</Text>
      </>
    );
  } else if (examEvent.openings <= 0) {
    return <Text>{t('openings.none')}</Text>;
  }

  return <Text>{`${examEvent.openings}`}</Text>;
};

export const PublicExamEventPhoneCells = ({
  examEvent,
  isSelected,
}: {
  examEvent: PublicExamEvent;
  isSelected: boolean;
}) => {
  const { language, date, registrationCloses } = examEvent;

  // I18n
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing',
  });
  const translateCommon = useCommonTranslation();

  const checkboxAriaLabel = isSelected
    ? t('accessibility.checkboxSelectedAriaLabel')
    : t('accessibility.checkboxUnselectedAriaLabel');

  return (
    <>
      <TableCell>
        <div className="columns space-between">
          <div className="rows gapped-xs">
            <div className="rows">
              <b>{t('header.language')}</b>
              <Text>
                {ExamEventUtils.languageAndLevelText(
                  language,
                  ExamLevel.EXCELLENT,
                  translateCommon
                )}
              </Text>
            </div>
            <div className="rows">
              <b>{t('header.examDate')}</b>
              <Text>{DateUtils.formatOptionalDate(date)}</Text>
            </div>
            <div className="rows">
              <b>{t('header.registrationCloses')}</b>
              <Text>{DateUtils.formatOptionalDate(registrationCloses)}</Text>
            </div>
            <div className="rows">
              <b>{t('header.openings')}</b>
              {getOpeningsText(examEvent, t)}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell align="right">
        <Checkbox
          className="public-exam-event-listing__checkbox"
          checked={isSelected}
          color={Color.Secondary}
          inputProps={{
            'aria-label': checkboxAriaLabel,
          }}
        />
      </TableCell>
    </>
  );
};

export const PublicExamEventDesktopCells = ({
  examEvent,
  isSelected,
}: {
  examEvent: PublicExamEvent;
  isSelected: boolean;
}) => {
  // I18n
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing',
  });
  const translateCommon = useCommonTranslation();

  const checkboxAriaLabel = isSelected
    ? t('accessibility.checkboxSelectedAriaLabel')
    : t('accessibility.checkboxUnselectedAriaLabel');

  return (
    <>
      <TableCell padding="checkbox">
        <Checkbox
          className="public-exam-event-listing__checkbox"
          checked={isSelected}
          color={Color.Secondary}
          inputProps={{
            'aria-label': checkboxAriaLabel,
          }}
        />
      </TableCell>
      <TableCell>
        <Text>
          {ExamEventUtils.languageAndLevelText(
            examEvent.language,
            ExamLevel.EXCELLENT,
            translateCommon
          )}
        </Text>
      </TableCell>
      <TableCell>
        <Text>{DateUtils.formatOptionalDate(examEvent.date)}</Text>
      </TableCell>
      <TableCell>
        <Text>
          {DateUtils.formatOptionalDate(examEvent.registrationCloses)}
        </Text>
      </TableCell>
      <TableCell>{getOpeningsText(examEvent, t)}</TableCell>
      <TableCell />
    </>
  );
};
