import { APIAuthorisationTerm } from 'interfaces/authorisation';

export class APIUtils {
  static convertAPIAuthorisationTerm(term?: APIAuthorisationTerm) {
    if (term) {
      const start = new Date(term.beginDate);
      if (term.endDate) {
        return { start, end: new Date(term.endDate) };
      }

      return { start };
    }
  }
}
