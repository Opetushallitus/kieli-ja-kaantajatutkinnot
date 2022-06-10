import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import {
  ClerkInterpreter,
  ClerkInterpreterResponse,
  ClerkInterpreterTextFields,
} from 'interfaces/clerkInterpreter';
import { Qualification, QualificationResponse } from 'interfaces/qualification';

export class SerializationUtils {
  static deserializeClerkInterpreter(
    response: ClerkInterpreterResponse
  ): ClerkInterpreter {
    const qualifications = response.qualifications.map(
      SerializationUtils.deserializeQualification
    );

    return { ...response, qualifications };
  }

  static serializeClerkInterpreter(interpreter: ClerkInterpreter) {
    const {
      id,
      version,
      deleted,
      isIndividualised,
      permissionToPublishEmail,
      permissionToPublishPhone,
      permissionToPublishOtherContactInfo,
      regions,
      qualifications: _ignored,
      ...rest
    } = interpreter;
    const textFields =
      SerializationUtils.getNonBlankClerkInterpreterTextFields(rest);

    return {
      ...textFields,
      id,
      version,
      deleted,
      isIndividualised,
      permissionToPublishEmail,
      permissionToPublishPhone,
      permissionToPublishOtherContactInfo,
      regions,
    };
  }

  static serializeQualification(qualification: Qualification) {
    const { fromLang, toLang } = qualification;
    const {
      beginDate,
      endDate,
      examinationType,
      permissionToPublish,
      diaryNumber,
    } = qualification;

    return {
      fromLang,
      toLang,
      examinationType,
      beginDate: DateUtils.serializeDate(beginDate),
      endDate: DateUtils.serializeDate(endDate),
      permissionToPublish,
      diaryNumber: diaryNumber ? diaryNumber.trim() : undefined,
    };
  }

  static deserializeQualification(
    qualification: QualificationResponse
  ): Qualification {
    const beginDate = dayjs(qualification.beginDate);
    const endDate = dayjs(qualification.endDate);

    return { ...qualification, beginDate, endDate };
  }

  private static getNonBlankClerkInterpreterTextFields(
    textFields: ClerkInterpreterTextFields
  ) {
    Object.keys(textFields).forEach((key) => {
      const field = key as keyof ClerkInterpreterTextFields;

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
