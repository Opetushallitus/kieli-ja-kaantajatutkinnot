import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { onClerkHomePage } from 'tests/cypress/support/page-objects/clerkHomePage';
import {
  onClerkSendEmailPage,
  TEST_MESSAGE,
  TEST_SUBJECT,
} from 'tests/cypress/support/page-objects/clerkSendEmailPage';
import { onDialog } from 'tests/cypress/support/page-objects/dialog';
import { onToast } from 'tests/cypress/support/page-objects/toast';
import { runWithIntercept } from 'tests/cypress/support/utils/api';

const selectedTranslatorIds = ['1140', '3496', '2318'];

const expectRegistryIsVisible = () => {
  onClerkHomePage.expectTotalTranslatorsCount(10);
};

const fillAndSendMessage = () => {
  onClerkSendEmailPage.writeSubject(TEST_SUBJECT);
  onClerkSendEmailPage.writeMessage(TEST_MESSAGE);
  onClerkSendEmailPage.send();
};

const confirmSend = () => {
  onDialog.expectText('Lähetä sähköposti');
  onDialog.clickButtonByText('Kyllä');
};

beforeEach(() => {
  runWithIntercept(
    APIEndpoints.ClerkTranslator,
    { fixture: 'clerk_translators_10.json' },
    () => cy.openClerkHomePage()
  );
  expectRegistryIsVisible();
  selectedTranslatorIds.forEach((id) =>
    onClerkHomePage.selectTranslatorById(id)
  );
  onClerkHomePage.sendEmail();
});

describe('ClerkSendEmailPage', () => {
  it('should redirect back to ClerkHomePage when the flow is canceled', () => {
    onClerkSendEmailPage.cancel();
    onDialog.expectText('Peruuta sähköpostin lähetys');
    onDialog.clickButtonByText('Kyllä');
    expectRegistryIsVisible();
  });

  it('should display success toast and redirect to ClerkHomePage if email was sent', () => {
    fillAndSendMessage();

    runWithIntercept(
      APIEndpoints.InformalClerkTranslatorEmail,
      { statusCode: 201 },
      confirmSend
    );

    expectRegistryIsVisible();
    onToast.expectText('Sähköpostisi lähetettiin kääntäjille');
  });

  it('should display an error toast if there was an error when sending the email', () => {
    fillAndSendMessage();

    runWithIntercept(
      APIEndpoints.InformalClerkTranslatorEmail,
      { statusCode: 400 },
      confirmSend
    );

    onToast.expectText('Sähköpostin lähetys ei onnistunut');
  });

  it('should not allow sending email if subject or message are missing', () => {
    onClerkSendEmailPage.expectSendDisabled();
    onClerkSendEmailPage.writeSubject(TEST_SUBJECT);
    onClerkSendEmailPage.expectSendDisabled();

    onClerkSendEmailPage.writeMessage(TEST_MESSAGE);
    onClerkSendEmailPage.expectSendEnabled();
  });

  it('should not allow sending email if no translators are selected', () => {
    // Force clearing redux state by renavigating directly with URL to the page
    cy.visit(AppRoutes.ClerkSendEmailPage);
    onClerkSendEmailPage.expectSendDisabled();

    onClerkSendEmailPage.writeSubject(TEST_SUBJECT);
    onClerkSendEmailPage.expectSendDisabled();

    onClerkSendEmailPage.writeMessage(TEST_MESSAGE);
    onClerkSendEmailPage.expectSendDisabled();
  });
});
