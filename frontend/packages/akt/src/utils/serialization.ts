import { AuthorisationBasisEnum } from 'enums/clerkTranslator';
import { Authorisation, AuthorisationResponse } from 'interfaces/authorisation';
import { ClerkNewTranslator } from 'interfaces/clerkNewTranslator';
import { ClerkStateResponse } from 'interfaces/clerkState';
import {
  ClerkTranslator,
  ClerkTranslatorResponse,
  ClerkTranslatorTextFields,
} from 'interfaces/clerkTranslator';
import { MeetingDateResponse } from 'interfaces/meetingDate';
import { DateUtils } from 'utils/date';

export class SerializationUtils {
  static deserializeAuthorisation(
    authorisation: AuthorisationResponse
  ): Authorisation {
    const stringToDate = DateUtils.optionalStringToDate;

    const termBeginDate = stringToDate(authorisation.termBeginDate);
    const termEndDate = stringToDate(authorisation.termEndDate);
    const examinationDate = stringToDate(authorisation.examinationDate);

    return {
      ...authorisation,
      termBeginDate,
      termEndDate,
      examinationDate,
    };
  }

  static serializeAuthorisation(authorisation: Authorisation) {
    const { from, to } = authorisation.languagePair;
    const {
      basis,
      termBeginDate,
      termEndDate,
      examinationDate,
      permissionToPublish,
      diaryNumber,
    } = authorisation;

    return {
      from,
      to,
      basis,
      termBeginDate: DateUtils.serializeDate(termBeginDate),
      termEndDate: DateUtils.serializeDate(termEndDate),
      permissionToPublish,
      diaryNumber: diaryNumber ? diaryNumber.trim() : undefined,
      ...(basis === AuthorisationBasisEnum.AUT && {
        examinationDate: DateUtils.serializeDate(examinationDate),
      }),
    };
  }

  static deserializeMeetingDates(response: MeetingDateResponse[]) {
    const meetingDates = response.map(
      SerializationUtils.deserializeMeetingDate
    );

    return { meetingDates };
  }

  static deserializeMeetingDate(meetingDate: MeetingDateResponse) {
    const dayjs = DateUtils.dayjs();

    return {
      ...meetingDate,
      date: dayjs(meetingDate.date),
    };
  }

  static deserializeClerkTranslators(response: ClerkStateResponse) {
    const { langs } = response;
    const translators = response.translators.map(
      SerializationUtils.deserializeClerkTranslator
    );
    const meetingDates = response.meetingDates.map(
      SerializationUtils.deserializeMeetingDate
    );

    return { translators, langs, meetingDates };
  }

  static deserializeClerkTranslator(
    translator: ClerkTranslatorResponse
  ): ClerkTranslator {
    return {
      ...translator,
      authorisations: translator.authorisations.map(
        SerializationUtils.deserializeAuthorisation
      ),
    };
  }

  static serializeClerkNewTranslator(translator: ClerkNewTranslator) {
    const { isAssuranceGiven, authorisations, ...rest } = translator;
    const textFields =
      SerializationUtils.getNonBlankClerkTranslatorTextFields(rest);

    return {
      ...textFields,
      isAssuranceGiven,
      authorisations: authorisations.map(
        SerializationUtils.serializeAuthorisation
      ),
    };
  }

  static serializeClerkTranslator(translator: ClerkTranslator) {
    const {
      id,
      version,
      isAssuranceGiven,
      authorisations: _ignored,
      ...rest
    } = translator;
    const textFields =
      SerializationUtils.getNonBlankClerkTranslatorTextFields(rest);

    return {
      ...textFields,
      id,
      version,
      isAssuranceGiven,
    };
  }

  private static getNonBlankClerkTranslatorTextFields(
    textFields: ClerkTranslatorTextFields
  ) {
    Object.keys(textFields).forEach((key) => {
      const field = key as keyof ClerkTranslatorTextFields;

      if (textFields[field]) {
        textFields[field] = (textFields[field] as string).trim();
      }
      if (!textFields[field]) {
        delete textFields[field];
      }
    });

    return textFields;
  }
}
