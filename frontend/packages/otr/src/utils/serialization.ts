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
    interpreter: ClerkInterpreterResponse
  ): ClerkInterpreter {
    const { qualifications } = interpreter;

    const effective = qualifications.effective.map(
      SerializationUtils.deserializeQualification
    );
    const expiring = qualifications.expiring.map(
      SerializationUtils.deserializeQualification
    );
    const expired = qualifications.expired.map(
      SerializationUtils.deserializeQualification
    );
    const expiredDeduplicated = qualifications.expiredDeduplicated.map(
      SerializationUtils.deserializeQualification
    );

    return {
      ...interpreter,
      qualifications: {
        effective,
        expiring,
        expired,
        expiredDeduplicated,
      },
    };
  }

  static serializeClerkNewInterpreter(interpreter: ClerkNewInterpreter) {
    const {
      onrId,
      isIndividualised,
      hasIndividualisedAddress,
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
      hasIndividualisedAddress,
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
      isIndividualised,
      hasIndividualisedAddress,
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
      isIndividualised,
      hasIndividualisedAddress,
      permissionToPublishEmail,
      permissionToPublishPhone,
      permissionToPublishOtherContactInfo,
      regions,
    };
  }

  static serializeQualification(qualification: Qualification) {
    const { beginDate, endDate, tempId: _, ...rest } = qualification;
    const diaryNumber = qualification.diaryNumber.trim();

    return {
      ...rest,
      beginDate: DateUtils.serializeDate(beginDate),
      endDate: DateUtils.serializeDate(endDate),
      diaryNumber: diaryNumber ? diaryNumber : undefined,
    };
  }

  static deserializeQualification(
    qualification: QualificationResponse
  ): Qualification {
    const beginDate = dayjs(qualification.beginDate);
    const endDate = dayjs(qualification.endDate);
    const diaryNumber = qualification.diaryNumber || '';

    return { ...qualification, beginDate, endDate, diaryNumber };
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
