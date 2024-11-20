import { Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { I18nNamespace } from 'shared/enums';

import { BoldedTranslationString } from 'components/common/BoldedTranslationString';
import { VktI18nNamespace } from 'configs/i18n';

export const BulletList = ({
  points,
  t,
}: {
  points: Array<string>;
  t: TFunction<I18nNamespace | VktI18nNamespace, string>;
}) => {
  return (
    <Typography className="margin-top-sm" variant="body1" component="ul">
      {points.map((point, i) => (
        <li key={i}>
          <BoldedTranslationString i18nKey={point} t={t} />
        </li>
      ))}
    </Typography>
  );
};
