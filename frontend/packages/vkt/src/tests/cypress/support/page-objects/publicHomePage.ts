class PublicHomePage {
  elements = {
    toExcellentLevelExams: () =>
      cy.findByRole('button', {
        name: 'Ilmoittaudu erinomaisen taidon tutkintoon',
      }),
    toGoodAndSatisfactoryLevelExam: () =>
      cy.findByRole('button', {
        name: 'Ota yhteyttä tutkinnon vastaanottajiin',
      }),
  };

  continueToExcellentLevelExams() {
    this.elements.toExcellentLevelExams().scrollIntoView();
    this.elements.toExcellentLevelExams().click();
  }

  continueToGoodAndSatisfactoryLevelExams() {
    this.elements.toGoodAndSatisfactoryLevelExam().scrollIntoView();
    this.elements.toGoodAndSatisfactoryLevelExam().click();
  }
}

export const onPublicHomePage = new PublicHomePage();
