import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import { AuthorisationBasisEnum } from 'enums/clerkTranslator';
import { Authorisation, AuthorisationResponse } from 'interfaces/authorisation';
import { ClerkNewTranslator } from 'interfaces/clerkNewTranslator';
import { ClerkStateResponse } from 'interfaces/clerkState';
import {
  ClerkTranslator,
  ClerkTranslatorResponse,
  ClerkTranslatorTextFields,
} from 'interfaces/clerkTranslator';
import { ExaminationDateResponse } from 'interfaces/examinationDate';
import { MeetingDateResponse } from 'interfaces/meetingDate';

export class SerializationUtils {
  static deserializeAuthorisation(
    authorisation: AuthorisationResponse
  ): Authorisation {
    const stringToDate = DateUtils.optionalStringToDate;

    const termBeginDate = stringToDate(authorisation.termBeginDate);
    const termEndDate = stringToDate(authorisation.termEndDate);
    const examinationDate = stringToDate(authorisation.examinationDate);
    const diaryNumber = authorisation.diaryNumber || '';

    return {
      ...authorisation,
      termBeginDate,
      termEndDate,
      examinationDate,
      diaryNumber,
    };
  }

  static serializeAuthorisation(authorisation: Authorisation) {
    const {
      id,
      version,
      basis,
      termBeginDate,
      termEndDate,
      examinationDate,
      permissionToPublish,
    } = authorisation;

    const { from, to } = authorisation.languagePair;
    const diaryNumber = authorisation.diaryNumber.trim();

    return {
      id,
      version,
      from,
      to,
      basis,
      termBeginDate: DateUtils.serializeDate(termBeginDate),
      termEndDate: DateUtils.serializeDate(termEndDate),
      permissionToPublish,
      diaryNumber: diaryNumber ? diaryNumber : undefined,
      ...(basis === AuthorisationBasisEnum.AUT && {
        examinationDate: DateUtils.serializeDate(examinationDate),
      }),
    };
  }

  static deserializeMeetingDates(response: Array<MeetingDateResponse>) {
    const meetingDates = response.map(
      SerializationUtils.deserializeMeetingDate
    );

    return { meetingDates };
  }

  static deserializeMeetingDate(meetingDate: MeetingDateResponse) {
    return {
      ...meetingDate,
      date: dayjs(meetingDate.date),
    };
  }

  static deserializeExaminationDate(examinationDate: ExaminationDateResponse) {
    return {
      ...examinationDate,
      date: dayjs(examinationDate.date),
    };
  }

  static deserializeExaminationDates(response: Array<ExaminationDateResponse>) {
    const dates = response.map(SerializationUtils.deserializeExaminationDate);

    return { dates };
  }

  static deserializeClerkTranslators(response: ClerkStateResponse) {
    const { langs } = response;
    const translators = response.translators.map(
      SerializationUtils.deserializeClerkTranslator
    );
    const meetingDates = response.meetingDates.map(
      SerializationUtils.deserializeMeetingDate
    );
    const examinationDates = response.examinationDates.map(
      SerializationUtils.deserializeExaminationDate
    );

    return { translators, langs, meetingDates, examinationDates };
  }

  static deserializeClerkTranslator(
    translator: ClerkTranslatorResponse
  ): ClerkTranslator {
    const { authorisations } = translator;

    const effective = authorisations.effective.map(
      SerializationUtils.deserializeAuthorisation
    );
    const expiring = authorisations.expiring.map(
      SerializationUtils.deserializeAuthorisation
    );
    const expired = authorisations.expired.map(
      SerializationUtils.deserializeAuthorisation
    );
    const expiredDeduplicated = authorisations.expiredDeduplicated.map(
      SerializationUtils.deserializeAuthorisation
    );
    const formerVir = authorisations.formerVir.map(
      SerializationUtils.deserializeAuthorisation
    );

    return {
      ...translator,
      authorisations: {
        effective,
        expiring,
        expired,
        expiredDeduplicated,
        formerVir,
      },
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
