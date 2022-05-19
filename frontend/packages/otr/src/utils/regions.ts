import { I18nNamespace } from 'shared/enums';
import { ComboBoxOption } from 'shared/interfaces';

import { translateOutsideComponent } from 'configs/i18n';

export class RegionUtils {
  static translateRegion(region: string) {
    const t = translateOutsideComponent();

    return t(`otr.koodisto.regions.${region}`, {
      ns: I18nNamespace.KoodistoRegions,
    });
  }

  static createRegionAutocompleteValues(regions: Array<string>) {
    const regionValues = regions.map(
      (r) =>
        ({
          value: r,
          label: RegionUtils.translateRegion(r),
        } as ComboBoxOption)
    );

    return regionValues.sort(RegionUtils.sortAutocompleteOption);
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

  private static sortAutocompleteOption(a: ComboBoxOption, b: ComboBoxOption) {
    return a.label > b.label ? 1 : -1;
  }
}
