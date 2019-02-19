'use strict';
const bootstrap = require('../../bootstrap/bootstrap');
const selectors = require('../util/selectors');

const {
    VIEWPORT,
    CONTINUE_BUTTON,
    UPLOAD_DOCUMENT_PAGE_2_NO_OPTION,
    EMAIL_INPUT,
    ORGANISATION_INPUT,
    WHAT_HAPPENED_INPUT,
    LOCATION_ENGLAND_OPTION,
    PV_UNDER_AGE_NO_OPTION,
    PV_UNDER_AGE_AT_TIME_OF_EXPLOITATION_NO_OPTION,
} = selectors;

const APP_CONTAINER_PORT = process.env.PORT || 8081;
let APP_CONTAINER_HOST;

let page;
let url;

/**
 * Select the continue button a number of times specified within the
 * supplied parameters
 *
 * @param {number} loopCount - the number of time the loop should run
 *
 * @returns {void}
 */
const clickContinueButton = async(loopCount) => {
    for (let i = 0; i < loopCount; i++) {
            await page.waitForSelector(CONTINUE_BUTTON);
            await page.click(CONTINUE_BUTTON);
    }
};

describe('Critical user path(s)', () => {
    beforeEach(async() => {
        let { page: initialPage, hostIP } = await bootstrap.buildBrowser();

        page = initialPage;
        APP_CONTAINER_HOST = hostIP;

        url = `http://${APP_CONTAINER_HOST}:${APP_CONTAINER_PORT}`;

        await page.goto(url);
    });

    it('Happy path - Adult', async() => {
        try {
            // start
            await clickContinueButton(1);

            // who-do-you-work-for
            await page.waitForSelector(ORGANISATION_INPUT);
            await page.$eval(ORGANISATION_INPUT, (element) => {
                element.value = 'Barnardos';
            });
            await page.$eval(EMAIL_INPUT, (element) => {
                element.value = 'test.user@homeoffice.gov.uk';
            });
            await clickContinueButton(1);

            // Bypass user clicking email link - Notify Key will not be set during test runs
            url = `http://${APP_CONTAINER_HOST}:${APP_CONTAINER_PORT}/nrm/start?token=skip`;
            await page.goto(url);

            // Hit the url a second time since the first page resolves to an error
            await page.goto(url);
            await page.setViewport(VIEWPORT);

            // Run through the skeleton until we reach the Where are you making this report? page
            await clickContinueButton(1);

            // fr-location
            await page.waitForSelector(LOCATION_ENGLAND_OPTION);
            await page.click(LOCATION_ENGLAND_OPTION);
            await clickContinueButton(1);

            // pv-under-age
            await page.waitForSelector(PV_UNDER_AGE_NO_OPTION);
            await page.click(PV_UNDER_AGE_NO_OPTION);
            await clickContinueButton(1);

            // pv-under-age-at-time-of-exploitation
            await page.waitForSelector(PV_UNDER_AGE_AT_TIME_OF_EXPLOITATION_NO_OPTION);
            await page.click(PV_UNDER_AGE_AT_TIME_OF_EXPLOITATION_NO_OPTION);
            await clickContinueButton(1);

            // what-happened
            await page.waitForSelector(WHAT_HAPPENED_INPUT);
            await page.$eval(WHAT_HAPPENED_INPUT, (element) => {
                element.value = 'Test input regarding details of exploitation';
            });
            await clickContinueButton(1);

            // Run through the skeleton until we reach the upload page
            await clickContinueButton(19);

            await page.waitForSelector(UPLOAD_DOCUMENT_PAGE_2_NO_OPTION);
            await page.click(UPLOAD_DOCUMENT_PAGE_2_NO_OPTION);

            // Run through the skeleton until we reach the end
            await clickContinueButton(4);

        } catch (err) {
            throw new Error(err);
        }
    });
});