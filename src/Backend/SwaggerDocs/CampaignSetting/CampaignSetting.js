/**
 * @swagger
 * /selectCampaignAlerts/{sid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get campaign alerts by SP_ID - Schedule Alerts
 *     description: Retrieves campaign alerts for the specified service provider ID (SP_ID).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sid
 *         required: true
 *         schema:
 *           type: integer
 *         description: The service provider ID (SP_ID) to fetch campaign alerts for.
 *         example: 55
 *     responses:
 *       200:
 *         description: Successfully retrieved campaign alerts.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               getCampaignAlerts:
 *                 - uid: 668
 *                   name: "Official Mail"
 *                   email_id: "officialmail@yopmail.com"
 *                   mobile_number: "919876473632"
 *                   registerPhone: "919876473632"
 *                   display_mobile_number: "9876473632"
 *                   country_code: "IN +91"
 *                   UserType: 501
 *                   IsActive: 1
 *                   isDeleted: 0
 *                   Channel: "api"
 *                   SP_ID: 55
 *                   CreatedDate: "2024-12-30T06:59:30.000Z"
 *                   LastLogIn: "2025-02-20T10:01:37.000Z"
 *                   LastModifiedDate: "2025-02-14T06:15:51.000Z"
 *                   LoginIP: "127.0.0.1"
 *                   profile_img: null
 *                   timezone: null
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Invalid request data"
 *               status: 400
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Unauthorized"
 *               status: 401
 *       404:
 *         description: No campaign alerts found for the given SP_ID.
 *         content:
 *           application/json:
 *             example:
 *               msg: "No campaign alerts found"
 *               status: 404
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal server error"
 *               status: 500
 */

/**
 * @swagger
 * /selectCampaignTimings/{sid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get campaign timings by SP_ID  Campaign Alerts
 *     description: Retrieves campaign timings for the specified service provider ID (SP_ID).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sid
 *         required: true
 *         schema:
 *           type: integer
 *         description: The service provider ID (SP_ID) to fetch campaign timings for.
 *         example: 55
 *     responses:
 *       200:
 *         description: Successfully retrieved campaign timings.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               seletedCampaignTimings:
 *                 - id: 3980
 *                   day: "Monday"
 *                   start_time: "09:00"
 *                   end_time: "23:30"
 *                   sp_id: 55
 *                   isDeleted: 0
 *                   created_at: "2025-01-10T15:23:02.000Z"
 *                   updated_at: null
 *                 - id: 3981
 *                   day: "Tuesday"
 *                   start_time: "09:00"
 *                   end_time: "23:30"
 *                   sp_id: 55
 *                   isDeleted: 0
 *                   created_at: "2025-01-10T15:23:02.000Z"
 *                   updated_at: null
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Invalid request data"
 *               status: 400
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Unauthorized"
 *               status: 401
 *       404:
 *         description: No campaign timings found for the given SP_ID.
 *         content:
 *           application/json:
 *             example:
 *               msg: "No campaign timings found"
 *               status: 404
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal server error"
 *               status: 500
 */

/**
 * @swagger
 * /selectCampaignTest/{sid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get campaign test users by SP_ID - Schedule Alerts
 *     description: Retrieves a list of campaign test users for the specified service provider ID (SP_ID).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sid
 *         required: true
 *         schema:
 *           type: integer
 *         description: The service provider ID (SP_ID) to fetch campaign test users for.
 *         example: 55
 *     responses:
 *       200:
 *         description: Successfully retrieved campaign test users.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               getCampaignTest:
 *                 - uid: 668
 *                   name: "Official Mail"
 *                   email_id: "officialmail@yopmail.com"
 *                   display_mobile_number: "9876473632"
 *                   mobile_number: "919876473632"
 *                   registerPhone: "919876473632"
 *                   country_code: "IN +91"
 *                   UserType: 501
 *                   Channel: "api"
 *                   IsActive: 1
 *                   isDeleted: 0
 *                   SP_ID: 55
 *                   LastLogIn: "2025-02-20T10:01:37.000Z"
 *                   CreatedDate: "2024-12-30T06:59:30.000Z"
 *                   LastModifiedDate: "2025-02-14T06:15:51.000Z"
 *                   LoginIP: "127.0.0.1"
 *                   profile_img: null
 *                   timezone: null
 *                   address: null
 *                 - uid: 679
 *                   name: "CampTest"
 *                   email_id: "demoslucifer19@gmail.com"
 *                   display_mobile_number: "8627019494"
 *                   mobile_number: "918627019494"
 *                   registerPhone: "918627019494"
 *                   country_code: "IN +91"
 *                   UserType: 501
 *                   Channel: "api"
 *                   IsActive: 3
 *                   isDeleted: 1
 *                   SP_ID: 55
 *                   LastLogIn: null
 *                   CreatedDate: "2025-01-10T11:07:07.000Z"
 *                   LastModifiedDate: "2025-01-27T10:56:46.000Z"
 *                   LoginIP: null
 *                   profile_img: null
 *                   timezone: null
 *                   address: null
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Invalid request data"
 *               status: 400
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Unauthorized"
 *               status: 401
 *       404:
 *         description: No campaign test users found for the given SP_ID.
 *         content:
 *           application/json:
 *             example:
 *               msg: "No campaign test users found"
 *               status: 404
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal server error"
 *               status: 500
 */



/**
 * @swagger
 * /addCampaignTimings:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Add campaign timings - Schedule Alerts
 *     description: Adds a new campaign timing schedule for a service provider.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sp_id:
 *                 type: integer
 *                 example: 55
 *               days:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday", "Sunday", "Wednesday"]
 *                     start_time:
 *                       type: string
 *                       example: "09:00"
 *                     end_time:
 *                       type: string
 *                       example: "23:30"
 *     responses:
 *       200:
 *         description: Successfully added campaign timings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "added successfully"
 *                 status:
 *                   type: integer
 *                   example: 200
 */

/**
 * @swagger
 * /addAndUpdateCampaign:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Add or update a campaign - Schedule Alerts
 *     description: Adds or updates a campaign for the specified service provider and user(s).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: integer
 *                 example: 55
 *               uid:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [668]
 *     responses:
 *       200:
 *         description: Campaign added or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "addCampaignAlerts"
 *                 status:
 *                   type: integer
 *                   example: 200
 */

