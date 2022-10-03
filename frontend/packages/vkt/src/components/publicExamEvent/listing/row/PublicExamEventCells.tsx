import { Checkbox, TableCell } from '@mui/material';
import { Dayjs } from 'dayjs';
import { H2, Text } from 'shared/components';
import { Color } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { ExamLanguage } from 'enums/app';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

// TODO: not implemented
export const PublicExamEventPhoneCells = ({
  examEvent,
}: {
  examEvent: PublicExamEvent;
}) => {
  const { language, date, registrationCloses, participants, maxParticipants } =
    examEvent;

  return (
    <TableCell>
      <div className="columns space-between">
        <div className="rows gapped">
          <H2>{language}</H2>
          <H2>{DateUtils.formatOptionalDate(date)}</H2>
          <H2>{DateUtils.formatOptionalDate(registrationCloses)}</H2>
          <H2>{participants}</H2>
          <H2>{maxParticipants}</H2>
        </div>
      </div>
    </TableCell>
  );
};

export const PublicExamEventDesktopCells = ({
  examEvent,
  isSelected,
}: {
  examEvent: PublicExamEvent;
  isSelected: boolean;
}) => {
  const { language, date, registrationCloses, participants, maxParticipants } =
    examEvent;

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing',
  });
  const translateCommon = useCommonTranslation();

  const checkboxAriaLabel = isSelected
    ? t('accessibility.checkboxSelectedAriaLabel')
    : t('accessibility.checkboxUnselectedAriaLabel');

  const getLanguageAndLevelText = (language: ExamLanguage) => {
    const langTranslation = translateCommon(`examLanguage.${language}`);
    const levelTranslation = translateCommon(
      'examLevel.excellent'
    ).toLowerCase();

    return `${langTranslation}, ${levelTranslation}`;
  };

  const getOpeningsText = () => {
    if (examEvent.hasCongestion) {
      return (
        <>
          <Text>{t('openings.congestion.part1')}</Text>
          <Text>{t('openings.congestion.part2')}</Text>
        </>
      );
    } else if (participants >= maxParticipants) {
      return <Text>{t('openings.none')}</Text>;
    }

    return <Text>{`${maxParticipants - participants}`}</Text>;
  };

  const formatDate = (date: Dayjs) => date.format('DD.MM.YYYY');

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
        <Text>{getLanguageAndLevelText(language)}</Text>
      </TableCell>
      <TableCell>
        <Text>{formatDate(date)}</Text>
      </TableCell>
      <TableCell>
        <Text>{formatDate(registrationCloses)}</Text>
      </TableCell>
      <TableCell>{getOpeningsText()}</TableCell>
      <TableCell />
    </>
  );
};
