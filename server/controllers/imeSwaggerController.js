const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const IME_SOAP_BASE_URL = process.env.IME_SOAP_BASE_URL || 'https://api.imeforex-txn.net/SendWsApi/IMEForexSendService.asmx';
const IME_SOAP_ACTION_NAMESPACE = process.env.IME_SOAP_ACTION_NAMESPACE || 'IME';
const IME_ACCESS_CODE = process.env.IME_ACCESS_CODE || '';
const IME_USERNAME = process.env.IME_USERNAME || '';
const IME_PASSWORD = process.env.IME_PASSWORD || '';
const IME_PARTNER_BRANCH_ID = process.env.IME_PARTNER_BRANCH_ID || '';
const IME_AGENT_SESSION_ID = process.env.IME_AGENT_SESSION_ID || '';
const IME_TIMEOUT_MS = Number(process.env.IME_TIMEOUT_MS || 30000);

let cachedAgentSessionId = IME_AGENT_SESSION_ID;

const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    parseTagValue: true,
    trimValues: true,
});

const staticTypeCodeMap = {
    Countries: 'WSST-CONV1',
    States: 'WSST-STTV1',
    Districts: 'WSST-DISV1',
    Municipalities: 'WSST-MUNV1',
    Genders: 'WSST-GDRV1',
    MaritalStatus: 'WSST-MSSV1',
    Occupation: 'WSST-OCPV1',
    SourceOfFundList: 'WSST-SOFV1',
    GetIdTypes: 'WSST-IDTV1',
    GetIdentityTypes: 'WSST-IDTV1',
    IDPlaceofIssue: 'WSST-POIV1',
    RelationshipList: 'WSST-RELV1',
    PurposeOfRemittance: 'WSST-PORV1',
    TransactionCancelReason: 'WSST-TCRV1',
    BankList: 'WSST-BKLV1',
    BankBranchList: 'WSST-BBLV1',
    CSPRegistrationTypeList: 'WSST-REGV1',
    CSPAddressProofTypeList: 'WSST-ADPV1',
    CSPOwnerAddressProofTypeList: 'WSST-OAPV1',
    CSPBusinessTypeList: 'WSST-BUSV1',
    CSPDocumentTypeList: 'WSST-ADOV1',
    GetAccountType: 'WSST-ACCV1',
    OwnerCategoryTypes: 'WSST-CATV1',
    EducationalQualificationList: 'WSST-EDQV1',
};

const xmlEscape = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const ensureString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value);
};

const toImeXml = (tagName, value) => {
    if (value === undefined || value === null) return '';

    if (Array.isArray(value)) {
        return value.map((entry) => toImeXml(tagName, entry)).join('');
    }

    if (typeof value === 'object') {
        const inner = Object.entries(value)
            .map(([key, nested]) => toImeXml(key, nested))
            .join('');
        return `<ime:${tagName}>${inner}</ime:${tagName}>`;
    }

    return `<ime:${tagName}>${xmlEscape(ensureString(value))}</ime:${tagName}>`;
};

const currentAgentSessionId = () => cachedAgentSessionId || IME_AGENT_SESSION_ID || IME_PARTNER_BRANCH_ID || IME_ACCESS_CODE || '';

const credentialsXml = (credentialsNodeName = 'Credentials') => `
                <ime:${credentialsNodeName}>
          <ime:AccessCode>${xmlEscape(IME_ACCESS_CODE)}</ime:AccessCode>
          <ime:UserName>${xmlEscape(IME_USERNAME)}</ime:UserName>
          <ime:Password>${xmlEscape(IME_PASSWORD)}</ime:Password>
          <ime:PartnerBranchId>${xmlEscape(IME_PARTNER_BRANCH_ID)}</ime:PartnerBranchId>
          <ime:AgentSessionId>${xmlEscape(currentAgentSessionId())}</ime:AgentSessionId>
                </ime:${credentialsNodeName}>`;

const buildSoapEnvelope = (operationName, requestNodeName, bodyXml, credentialsNodeName = 'Credentials') => `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ime="IME">
  <soapenv:Header/>
  <soapenv:Body>
    <ime:${operationName}>
      <ime:${requestNodeName}>
                ${credentialsXml(credentialsNodeName)}
        ${bodyXml || ''}
      </ime:${requestNodeName}>
    </ime:${operationName}>
  </soapenv:Body>
</soapenv:Envelope>`;

const extractNestedValue = (objectValue, needle) => {
    if (!objectValue || typeof objectValue !== 'object') return null;

    for (const [key, value] of Object.entries(objectValue)) {
        if (key.toLowerCase() === needle.toLowerCase()) return value;
        if (typeof value === 'object') {
            const nested = extractNestedValue(value, needle);
            if (nested !== null && nested !== undefined) return nested;
        }
    }

    return null;
};

const parseSoapResult = (rawXml) => {
    const parsed = parser.parse(rawXml);
    const body = parsed?.Envelope?.Body || {};
    const soapFault = body?.Fault;
    if (soapFault) {
        const faultMessage = soapFault?.faultstring || soapFault?.Reason?.Text || 'SOAP Fault';
        return {
            responseCode: '999',
            responseMessage: faultMessage,
            data: soapFault,
            raw: parsed,
            isFault: true,
        };
    }

    const firstPayload = Object.values(body)[0] || {};
    const resultNodeKey = Object.keys(firstPayload).find((key) => /Result$/i.test(key));
    const resultNode = resultNodeKey ? firstPayload[resultNodeKey] : firstPayload;

    const responseNode = resultNode?.Response || resultNode?.RESPONSE || extractNestedValue(resultNode, 'Response');
    const responseCode = responseNode?.Code || responseNode?.code || null;
    const responseMessage = responseNode?.Message || responseNode?.message || null;
    const responseAgentSessionId = responseNode?.AgentSessionId || extractNestedValue(resultNode, 'AgentSessionId');

    if (responseAgentSessionId) {
        cachedAgentSessionId = String(responseAgentSessionId);
    }

    return {
        responseCode,
        responseMessage,
        data: resultNode,
        raw: parsed,
    };
};

const buildStaticDataPayload = (req, endpointName) => {
    const typeCode = staticTypeCodeMap[endpointName];
    if (!typeCode) return null;

    let referenceValue = '';
    if (endpointName === 'States') referenceValue = req.params.CountryId || req.query.CountryId || '';
    if (endpointName === 'Districts') referenceValue = req.params.StateId || req.query.StateId || '';
    if (endpointName === 'Municipalities') referenceValue = req.params.DistrictId || req.query.DistrictId || '';
    if (endpointName === 'BankList') referenceValue = req.params.CountryId || req.query.CountryId || 'NPL';
    if (endpointName === 'BankBranchList') referenceValue = req.params.BankId || req.query.BankId || '';
    if (endpointName === 'GetIdTypes' || endpointName === 'GetIdentityTypes') referenceValue = req.query.country || req.query.Country || 'NPL';
    if (endpointName === 'IDPlaceofIssue') referenceValue = req.query.referenceValue || req.query.idType || '';

    return {
        operationName: 'GetStaticData',
        requestNodeName: 'GetStaticDataRequest',
        bodyXml: `
        <ime:TypeCode>${xmlEscape(typeCode)}</ime:TypeCode>
        <ime:ReferenceValue>${xmlEscape(referenceValue)}</ime:ReferenceValue>`,
    };
};

const buildOperationPayload = (req) => {
    const endpointName = req.path.replace(/^\//, '').split('/')[0];
    const staticPayload = buildStaticDataPayload(req, endpointName);
    if (staticPayload) return { ...staticPayload, credentialsNodeName: 'Credentials' };

    switch (endpointName) {
    case 'BalanceInquiry':
        return {
            operationName: 'BalanceInquiry',
            requestNodeName: 'BalanceInquiryRequest',
            bodyXml: '',
            credentialsNodeName: 'Credentialss',
        };
    case 'CheckCustomer':
        return {
            operationName: 'CheckCustomer',
            requestNodeName: 'CheckCustomerRequest',
            bodyXml: `<ime:MobileNo>${xmlEscape(req.params.mobileNo || req.body?.mobileNo || '')}</ime:MobileNo>`,
            credentialsNodeName: 'Credentialss',
        };
    case 'CustomerRegistration': {
        const input = req.body || {};
        return {
            operationName: 'CustomerRegistration',
            requestNodeName: 'RegisterCustomerRequest',
            bodyXml: `
            <ime:CustomerDetails>
              ${toImeXml('MobileNo', input.mobileNo)}
              ${toImeXml('MembershipId', input.membershipId)}
              ${toImeXml('FirstName', input.firstName)}
              ${toImeXml('MiddleName', input.middleName)}
              ${toImeXml('LastName', input.lastName)}
              ${toImeXml('Nationality', input.nationality)}
              ${toImeXml('MaritalStatus', input.maritalStatus)}
              ${toImeXml('DOB', input.dob)}
              ${toImeXml('Gender', input.gender)}
              ${toImeXml('FatherOrMotherName', input.fatherOrMotherName)}
              ${toImeXml('Email', input.email)}
              ${toImeXml('Occupation', input.occupation)}
              ${toImeXml('SourceOfFund', input.sourceOfFund)}
            </ime:CustomerDetails>
            <ime:PermanentAddress>
              ${toImeXml('State', input.permanentAddress_State)}
              ${toImeXml('District', input.permanentAddress_District)}
              ${toImeXml('Municipality', input.permanentAddress_Municipality)}
              ${toImeXml('Address', input.permanentAddress_Address)}
              ${toImeXml('WardNo', input.permanentAddress_WardNo)}
              ${toImeXml('Tole', input.permanentAddress_Tole)}
              ${toImeXml('HouseNo', input.permanentAddress_HouseNo)}
            </ime:PermanentAddress>
            <ime:TemporaryAddress>
              ${toImeXml('State', input.temporaryAddress_State)}
              ${toImeXml('District', input.temporaryAddress_District)}
              ${toImeXml('Address', input.temporaryAddress_Address)}
              ${toImeXml('PostalCode', input.temporaryAddress_PostalCode)}
              ${toImeXml('HouseNo', input.temporaryAddress_HouseNo)}
            </ime:TemporaryAddress>
            <ime:IdentityDetails>
              ${toImeXml('IdType', input.idType)}
              ${toImeXml('IdNo', input.idNo)}
              ${toImeXml('IdPlaceOfIssue', input.idPlaceOfIssue)}
              ${toImeXml('IssueDate', input.issueDate)}
              ${toImeXml('ExpiryDate', input.expiryDate)}
              ${toImeXml('IdNoCitizenship', input.idNoCitizenship)}
              ${toImeXml('IdIssuePlaceCitizenship', input.idIssuePlaceCitizenship)}
              ${toImeXml('IdIssueDateCitizenship', input.idIssueDateCitizenship)}
              ${toImeXml('PhotoData', input.photoData)}
              ${toImeXml('PhotoDataType', input.photoDataType)}
              ${toImeXml('IdData', input.idData)}
              ${toImeXml('IdDataType', input.idDataType)}
            </ime:IdentityDetails>`,
                        credentialsNodeName: 'Credentialss',
        };
    }
    case 'ConfirmCustomerRegistration':
        return {
            operationName: 'ConfirmCustomerRegistration',
            requestNodeName: 'ConfirmCustomerRequest',
            bodyXml: `
            ${toImeXml('OTP', req.body?.otp)}
            ${toImeXml('CustomerToken', req.body?.customerToken)}
            ${toImeXml('OTPToken', req.body?.otpToken)}`,
            credentialsNodeName: 'Credentialss',
        };
    case 'SendOTP':
        return {
            operationName: 'SendOTP',
            requestNodeName: 'SendOTPRequest',
            bodyXml: `
            ${toImeXml('Module', req.body?.module)}
            ${toImeXml('ReferenceValue', req.body?.referenceValue)}`,
            credentialsNodeName: 'Credentialss',
        };
    case 'GetCalculation':
        return {
            operationName: 'GetCalculation',
            requestNodeName: 'GetCalculationRequest',
            bodyXml: `
            ${toImeXml('PayoutAgentId', req.body?.payoutAgentId)}
            ${toImeXml('RemitAmount', req.body?.remitAmount)}
            ${toImeXml('PaymentType', req.body?.paymentType)}
            ${toImeXml('PayoutCountry', req.body?.payoutCountry)}
            ${toImeXml('CalcBy', req.body?.calcBy)}`,
            credentialsNodeName: 'Credentials',
        };
    case 'SendTransaction': {
        const input = req.body || {};
        return {
            operationName: 'SendTransaction',
            requestNodeName: 'SendTransactionRequest',
            bodyXml: `
            <ime:SenderDetails>
              ${toImeXml('SenderName', input.senderName)}
              ${toImeXml('SenderMobileNo', input.senderMobileNo)}
              ${toImeXml('Occupation', input.occupation)}
            </ime:SenderDetails>
            <ime:ReceiverDetails>
              ${toImeXml('ReceiverName', input.receiverName)}
              ${toImeXml('ReceiverAddress', input.receiverAddress)}
              ${toImeXml('ReceiverGender', input.receiverGender)}
              ${toImeXml('ReceiverMobileNo', input.receiverMobileNo)}
              ${toImeXml('ReceiverCity', input.receiverCity)}
              ${toImeXml('ReceiverCountry', input.receiverCountry)}
            </ime:ReceiverDetails>
            <ime:TransactionDetails>
              ${toImeXml('ForexSessionId', input.forexSessionId)}
              ${toImeXml('AgentTxnRefId', input.agentTxnRefId)}
              ${toImeXml('CollectAmount', input.collectAmount)}
              ${toImeXml('PayoutAmount', input.payoutAmount)}
              ${toImeXml('SourceOfFund', input.sourceOfFund)}
              ${toImeXml('Relationship', input.relationship)}
              ${toImeXml('PurposeOfRemittance', input.purposeOfRemittance)}
              ${toImeXml('PaymentType', input.paymentType)}
              ${toImeXml('BankId', input.bankId)}
              ${toImeXml('BankBranchId', input.bankBranchId)}
              ${toImeXml('BankAccountNumber', input.bankAccountNumber)}
              ${toImeXml('CalcBy', input.calcBy)}
            </ime:TransactionDetails>`,
                        credentialsNodeName: 'Credentialss',
        };
    }
    case 'ConfirmSendTransaction':
        return {
            operationName: 'ConfirmSendTransaction',
            requestNodeName: 'ConfirmSendTransactionRequest',
            bodyXml: `
            ${toImeXml('RefNo', req.body?.refNo)}
            ${toImeXml('OTPToken', req.body?.otpToken)}
            ${toImeXml('OTP', req.body?.otp)}`,
            credentialsNodeName: 'Credentials',
        };
    case 'TransactionInquiry':
    case 'TransactionInquiryDefault':
        return {
            operationName: 'TransactionInquiry',
            requestNodeName: 'TransactionInquiryRequest',
            bodyXml: `
            ${toImeXml('RefNoType', req.body?.refNoType)}
            ${toImeXml('RefNo', req.body?.refNo)}`,
            credentialsNodeName: 'Credentialss',
        };
    case 'AmendTransaction':
        return {
            operationName: 'AmendmentTransaction',
            requestNodeName: 'ModifyTxnRequest',
            bodyXml: `
            ${toImeXml('RefNo', req.body?.refNo)}
            ${toImeXml('ReceiverName', req.body?.receiverName)}
            ${toImeXml('ReceiverGender', req.body?.receiverGender)}
            ${toImeXml('ReceiverAddress', req.body?.receiverAddress)}
            ${toImeXml('RelationWithSender', req.body?.relationWithSender)}
            ${toImeXml('PurposeOfRemit', req.body?.purposeOfRemit)}
            ${toImeXml('SoureOfFund', req.body?.sourceOfFund)}
            ${toImeXml('ReceiverMobileNo', req.body?.receiverMobileNo)}
            ${toImeXml('BankId', req.body?.bankId)}
            ${toImeXml('BankBranchId', req.body?.bankBranchId)}
            ${toImeXml('AccountNo', req.body?.accountNo)}
            ${toImeXml('OTP', req.body?.otp)}
            ${toImeXml('OTPToken', req.body?.otpToken)}`,
            credentialsNodeName: 'Credentialss',
        };
    case 'CancelTransaction':
        return {
            operationName: 'CancelTransaction',
            requestNodeName: 'CancelTxnRequest',
            bodyXml: `
            ${toImeXml('RefNo', req.body?.refNo)}
            ${toImeXml('CancelReason', req.body?.cancelReason)}
            ${toImeXml('OTP', req.body?.otp)}
            ${toImeXml('OTPToken', req.body?.otpToken)}`,
            credentialsNodeName: 'Credentialss',
        };
    case 'CheckCSP':
        return {
            operationName: 'CSPCheck',
            requestNodeName: 'CSPCheckRequest',
            bodyXml: `
            ${toImeXml('CSPCode', req.query?.cspCode || req.body?.cspCode || '')}`,
            credentialsNodeName: 'Credentialss',
        };
    case 'CSPRegistration':
        return {
            operationName: 'CSPRegistration',
            requestNodeName: 'CSPRegistrationRequest',
            bodyXml: Object.entries(req.body || {}).map(([key, value]) => toImeXml(key, value)).join(''),
            credentialsNodeName: 'Credentialss',
        };
    case 'CSPDocumentUpload':
        return {
            operationName: 'CSPDocumentUpload',
            requestNodeName: 'CSPDocumentUploadRequest',
            bodyXml: Object.entries(req.body || {}).map(([key, value]) => toImeXml(key, value)).join(''),
            credentialsNodeName: 'Credentialss',
        };
    case 'CustomerMobileAmendment':
        return {
            operationName: 'CustomerMobileAmendment',
            requestNodeName: 'CustomerMobileAmendmentRequest',
            bodyXml: Object.entries(req.body || {}).map(([key, value]) => toImeXml(key, value)).join(''),
            credentialsNodeName: 'Credentialss',
        };
    default:
        return {
            operationName: endpointName,
            requestNodeName: `${endpointName}Request`,
            bodyXml: Object.entries(req.body || {}).map(([key, value]) => toImeXml(key, value)).join(''),
            credentialsNodeName: 'Credentials',
        };
    }
};

const toHttpStatus = (code) => {
    if (code === null || code === undefined || code === '') return 200;
    const numeric = Number(code);
    if (Number.isNaN(numeric)) return 200;
    if (numeric === 0) return 200;
    if (numeric === 101 || numeric === 102 || numeric === 109) return 401;
    if (numeric >= 100 && numeric < 200) return 400;
    if (numeric >= 200 && numeric < 300) return 400;
    if (numeric >= 300 && numeric < 400) return 400;
    if (numeric >= 400 && numeric < 500) return 400;
    if (numeric >= 500 && numeric < 900) return 422;
    return 500;
};

const imeSwaggerProxy = async (req, res) => {
    try {
        const required = [IME_SOAP_BASE_URL, IME_ACCESS_CODE, IME_USERNAME, IME_PASSWORD, IME_PARTNER_BRANCH_ID];
        if (required.some((v) => !String(v || '').trim())) {
            return res.status(500).json({
                success: false,
                message: 'IME SOAP env is not fully configured. Required: IME_SOAP_BASE_URL, IME_ACCESS_CODE, IME_USERNAME, IME_PASSWORD, IME_PARTNER_BRANCH_ID.',
            });
        }

        const payload = buildOperationPayload(req);
        const xmlBody = buildSoapEnvelope(
            payload.operationName,
            payload.requestNodeName,
            payload.bodyXml,
            payload.credentialsNodeName || 'Credentials'
        );

        const response = await axios.post(IME_SOAP_BASE_URL, xmlBody, {
            timeout: IME_TIMEOUT_MS,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                SOAPAction: `${IME_SOAP_ACTION_NAMESPACE}/${payload.operationName}`,
            },
            validateStatus: () => true,
        });

        const result = parseSoapResult(response.data);
        const status = toHttpStatus(result.responseCode);

        return res.status(status).json({
            success: String(result.responseCode) === '0',
            code: result.responseCode,
            message: result.responseMessage,
            data: result.data,
        });
    } catch (error) {
        console.error('[IME SOAP Proxy] Request failed:', {
            method: req.method,
            path: req.originalUrl,
            message: error.message,
            status: error?.response?.status,
            data: error?.response?.data,
        });

        return res.status(error?.response?.status || 500).json({
            success: false,
            message: error?.response?.data?.message || 'IME SOAP request failed',
            error: error.message,
        });
    }
};

module.exports = { imeSwaggerProxy };
