# App

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Hello,
Please open the link 
https://mutualfund-returns.netlify.app/#/funds -  in browser where the app is deployed

Steps to test:

1.)Please provide the valid scheme number and the user will be able to download data once provided

2.)further provide the period of investment and horizon (in how many moth we need to find the returns).

3.)Further click on Generate button to view the details in grid month wise for the given period of selection.

4.)on Generate Table grid will be available which comprises of details of Month,nav,calculations,available nearest date comprises nav details

5.)User will be able to generate data only after providing valid details in scheme,horizon and period of investment.
validations has been included 

6.)If the scheme number entered is not available. The user is informed about the scheme details not available for download and no records in grid

7.)unit test cases have been written for positive and negative scenario

8.)We can find the test case details under coverage folder in app for each spec file (test files)

9.) If the Horizon value(time period) provided is exceeding the available data in excel/Json. The user is prompted with message that details are not available for given

horizon and intimating the user with the least available date to proceed generating details with valid input.

10.)Haven't used moment js for date validation as it is space consuming and wanted to customize on validations and logics.

Thank you.

