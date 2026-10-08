import LaptopIcon from '@mui/icons-material/Laptop';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import { Text } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { ExamSessionUtils } from 'utils/examSession';

export const ExamSessionFormat = ({
  examSessionId,
  showDescription = false,
}: {
  examSessionId: number;
  showDescription?: boolean;
}) => {
  // TODO OPHKIOS-383: replace Finnish copy in SV/EN resources when translations arrive.
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.examSessionFormat',
  });
  const isDigital = ExamSessionUtils.isDigitalTest(examSessionId);
  const format = isDigital ? 'digital' : 'paper';
  const Icon = isDigital ? LaptopIcon : NoteAltOutlinedIcon;

  return (
    <div className="exam-session-format">
      <Icon className="exam-session-format__icon" />
      <Text className="exam-session-format__label">{t(`${format}.label`)}</Text>
      {showDescription && ` - ${t(`${format}.description`)}`}
    </div>
  );
};
