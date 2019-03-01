'use strict';
const bootstrap = require('../../bootstrap/bootstrap');
const selectors = require('../util/selectors');
const pageActions = require('../util/page-actions');
const { clickSelector, navigateTo } = pageActions;

const {
    CONTINUE_BUTTON,
    UPLOAD_DOCUMENT_PAGE_2_NO_OPTION,
    EMAIL_INPUT,
    ORGANISATION_INPUT,
    WHAT_HAPPENED_INPUT,
    LOCATION_ENGLAND_OPTION,
    PV_UNDER_AGE_NO_OPTION,
    PV_UNDER_AGE_AT_TIME_OF_EXPLOITATION_NO_OPTION,
    EXPLOITED_IN_UK_OPTION,
    CURRENT_PV_LOCATION_UK_REGION,
    WHO_EXPLOITED_PV,
    ANY_OTHER_PVS_NO_OPTION,
    PV_HAS_CRIME_REFERENCE_NUMBER_YES_OPTION,
    REFER_CASE_TO_NRM_YES_OPTION,
    DOES_PV_NEED_SUPPORT_NO_OPTION,
    PV_NAME_REQUIRING_SUPPORT_FIRST_NAME,
    PV_NAME_REQUIRING_SUPPORT_LAST_NAME,
} = selectors;

const APP_CONTAINER_PORT = process.env.PORT || 8081;
let APP_CONTAINER_HOST;

let browser;
let page;

describe.only('User path(s)', () => {
    beforeEach(async() => {
        let { browser: testBrowser, page: initialPage, hostIP } = await bootstrap.buildBrowser();

        browser = testBrowser;
        page = initialPage;
        APP_CONTAINER_HOST = hostIP;

        const initialUrl = `http://${APP_CONTAINER_HOST}:${APP_CONTAINER_PORT}`;

        await page.goto(initialUrl);
    });

    after(async() => {
        await browser.close();
    });

    /**
     * Run a sequence of actions to simulate verification of a user
     *
     * @returns {Promise}
     */
    async function verifyUser() {
        // start
        await clickSelector(page, CONTINUE_BUTTON);
        // who-do-you-work-for
        await page.$eval(ORGANISATION_INPUT, (element) => {
            element.value = 'Barnardos';
        });
        await page.$eval(EMAIL_INPUT, (element) => {
            element.value = 'test.user@homeoffice.gov.uk';
        });
        await clickSelector(page, CONTINUE_BUTTON);
        // Bypass user clicking email link - Notify Key will not be set during test runs
        await navigateTo(page, `http://${APP_CONTAINER_HOST}:${APP_CONTAINER_PORT}/nrm/start?token=skip`);
    }

    /**
     * Run a sequence of actions to simulate the completion of the first half
     * of the NRM form
     *
     * page.$eval(param1, param2) has a limitation such that we cannot pass a
     * variable to param2 (function in the second parameter). This is because
     * the function is excuted within the browser and cannot recognise any
     * variables passed to it execept those that exist within the browser.
     *
     * @returns {Promise}
     */
    async function completeNrmFormPart1() {
        // nrm start
        await clickSelector(page, CONTINUE_BUTTON);
        // fr-location
        await clickSelector(page, LOCATION_ENGLAND_OPTION);
        await clickSelector(page, CONTINUE_BUTTON);
        // pv-under-age
        await clickSelector(page, PV_UNDER_AGE_NO_OPTION);
        await clickSelector(page, CONTINUE_BUTTON);
        // pv-under-age-at-time-of-exploitation
        await clickSelector(page, PV_UNDER_AGE_AT_TIME_OF_EXPLOITATION_NO_OPTION);
        await clickSelector(page, CONTINUE_BUTTON);
        // what-happened
        await page.$eval(WHAT_HAPPENED_INPUT, (element) => {
            element.value = 'Test input regarding details of exploitation';
        });
        await clickSelector(page, CONTINUE_BUTTON);
        // where-exploitation-happened
        await clickSelector(page, EXPLOITED_IN_UK_OPTION);
        await clickSelector(page, CONTINUE_BUTTON);
        // current-pv-location
        await page.$eval(CURRENT_PV_LOCATION_UK_REGION, (element) => {
            element.value = 'Rutland';
        });
        await clickSelector(page, CONTINUE_BUTTON);
        // who-exploited-pv
        await page.$eval(WHO_EXPLOITED_PV, (element) => {
            element.value = 'Test details about exploiter(s)';
        });
        await clickSelector(page, CONTINUE_BUTTON);
        // types-of-exploitation
        await clickSelector(page, CONTINUE_BUTTON);
        // any-other-pvs
        await clickSelector(page, ANY_OTHER_PVS_NO_OPTION);
        await clickSelector(page, CONTINUE_BUTTON);
        // reported-to-police
        await clickSelector(page, PV_HAS_CRIME_REFERENCE_NUMBER_YES_OPTION);
        await clickSelector(page, CONTINUE_BUTTON);
        // pv-want-to-submit-nrm
        await clickSelector(page, REFER_CASE_TO_NRM_YES_OPTION);
        await clickSelector(page, CONTINUE_BUTTON);
    }

    /**
     * Run a sequence of actions to simulate the completion of the second half
     * of the NRM form
     *
     * page.$eval(param1, param2) has a limitation such that we cannot pass a
     * variable to param2 (function in the second parameter). This is because
     * the function is excuted within the browser and cannot recognise any
     * variables passed to it execept those that exist within the browser.
     *
     */
    async function completeNrmFormPart2() {
        // does-pv-need-support
        await clickSelector(page, DOES_PV_NEED_SUPPORT_NO_OPTION);
        await clickSelector(page, CONTINUE_BUTTON);
        // pv-name-that-requires-support
        await page.waitForSelector(PV_NAME_REQUIRING_SUPPORT_FIRST_NAME);
        await page.$eval(PV_NAME_REQUIRING_SUPPORT_FIRST_NAME, (element) => {
            element.value = 'Firstname';
        });
        await page.$eval(PV_NAME_REQUIRING_SUPPORT_LAST_NAME, (element) => {
            element.value = 'Lastname';
        });
        await clickSelector(page, CONTINUE_BUTTON);
        // pv-dob
        await clickSelector(page, CONTINUE_BUTTON);
        // Run through the skeleton until we reach the upload page
        await clickSelector(page, CONTINUE_BUTTON);
        await clickSelector(page, CONTINUE_BUTTON);
        await clickSelector(page, CONTINUE_BUTTON);
        await clickSelector(page, CONTINUE_BUTTON);
        await clickSelector(page, CONTINUE_BUTTON);
        await clickSelector(page, CONTINUE_BUTTON);
        await clickSelector(page, CONTINUE_BUTTON);
        await clickSelector(page, CONTINUE_BUTTON);
        await clickSelector(page, CONTINUE_BUTTON);
        // supporting-documents-add
        await clickSelector(page, UPLOAD_DOCUMENT_PAGE_2_NO_OPTION);
        await clickSelector(page, CONTINUE_BUTTON);
        // Run through the skeleton until we reach the end
        await clickSelector(page, CONTINUE_BUTTON);
        await clickSelector(page, CONTINUE_BUTTON);
        await clickSelector(page, CONTINUE_BUTTON);
    }

    it('Happy path - Adult', async() => {
        try {
            await verifyUser();
            await completeNrmFormPart1();
            await completeNrmFormPart2();
        } catch (err) {
            throw new Error(err);
        }
    });
});
