import { AreaOfOperation } from 'enums/clerkInterpreter';

export class RegionUtils {
  static getAreaOfOperation = (regions: Array<string> = []) => {
    return regions.length > 0 ? AreaOfOperation.Regions : AreaOfOperation.All;
  };
}
