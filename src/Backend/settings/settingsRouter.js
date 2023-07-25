const express = require('express');
const router=express.Router();

const organizationController=require('./organizationController');
const profileController=require('./profileController');
const notification=require('./NotifyClients')
const campaignController=require('./campaignController');


//_____________________________Organization Settings_______________________//


router.post('/uploadCompanylogo',organizationController.uploadCompanylogo)
router.post('/companyDetail',organizationController.savecompanyDetail)
router.post('/localDetails',organizationController.savelocalDetails)
router.post('/billingDetails',organizationController.savebillingDetails)
router.post('/updateCompanyDetail',organizationController.updateCompanyDetail)
router.post('/updateLocalDetails',organizationController.updateLocalDetails)
router.post('/updatebillingDetails',organizationController.updatebillingDetails)
router.get('/companyDetail/:spID',organizationController.getcompanyDetail)
router.get('/localDetails/:spID',organizationController.getlocalDetails)
router.get('/billingDetails/:spID',organizationController.getbillingDetails)

router.post('/workingDetails',organizationController.saveworkingDetails)
router.get('/workingDetails/:spID',organizationController.getworkingDetails)
router.post('/updateWorkingHours',organizationController.updateWorkingHours)

router.post('/holidays',organizationController.addholidays)
router.get('/holidays/:spID/:dateFrom/:dateTo',organizationController.getHolidays)
router.post('/removeHolidays',organizationController.removeHolidays)

router.get('/subrights',organizationController.subrights)
router.get('/rights',organizationController.rights)

router.post('/addRole',organizationController.addRole)
router.get('/getRoles/:roleID/:spid',organizationController.getRolesbyroleIDspid)
router.get('/getUser/:spid/:userType',organizationController.getUserbyspiduserType)
router.get('/deleteRole/:roleID/:spid',organizationController.deleteRoleByroleIDspid)

router.post('/addUser',organizationController.addUser)
router.get('/rolesList/:spid',organizationController.rolesListByspid)
router.post('/deleteUser',organizationController.deleteUser)
router.post('/editUser',organizationController.editUser)
router.get('/getUser/:spid',organizationController.getUserByspid)

router.post('/addTeam',organizationController.addTeam)
router.post('/deleteTeam',organizationController.deleteTeam)
router.post('/editTeam',organizationController.editTeam)
router.get('/teamsList/:spid',organizationController.teamsListByspid)


//____________________________Profile Sttings_____________________________________//

router.get('/teamName/:uid',profileController.teamName)
router.get('/roleName/:uid',profileController.roleName)
router.post('/userProfileImg',profileController.userProfile)
router.post('/changePassword',profileController.changePassword)
router.post('/userActiveStatus',profileController.userActiveStatus)

router.post('/addNotification',profileController.addNotification)
router.get('/getNotification/:UID',profileController.getNotificationByUid)

router.post('/savePlan',profileController.saveManagePlan)
router.post('/saveBillingHistory',profileController.saveBillingHistory)
router.get('/getBillingDetails/:spid',profileController.getBillingDetails)

router.get('/pdf/:spid',profileController.invoicePdf)
router.get('/invoiceDetails/:spid',profileController.invoiceDetails)

router.get('/usesData/spid',profileController.usesData)
router.get('/usageInsight/:spid',profileController.UsageInsightCon)
router.get('/ApproximateCharges/:spid',profileController.ApproximateCharges)
router.get('/deletePaymentMethod/:spid',profileController.deletePaymentMethod)
router.get('/getAvailableAmout/:spid',profileController.getAvailableAmout)
router.post('/addfunds',profileController.addfunds)
router.get('/subFAQS/:id',profileController.getSubFAQS)
router.get('/FAQs',profileController.getFAQs)
router.get('/userGuideTopics',profileController.UserGuideTopics)
router.get('/userGuideSubTopics/:id',profileController.UserGuideSubTopics)
router.post('/SPTransations',profileController.addSPTransations)
router.get('/managePlan',profileController.getmanagePlansandCharges)


//________________________ Notification_____________________//

router.get('/getNotifications/:spid',notification.notification)

//_________________________Campaign Settings__________________//

router.post('/addCampaignTimings',campaignController.addCampaignTimings)
router.post('/updateCampaignTiming',campaignController.updateCampaignTimings)
router.get('/selectCampaignTimings/:sid',campaignController.selectCampaignTimings)
router.get('/getCampaignAlertUserList/:sid',campaignController.getUserList)
router.post('/addAndUpdateCampaign',campaignController.addAndUpdateCampaign)
router.get('/selectCampaignAlerts/:sid',campaignController.selectCampaignAlerts)
router.post('/addCampaignTest',campaignController.addCampaignTest)
router.get('/selectCampaignTest/:sid',campaignController.selectCampaignTest)

//______________________Contact Settings_______________________//

router.post('/addupdateTag',campaignController.addTag)
router.get('/selectTag/:spid',campaignController.gettags)
router.post('/deleteTag',campaignController.deleteTag)


//_______________________TEMPLATE_________________________//

router.post('/addTemplate',campaignController.addTemplate)
router.get('/getTemplate/:spid',campaignController.getTemplate)
router.post('/deleteTemplates',campaignController.deleteTemplates)

module.exports = router;