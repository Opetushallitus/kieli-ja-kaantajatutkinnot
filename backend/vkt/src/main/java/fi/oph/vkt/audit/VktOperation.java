package fi.oph.vkt.audit;

import fi.vm.sade.auditlog.Operation;

public enum VktOperation implements Operation {
  LIST_EXAM_EVENTS,
  GET_EXAM_EVENT,
  GET_EXAM_EVENT_EXCEL,
  CREATE_EXAM_EVENT,
  UPDATE_EXAM_EVENT,
  UPDATE_ENROLLMENT,
  UPDATE_ENROLLMENT_STATUS,
  UPDATE_ENROLLMENT_PAYMENT_LINK,
  MOVE_ENROLLMENT,
  REFUND_PAYMENT,
}
