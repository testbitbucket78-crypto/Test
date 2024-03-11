const express = require('express');
const router=express.Router();
const authenticateToken = require('../Authorize');

const organizationController=require('./organizationController');
const profileController=require('./profileController');
const notification=require('./NotifyClients')
const campaignController=require('./campaignController');
const accountController=require('./accountController')
const generalcontroller=require('./generalcontrolller')
//_____________________________Organization Settings_______________________//


router.post('/uploadCompanylogo',authenticateToken,organizationController.uploadCompanylogo)
router.post('/companyDetail',authenticateToken,organizationController.savecompanyDetail)
router.post('/localDetails',authenticateToken,organizationController.savelocalDetails)
router.post('/billingDetails',authenticateToken,organizationController.savebillingDetails)
router.post('/updateCompanyDetail',authenticateToken,organizationController.updateCompanyDetail)
router.post('/updateLocalDetails',authenticateToken,organizationController.updateLocalDetails)
router.post('/updatebillingDetails',authenticateToken,organizationController.updatebillingDetails)
router.get('/companyDetail/:spID',authenticateToken,organizationController.getcompanyDetail)
router.get('/localDetails/:spID',authenticateToken,organizationController.getlocalDetails)
router.get('/billingDetails/:spID',authenticateToken,organizationController.getbillingDetails)

router.post('/workingDetails',authenticateToken,organizationController.saveworkingDetails)
router.get('/workingDetails/:spID',authenticateToken,organizationController.getworkingDetails)
router.post('/updateWorkingHours',authenticateToken,organizationController.updateWorkingHours)

router.post('/holidays',authenticateToken,organizationController.addholidays)
router.get('/holidays/:spID/:dateFrom/:dateTo',authenticateToken,organizationController.getHolidays)
router.post('/removeHolidays',authenticateToken,organizationController.removeHolidays)

router.get('/subrights',authenticateToken,organizationController.subrights)
router.get('/rights',authenticateToken,organizationController.rights)

router.post('/addRole',authenticateToken,organizationController.addRole)
router.get('/getRoles/:roleID/:spid',authenticateToken,organizationController.getRolesbyroleIDspid)
router.get('/getUser/:spid/:userType',authenticateToken,organizationController.getUserbyspiduserType)
router.get('/deleteRole/:roleID/:spid',authenticateToken,organizationController.deleteRoleByroleIDspid)

router.post('/addUser',authenticateToken,organizationController.addUser)
router.get('/rolesList/:spid',authenticateToken,organizationController.rolesListByspid)
router.post('/deleteUser',authenticateToken,organizationController.deleteUser)
router.post('/editUser',authenticateToken,organizationController.editUser)
router.get('/getUser/:spid',authenticateToken,organizationController.getUserByspid)
router.get('/getUserByuid/:spid/:uid',authenticateToken,organizationController.getUserByuid)

router.post('/addTeam',authenticateToken,organizationController.addTeam)
router.post('/deleteTeam',authenticateToken,organizationController.deleteTeam)
router.post('/editTeam',authenticateToken,organizationController.editTeam)
router.get('/teamsList/:spid',authenticateToken,organizationController.teamsListByspid)


//____________________________Profile Sttings_____________________________________//

router.get('/teamName/:uid',authenticateToken,profileController.teamName)
router.get('/roleName/:uid',authenticateToken,profileController.roleName)
router.post('/userProfileImg',authenticateToken,profileController.userProfile)
router.post('/changePassword',authenticateToken,profileController.changePassword)
router.post('/userActiveStatus',authenticateToken,profileController.userActiveStatus)

router.post('/addNotification',authenticateToken,profileController.addNotification)
router.get('/getNotification/:UID',authenticateToken,profileController.getNotificationByUid)

router.post('/savePlan',authenticateToken,profileController.saveManagePlan)
router.post('/saveBillingHistory',authenticateToken,profileController.saveBillingHistory)
router.get('/getBillingDetails/:spid',authenticateToken,profileController.getBillingDetails)

router.get('/pdf/:spid',authenticateToken,profileController.invoicePdf)
router.get('/invoiceDetails/:spid',authenticateToken,profileController.invoiceDetails)

router.get('/usesData/spid',authenticateToken,profileController.usesData)
router.get('/usageInsight/:spid',authenticateToken,profileController.UsageInsightCon)
router.get('/ApproximateCharges/:spid',authenticateToken,profileController.ApproximateCharges)
router.get('/deletePaymentMethod/:spid',authenticateToken,profileController.deletePaymentMethod)
router.get('/getAvailableAmout/:spid',authenticateToken,profileController.getAvailableAmout)
router.post('/addfunds',authenticateToken,profileController.addfunds)
router.get('/subFAQS/:id',authenticateToken,profileController.getSubFAQS)
router.get('/FAQs',authenticateToken,profileController.getFAQs)
router.get('/userGuideTopics',authenticateToken,profileController.UserGuideTopics)
router.get('/userGuideSubTopics/:id',authenticateToken,profileController.UserGuideSubTopics)
router.post('/SPTransations',authenticateToken,profileController.addSPTransations)
router.get('/managePlan',authenticateToken,profileController.getmanagePlansandCharges)


//________________________ Notification_____________________//

router.get('/getNotifications/:spid',authenticateToken,notification.notification)

//_________________________Campaign Settings__________________//

router.post('/addCampaignTimings',authenticateToken,campaignController.addCampaignTimings)
router.post('/updateCampaignTiming',authenticateToken,campaignController.updateCampaignTimings)
router.get('/selectCampaignTimings/:sid',authenticateToken,campaignController.selectCampaignTimings)
router.get('/getCampaignAlertUserList/:sid',authenticateToken,campaignController.getUserList)
router.post('/addAndUpdateCampaign',authenticateToken,campaignController.addAndUpdateCampaign)
router.get('/selectCampaignAlerts/:sid',authenticateToken,campaignController.selectCampaignAlerts)
router.post('/addCampaignTest',authenticateToken,campaignController.addCampaignTest)
router.get('/selectCampaignTest/:sid',authenticateToken,campaignController.selectCampaignTest)
router.post('/testCampaign',authenticateToken,campaignController.testCampaign)


//______________________Contact Settings_______________________//

router.post('/addupdateTag',authenticateToken,campaignController.addTag)
router.get('/selectTag/:spid',authenticateToken,campaignController.gettags)
router.post('/deleteTag',authenticateToken,campaignController.deleteTag)

router.post('/addCustomField',authenticateToken,campaignController.addCustomField)
router.post('/editCustomField',authenticateToken,campaignController.editCustomField)
router.get('/getCustomField/:spid',authenticateToken,campaignController.getCustomField)
router.get('/getCustomFieldById/:id',authenticateToken,campaignController.getCustomFieldById)
router.post('/deleteCustomField/:id',authenticateToken,campaignController.deleteCustomField)
router.post('/enableMandatory',authenticateToken,campaignController.enableMandatoryfield)
router.post('/enableStatus',authenticateToken,campaignController.enableStatusfield)

//_______________________TEMPLATE_________________________//

router.post('/addTemplate',authenticateToken,campaignController.addTemplate)  //  isTemplate  value 0 for quick response , 1 for template ,(2 for gallary and spid =0 )
router.get('/getTemplate/:spid/:isTemplate',authenticateToken,campaignController.getTemplate)
router.get('/getApprovedTemplate/:spid/:isTemplate',authenticateToken,campaignController.getApprovedTemplate)
router.post('/deleteTemplates',authenticateToken,campaignController.deleteTemplates)
router.post('/addGallery',authenticateToken,campaignController.addGallery)
router.get('/getGallery/:spid/:isTemplate',authenticateToken,campaignController.getGallery)  // pass spid=0,isTemplate=2
router.get('/exitTemplate/:spid/:isTemplate/:name',authenticateToken,campaignController.isExistTemplate);  // istemplate=1
//__________________ACCOUNT API'S__________________________//

router.post('/addWhatsAppDetails',authenticateToken,accountController.insertAndEditWhatsAppWeb)
router.get('/getWhatsAppDetails/:spid',authenticateToken,accountController.selectDetails)

router.post('/addToken',authenticateToken,accountController.addToken)
router.post('/editToken',authenticateToken,accountController.editToken)
router.get('/deleteToken/:id',authenticateToken,accountController.deleteToken)
router.post('/isEnableToken',authenticateToken,accountController.enableToken)
router.get('/selectToken/:spid',authenticateToken,accountController.selectToken)
router.get('/createInstanceID',authenticateToken,accountController.createInstance)
router.post('/qrCodeData',authenticateToken,accountController.getQRcode)
router.post('/generateQRcode',authenticateToken,accountController.generateQRcode)
router.post('/testwebhook',authenticateToken,accountController.testWebhook)

//__________________________General Settings____________________________//

router.post('/defaultaction',authenticateToken,generalcontroller.defaultaction)
router.get('/generalcontroller/:spid',authenticateToken,generalcontroller.getdefaultaction)

router.get('/getdefaultmessages/:spid',authenticateToken,generalcontroller.getdefaultmessages)
router.post('/Abledisable',authenticateToken,generalcontroller.Abledisable)
router.post('/savedefaultmessages',authenticateToken,generalcontroller.savedefaultmessages)
router.post('/uploadimg',authenticateToken,generalcontroller.uploadimg)
router.post('/addAndUpdateDefaultMsg',authenticateToken,generalcontroller.addAndUpdateDefaultMsg)
router.post('/deletedefaultactions',authenticateToken,generalcontroller.deletedefaultactions)


router.post('/rotingsave',authenticateToken,generalcontroller.rotingsave)
router.get('/getroutingrules/:spid',authenticateToken,generalcontroller.getroutingrules)

router.post('/savemanagestorage',authenticateToken,generalcontroller.savemanagestorage)

router.get('/getautodeletion/:spid',authenticateToken,generalcontroller.getautodeletion)

//_______************_______________//
router.post('/manualDelation',authenticateToken,generalcontroller.manualDelation)
router.post('/getmanualDelation',authenticateToken,generalcontroller.deletedDetails)


module.exports = router;