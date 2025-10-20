package fi.oph.yki.audit;

import fi.vm.sade.auditlog.Operation;

public enum YkiOperation implements Operation {
  GET_APPROVAL,
  UPDATE_APPROVAL,
  LIST_APPROVALS,
  SEND_SUPPLEMENT_REQUEST,
}
