Cypress.Commands.add('login', (role) => {
    cy.fixture('users').then((users) => {
        const user = users[role];
        cy.visit('/login');
        cy.get('input[placeholder="Латинские символы"]').type(user.username);
        cy.get('input[placeholder="*******"]').type(user.password);
        // Ищем кнопку с точным текстом "Войти" и кликаем
        cy.contains('button', 'Войти').click();
        cy.url().should('not.contain', '/login');
    });
});
Cypress.Commands.add('logout', () => {
    cy.get('button[aria-label="Выйти"]').click();
    cy.url().should('contain', '/login');
});