'use strict';
const bootstrap = require('../../bootstrap/bootstrap');
const selectors = require('../util/selectors');

const {
    VIEWPORT,
    CONTINUE_BUTTON,
    UPLOAD_DOCUMENT_PAGE_2_YES_OPTION,
    UPLOAD_DOCUMENT_PAGE_3_UPLOAD_FILE_INPUT,
    UPLOAD_DOCUMENT_PAGE_3_UPLOAD_FILE_DESCRIPTION,
    UPLOAD_DOCUMENT_PAGE_3_UPLOAD_FILE_BUTTON,
    UPLOAD_DOCUMENT_PAGE_4_NO_OPTION,
    EMAIL_INPUT,
    TEST_FILE_PATH,
    getDefaultOption,
    ORGANISATION_INPUT,
} = selectors;

// Use 'England' as the default test location
const testLocationSelector = getDefaultOption('select-location', 0);
// Use No as the default
const testPvAgeSelector = getDefaultOption('pv-under-age', 1);
// Use No as the default option
const testPvUnderAgeAtTimeOfExploitationSelector = getDefaultOption('pv-under-age-at-time-of-exploitation', 1);

const APP_CONTAINER_PORT = process.env.PORT || 8081;
let APP_CONTAINER_HOST;

let browser;
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

describe('Upload File(s)', () => {
    beforeEach(async() => {
        let { browser: testBrowser, page: initialPage, hostIP } = await bootstrap.buildBrowser();

        browser = testBrowser;
        page = initialPage;

        APP_CONTAINER_HOST = hostIP;

        url = `http://${APP_CONTAINER_HOST}:${APP_CONTAINER_PORT}`;

        await page.goto(url);
    });

    afterEach(async() => {
        await page.close();
    });

    after(async() => {
        await browser.close();
    });

    it('upload 1 document', async() => {
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

            // select-location
            await page.waitForSelector(testLocationSelector);
            await page.click(testLocationSelector);
            await clickContinueButton(1);

            // pv-under-age
            await page.waitForSelector(testPvAgeSelector);
            await page.click(testPvAgeSelector);
            await clickContinueButton(1);

            // pv-under-age-at-time-of-exploitation
            await page.waitForSelector(testPvUnderAgeAtTimeOfExploitationSelector);
            await page.click(testPvUnderAgeAtTimeOfExploitationSelector);
            await clickContinueButton(1);

            // Run through the skeleton until we reach the upload page
            await clickContinueButton(20);

            await page.waitForSelector(UPLOAD_DOCUMENT_PAGE_2_YES_OPTION);
            await page.click(UPLOAD_DOCUMENT_PAGE_2_YES_OPTION);
            await page.click(CONTINUE_BUTTON);

            await page.waitForSelector(UPLOAD_DOCUMENT_PAGE_3_UPLOAD_FILE_INPUT);
            const input = await page.$(UPLOAD_DOCUMENT_PAGE_3_UPLOAD_FILE_INPUT);
            await input.uploadFile(TEST_FILE_PATH());

            await page.$eval(UPLOAD_DOCUMENT_PAGE_3_UPLOAD_FILE_DESCRIPTION, (element) => {
                element.value = 'NRM Test File example';
            });
            await page.click(UPLOAD_DOCUMENT_PAGE_3_UPLOAD_FILE_BUTTON);

            await page.waitForSelector(UPLOAD_DOCUMENT_PAGE_4_NO_OPTION);
            await page.click(UPLOAD_DOCUMENT_PAGE_4_NO_OPTION);

            // Run through the skeleton until we reach the end
            await clickContinueButton(4);

        } catch (err) {
            throw new Error(err);
        }
    });
});
