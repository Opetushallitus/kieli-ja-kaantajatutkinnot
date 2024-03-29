import { I18nNamespace } from 'shared/enums';
import { ComboBoxOption } from 'shared/interfaces';

import { translateOutsideComponent } from 'configs/i18n';

export class RegionUtils {
  static translateRegions(regions: Array<string>) {
    if (regions.length > 0) {
      return regions.map((r) => RegionUtils.translateRegion(r));
    }

    const t = translateOutsideComponent();

    return [
      t('otr.common.allRegions', {
        ns: I18nNamespace.Common,
      }),
    ];
  }

  static translateRegion(region: string) {
    const t = translateOutsideComponent();

    return t(`otr.koodisto.regions.${region}`, {
      ns: I18nNamespace.KoodistoRegions,
    });
  }

  static getRegionAutocompleteValues(regions: Array<string>) {
    const regionValues = regions.map(
      (r) =>
        ({
          value: r,
          label: RegionUtils.translateRegion(r),
        }) as ComboBoxOption,
    );

    return regionValues.sort(RegionUtils.compareOptionsByLabel);
  }

  private static compareOptionsByLabel(a: ComboBoxOption, b: ComboBoxOption) {
    return a.label > b.label ? 1 : -1;
  }
}
