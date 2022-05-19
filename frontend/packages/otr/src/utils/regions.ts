import { I18nNamespace } from 'shared/enums';

import { translateOutsideComponent } from 'configs/i18n';

export class RegionUtils {
  static translateRegion(region: string) {
    const t = translateOutsideComponent();

    return t(`otr.koodisto.regions.${region}`, {
      ns: I18nNamespace.KoodistoRegions,
    });
  }

  static translateAndConcatRegions(regions: Array<string>) {
    const t = translateOutsideComponent();

    if (regions.length > 0) {
      const translatedRegions = regions.map((r) =>
        RegionUtils.translateRegion(r)
      );

      return translatedRegions.join(', ');
    }

    return t('otr.common.allRegions', {
      ns: I18nNamespace.Common,
    });
  }
}
