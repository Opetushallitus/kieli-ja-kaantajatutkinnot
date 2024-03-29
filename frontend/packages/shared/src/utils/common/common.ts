import { TFunction } from 'i18next';

type ScrollBehavior = 'auto' | 'smooth';

export class CommonUtils {
  static scrollToTop(behavior?: ScrollBehavior) {
    const options = {
      top: 0,
      left: 0,
      ...(behavior && { behavior }),
    };
    window.scrollTo(options);
  }

  static createMapFromArray(
    array: Array<string>,
    t: TFunction | undefined = undefined,
    prefix: string | undefined = undefined,
  ) {
    const prfxKey = prefix ? `${prefix}.` : '';

    return new Map(array.map((i) => [t ? `${t(`${prfxKey}${i}`)}` : i, i]));
  }

  static combineClassNames = (classNames: Array<string | undefined>) => {
    const definedClassNames = classNames.filter((className) => className);

    return definedClassNames.join(' ');
  };

  static createUniqueId() {
    const date = new Date().getTime().toString(36);
    const random = Math.random().toString(26).slice(2);

    return `${date}-${random}`;
  }

  static getMaxTextAreaLength = () => 6000;
}
