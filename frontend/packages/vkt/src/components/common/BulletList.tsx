import { Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { I18nNamespace } from 'shared/enums';

import { BoldedTranslationString } from 'components/common/BoldedTranslationString';
import { VktI18nNamespace } from 'configs/i18n';

const renderBulletPoint = (
  t: TFunction<I18nNamespace | VktI18nNamespace>,
  key: string,
) => <BoldedTranslationString i18nKey={key} t={t} />;

export const BulletList = ({
  points,
  t,
  renderListItem = renderBulletPoint,
}: {
  points: Array<string>;
  t: TFunction<I18nNamespace | VktI18nNamespace, string>;
  renderListItem?: (
    t: TFunction<I18nNamespace | VktI18nNamespace>,
    key: string,
  ) => JSX.Element;
}) => {
  return (
    <Typography className="margin-top-sm" variant="body1" component="ul">
      {points.map((point, i) => (
        <li key={i}>{renderListItem(t, point)}</li>
      ))}
    </Typography>
  );
};
