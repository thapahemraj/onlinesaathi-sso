const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { imeSwaggerProxy } = require('../controllers/imeSwaggerController');

const router = express.Router();

router.use(protect);

const imeSwaggerEndpoints = [
    ['post', '/AmendTransaction'],
    ['get', '/BalanceInquiry'],
    ['post', '/CSPDocumentUpload'],
    ['get', '/GetAccountType'],
    ['get', '/Countries'],
    ['get', '/States/:CountryId'],
    ['get', '/Districts/:StateId'],
    ['get', '/Genders'],
    ['get', '/MaritalStatus'],
    ['get', '/Occupation'],
    ['get', '/PurposeOfRemittance'],
    ['get', '/TransactionCancelReason'],
    ['get', '/GetIdTypes'],
    ['get', '/GetIdentityTypes'],
    ['get', '/BankList/:CountryId'],
    ['get', '/BankBranchList/:BankId'],
    ['get', '/CSPRegistrationTypeList'],
    ['get', '/CSPAddressProofTypeList'],
    ['get', '/CSPOwnerAddressProofTypeList'],
    ['get', '/CSPBusinessTypeList'],
    ['get', '/CSPDocumentTypeList'],
    ['get', '/OwnerCategoryTypes'],
    ['get', '/EducationalQualificationList'],
    ['get', '/Municipalities/:DistrictId'],
    ['get', '/RelationshipList'],
    ['get', '/IDPlaceofIssue'],
    ['get', '/SourceOfFundList'],
    ['post', '/CSPRegistration'],
    ['post', '/CancelTransaction'],
    ['get', '/CheckCSP'],
    ['get', '/CheckCustomer/:mobileNo'],
    ['post', '/ConfirmCustomerRegistration'],
    ['post', '/ConfirmSendTransaction'],
    ['post', '/CustomerMobileAmendment'],
    ['post', '/CustomerRegistration'],
    ['post', '/GetCalculation'],
    ['post', '/SendOTP'],
    ['post', '/SendTransaction'],
    ['post', '/TransactionInquiry'],
    ['post', '/TransactionInquiryDefault'],
];

imeSwaggerEndpoints.forEach(([method, path]) => {
    router[method](path, imeSwaggerProxy);
});

module.exports = router;
module.exports.imeSwaggerEndpoints = imeSwaggerEndpoints;
