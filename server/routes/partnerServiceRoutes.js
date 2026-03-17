const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { proxyPartnerService } = require('../controllers/partnerServiceProxyController');

const router = express.Router();

const toExpressPath = (swaggerPath) => swaggerPath.replace(/\{([^}]+)\}/g, ':$1');

const register = (method, swaggerPath) => {
    const expressPath = toExpressPath(swaggerPath.replace('/api', ''));
    router[method](expressPath, proxyPartnerService);
};

const partnerServiceEndpoints = [
    // IME
    ['post', '/api/IME/AmendTransaction'],
    ['get', '/api/IME/BalanceInquiry'],
    ['get', '/api/IME/BankBranchList/{BankId}'],
    ['get', '/api/IME/BankList/{CountryId}'],
    ['post', '/api/IME/CancelTransaction'],
    ['get', '/api/IME/CheckCSP'],
    ['get', '/api/IME/CheckCustomer/{mobileNo}'],
    ['post', '/api/IME/ConfirmCustomerRegistration'],
    ['post', '/api/IME/ConfirmSendTransaction'],
    ['get', '/api/IME/Countries'],
    ['get', '/api/IME/CSPAddressProofTypeList'],
    ['get', '/api/IME/CSPBusinessTypeList'],
    ['get', '/api/IME/CSPDocumentTypeList'],
    ['post', '/api/IME/CSPDocumentUpload'],
    ['get', '/api/IME/CSPOwnerAddressProofTypeList'],
    ['post', '/api/IME/CSPRegistration'],
    ['get', '/api/IME/CSPRegistrationTypeList'],
    ['post', '/api/IME/CustomerMobileAmendment'],
    ['post', '/api/IME/CustomerRegistration'],
    ['get', '/api/IME/Districts/{StateId}'],
    ['get', '/api/IME/EducationalQualificationList'],
    ['get', '/api/IME/Genders'],
    ['get', '/api/IME/GetAccountType'],
    ['post', '/api/IME/GetCalculation'],
    ['get', '/api/IME/GetIdentityTypes'],
    ['get', '/api/IME/GetIdTypes'],
    ['get', '/api/IME/IDPlaceofIssue'],
    ['get', '/api/IME/MaritalStatus'],
    ['get', '/api/IME/Municipalities/{DistrictId}'],
    ['get', '/api/IME/Occupation'],
    ['get', '/api/IME/OwnerCategoryTypes'],
    ['get', '/api/IME/PurposeOfRemittance'],
    ['get', '/api/IME/RelationshipList'],
    ['post', '/api/IME/SendOTP'],
    ['post', '/api/IME/SendTransaction'],
    ['get', '/api/IME/SourceOfFundList'],
    ['get', '/api/IME/States/{CountryId}'],
    ['get', '/api/IME/TransactionCancelReason'],
    ['post', '/api/IME/TransactionInquiry'],
    ['post', '/api/IME/TransactionInquiryDefault'],

    // Prabhu
    ['post', '/api/Prabhu/AcPayBankBranchList'],
    ['post', '/api/Prabhu/CancelTransaction'],
    ['post', '/api/Prabhu/CashPayLocationList'],
    ['post', '/api/Prabhu/ComplianceTransactions'],
    ['post', '/api/Prabhu/CreateCustomer'],
    ['post', '/api/Prabhu/CreateReceiver'],
    ['get', '/api/Prabhu/GetCustomerByIdNumber/{customer_IdNo}'],
    ['get', '/api/Prabhu/GetCustomerByMobile/{customer_Mobile}'],
    ['post', '/api/Prabhu/GetImePrabhuReport'],
    ['post', '/api/Prabhu/GetServiceCharge'],
    ['get', '/api/Prabhu/GetServiceChargeByCollection'],
    ['get', '/api/Prabhu/GetStateDistrict/{country}'],
    ['get', '/api/Prabhu/GetStaticData/{type}'],
    ['post', '/api/Prabhu/GetToken'],
    ['post', '/api/Prabhu/InitiateKYC'],
    ['post', '/api/Prabhu/SearchTransaction'],
    ['post', '/api/Prabhu/SendOTP'],
    ['post', '/api/Prabhu/SendTransaction'],
    ['post', '/api/Prabhu/ValidateBankAccount'],
    ['post', '/api/Prabhu/VerifyTransaction/{pinNo}'],

    // Remittance (IME/Prabhu related + shared endpoints from swagger)
    ['post', '/api/Remittance/Agent_Consent_Status'],
    ['post', '/api/Remittance/BioKYCRequery'],
    ['put', '/api/Remittance/CancelImeTransaction'],
    ['put', '/api/Remittance/ChangeAgentStatus'],
    ['get', '/api/Remittance/CheckCSPStatus'],
    ['post', '/api/Remittance/CheckCustomer'],
    ['post', '/api/Remittance/CheckPrabhuCustomer'],
    ['post', '/api/Remittance/ConfirmCustomerRegistration'],
    ['post', '/api/Remittance/ConfirmIMESendTransaction'],
    ['post', '/api/Remittance/ConfirmPrabhuTransaction'],
    ['post', '/api/Remittance/CreateCSP'],
    ['post', '/api/Remittance/CreateCustomerAsync'],
    ['post', '/api/Remittance/CSP_Mapping'],
    ['post', '/api/Remittance/CSP_Onboarding_API'],
    ['post', '/api/Remittance/CustomerE_KYA_Enrollment_API'],
    ['post', '/api/Remittance/CustomerE_KYA_InitiateAPI'],
    ['post', '/api/Remittance/CustomerE_KYA_Unique_Ref_Status'],
    ['get', '/api/Remittance/DownloadImePrabhuReciept'],
    ['post', '/api/Remittance/E_KYA_Enrollment_API'],
    ['post', '/api/Remittance/E_KYA_InitiateAPI'],
    ['post', '/api/Remittance/E_KYA_Unique_Ref_Status'],
    ['post', '/api/Remittance/GetAllAgentsList'],
    ['post', '/api/Remittance/GetCSPList'],
    ['post', '/api/Remittance/GetCustomerDetailsList'],
    ['post', '/api/Remittance/GetPrabhuCustomerList'],
    ['get', '/api/Remittance/GetRecieversListMobileNo'],
    ['get', '/api/Remittance/GetStateDistrict'],
    ['get', '/api/Remittance/GetStaticData'],
    ['get', '/api/Remittance/GetTransactionByPinNo'],
    ['get', '/api/Remittance/GetTransactions'],
    ['get', '/api/Remittance/GetUsersBySearchTerm'],
    ['get', '/api/Remittance/ime/{userId}'],
    ['post', '/api/Remittance/ImeAgentOnboard'],
    ['post', '/api/Remittance/IMEReportComparision'],
    ['put', '/api/Remittance/ModifyImeTransaction'],
    ['get', '/api/Remittance/prabhu/{userId}'],
    ['post', '/api/Remittance/PrabhuCancelTransaction'],
    ['post', '/api/Remittance/PrabhuCustomerOnboarding'],
    ['get', '/api/Remittance/RefundTransaction'],
    ['post', '/api/Remittance/RegisterCustomer'],
    ['post', '/api/Remittance/SearchCSP'],
    ['post', '/api/Remittance/SendIMETransaction'],
    ['post', '/api/Remittance/SendPrabhuTransaction'],
    ['put', '/api/Remittance/UpdateCheckImeStatus'],
    ['post', '/api/Remittance/UploadAgentDocument'],
];

router.use(protect);
partnerServiceEndpoints.forEach(([method, path]) => register(method, path));

module.exports = router;
module.exports.partnerServiceEndpoints = partnerServiceEndpoints;
