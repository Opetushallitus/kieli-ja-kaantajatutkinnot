import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import {
  ClerkInterpreter,
  ClerkInterpreterResponse,
  ClerkInterpreterTextFields,
} from 'interfaces/clerkInterpreter';
import { ClerkNewInterpreter } from 'interfaces/clerkNewInterpreter';
import { MeetingDateResponse } from 'interfaces/meetingDate';
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

  static serializeClerkNewInterpreter(interpreter: ClerkNewInterpreter) {
    const {
      onrId,
      isIndividualised,
      permissionToPublishEmail,
      permissionToPublishPhone,
      permissionToPublishOtherContactInfo,
      regions,
      qualifications,
      ...rest
    } = interpreter;
    const textFields =
      SerializationUtils.getNonBlankClerkInterpreterTextFields(rest);

    return {
      ...textFields,
      onrId,
      isIndividualised,
      permissionToPublishEmail,
      permissionToPublishPhone,
      permissionToPublishOtherContactInfo,
      regions,
      qualifications: qualifications.map(
        SerializationUtils.serializeQualification
      ),
    };
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
    const { beginDate, endDate, diaryNumber, ...rest } = qualification;

    return {
      beginDate: DateUtils.serializeDate(beginDate),
      endDate: DateUtils.serializeDate(endDate),
      diaryNumber: diaryNumber ? diaryNumber.trim() : undefined,
      ...rest,
    };
  }

  static deserializeQualification(
    qualification: QualificationResponse
  ): Qualification {
    const beginDate = dayjs(qualification.beginDate);
    const endDate = dayjs(qualification.endDate);

    return { ...qualification, beginDate, endDate };
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
