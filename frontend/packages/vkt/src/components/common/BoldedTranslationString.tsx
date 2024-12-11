import { TFunction } from 'i18next';
import { Trans } from 'react-i18next';
import { I18nNamespace } from 'shared/enums';

export const BoldedTranslationString = ({
  i18nKey,
  t,
}: {
  i18nKey: string;
  t: TFunction<I18nNamespace, string>;
}) => {
  return <Trans i18nKey={i18nKey} t={t} components={[<b key={i18nKey} />]} />;
};
