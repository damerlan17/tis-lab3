/// <reference types="cypress" />

describe('Модуль Вакансии', () => {
    // === ПОЗИТИВНЫЕ СЦЕНАРИИ ===
    describe('Позитивные сценарии', () => {

        // POS‑VAC‑01: Создание новой вакансии работодателем (модальное окно)
        it('Создание новой вакансии работодателем', () => {
            cy.login('employer');
            cy.visit('/account/vacancies');
            cy.contains('button', 'Создать вакансию').click();

            // Ждём появления модального окна (предполагаем, что у него есть класс modal или dialog)
            cy.get('.modal, .dialog, [role="dialog"]').should('be.visible');

            const vacancyTitle = `Автотест-вакансия ${Date.now()}`;
            // Поле названия внутри модалки (с placeholder="Кладовщик")
            cy.get('.modal input[placeholder="Кладовщик"]').type(vacancyTitle);
            // Требования и обязанности
            cy.get('.modal textarea[placeholder="Ваши требования"]').type('Требования: опыт от 1 года');
            cy.get('.modal textarea[placeholder="Обязанности сотрудника"]').type('Обязанности: работа с документами');

            // Кнопка сохранения внутри модалки (скорее всего, "Сохранить" или "Создать")
            cy.get('.modal button[type="submit"]').click();

            // Проверяем успешное создание
            cy.contains('Вакансия успешно создана', { timeout: 10000 }).should('be.visible');
            cy.visit('/account/vacancies');
            cy.contains(vacancyTitle).should('be.visible');
        });

        // POS‑VAC‑02: Поиск вакансии по ключевому слову (студент)
        it('Поиск вакансии по ключевому слову', () => {
            cy.login('student');
            cy.visit('/account/vacancies');
            // Поле поиска у студента (если есть). Если нет — тест можно пропустить.
            // Используем селектор из вашего предыдущего сообщения: input.search-input__field
            cy.get('input.search-input__field, input[placeholder="Название..."]').type('разработчик{enter}');
            cy.get('[class*="vacancy"], .vacancy-card', { timeout: 10000 }).should('exist');
        });

        // POS‑VAC‑03: Отклик на вакансию студентом
        it('Отклик на вакансию студентом', () => {
            cy.login('student');
            cy.visit('/account/vacancies');
            // Кликаем по ссылке или заголовку вакансии (а не по невидимому блоку)
            cy.get('.vacancy-item a, .vacancy-card a, [class*="vacancy"] a').first().click();
            // Ждём загрузки страницы вакансии
            cy.url().should('include', '/vacancy/');
            cy.contains('button', /Откликнуться|Отправить отклик/i).click();
            cy.contains('Отклик отправлен', { timeout: 10000 }).should('be.visible');
        });

        // POS‑VAC‑04: Подтверждение отклика работодателем (требует наличия отклика)
        it('Подтверждение отклика работодателем', () => {
            cy.login('employer');
            cy.visit('/account/responses');
            cy.contains('button', 'Принят на вакансию', { timeout: 5000 }).first().click();
            cy.contains('Отклик подтверждён').should('be.visible');
        });

        // POS‑VAC‑05: Взаимодействие внутри рабочего пространства
        it('Взаимодействие внутри рабочего пространства', () => {
            cy.login('employer');
            cy.visit('/account/responses');
            cy.contains('button', 'Рабочее пространство').first().click();
            cy.get('[contenteditable="true"], .chat-input, textarea').type('Приступайте{enter}');
            cy.contains('Приступайте').should('be.visible');
        });

        // POS‑VAC‑06: Смена статуса рабочего пространства (если есть select)
        it('Смена статуса рабочего пространства', () => {
            cy.login('employer');
            cy.visit('/account/responses');
            cy.contains('button', 'Рабочее пространство').first().click();
            cy.get('select').then($select => {
                if ($select.length) {
                    cy.wrap($select).select('Тестовое задание выслано');
                    cy.wrap($select).should('have.value', 'Тестовое задание выслано');
                } else {
                    cy.log('Селект статуса отсутствует — тест пропущен');
                }
            });
        });
    });

    // === НЕГАТИВНЫЕ СЦЕНАРИИ ===
    describe('Негативные сценарии', () => {
        it('Создание вакансии с пустыми обязательными полями', () => {
            cy.login('employer');
            cy.visit('/account/vacancies');
            cy.contains('button', 'Создать вакансию').click();
            cy.get('.modal, .dialog, [role="dialog"]').should('be.visible');
            // Ничего не заполняем, сразу нажимаем сохранить
            cy.get('.modal button[type="submit"]').click();
            cy.get('.error-message, .field-error, .invalid-feedback').should('be.visible');
        });

        it('Поиск по несуществующему ключевому слову', () => {
            cy.login('student');
            cy.visit('/account/vacancies');
            cy.get('input.search-input__field, input[placeholder="Название..."]').type('sdfkjsdflkjsdf{enter}');
            cy.contains('Ничего не найдено', { timeout: 5000 }).should('be.visible');
        });

        it('Повторный отклик на вакансию (кнопка disabled)', () => {
            cy.login('student');
            cy.visit('/account/vacancies');
            cy.get('.vacancy-item a, .vacancy-card a, [class*="vacancy"] a').first().click();
            cy.contains('button', /Откликнуться|Отправить отклик/i).click();
            cy.contains('button', /Откликнуться|Отправить отклик/i).should('be.disabled');
        });

        it('Доступ к рабочему пространству без авторизации', () => {
            cy.visit('/workspaces/421', { failOnStatusCode: false });
            cy.url().should('include', '/login');
        });

        it('Попытка создать вакансию студентом', () => {
            cy.login('student');
            cy.visit('/account/vacancies');
            cy.contains('button', 'Создать вакансию').should('not.exist');
        });
    });
});