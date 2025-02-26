/**
 * @swagger
 * /getCampaigns/:
 *   post:
 *     summary: Retrieve campaign details - Campaigns
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SPID:
 *                 type: string
 *                 example: "55"
 *                 description: The service provider ID.
 *               key:
 *                 type: string
 *                 example: ""
 *                 description: Optional key parameter.
 *     responses:
 *       200:
 *         description: Successfully retrieved campaign data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Id:
 *                     type: integer
 *                     example: 781
 *                   title:
 *                     type: string
 *                     example: "with button"
 *                   sp_id:
 *                     type: integer
 *                     example: 55
 *                   channel_id:
 *                     type: integer
 *                     example: 1
 *                   category:
 *                     type: string
 *                     example: "Marketing"
 *                   category_id:
 *                     type: integer
 *                     example: 1
 *                   status:
 *                     type: integer
 *                     example: 3
 *                   time_zone:
 *                     type: string
 *                     example: "GMT +5:30"
 *                   start_datetime:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-02T11:45:00.000Z"
 *                   end_datetime:
 *                     type: string
 *                     example: "0000-00-00 00:00:00"
 *                   is_deleted:
 *                     type: integer
 *                     example: 0
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-02T06:13:17.000Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-02T06:15:10.000Z"
 *                   message_content:
 *                     type: string
 *                     example: "<p><strong>An unexpected error occurred. Please try again later.</strong></p>"
 *                   message_media:
 *                     type: string
 *                     example: "https://example.com/image.jpg"
 *                   media_type:
 *                     type: string
 *                     example: "image/jpeg"
 *                   bodyText:
 *                     type: string
 *                     example: "<p><strong>An unexpected error occurred.</strong></p>"
 *                   message_footer:
 *                     type: string
 *                     example: "Footer Section"
 *                   buttons:
 *                     type: string
 *                     example: "[{\"type\":\"Copy offer Code\",\"buttonText\":\"Copy Offer Code\",\"code\":\"Get005\"}]"
 *                   csv_contacts:
 *                     type: string
 *                     description: JSON string containing contact details.
 *                     example: "[{\"Name\":\"Vijay\",\"Gmail\":\"Vijay@gmail.com\",\"Number\":\"919876473632\"}]"
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *       401:
 *         description: Unauthorized request.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /getCampaignDetail/{CampaignId}:
 *   get:
 *     summary: Retrieve campaign details by Campaign ID - Campaigns
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: CampaignId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 781
 *         description: Unique ID of the campaign.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved campaign details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Id:
 *                   type: integer
 *                   example: 781
 *                 title:
 *                   type: string
 *                   example: "with button"
 *                 sp_id:
 *                   type: integer
 *                   example: 55
 *                 channel_id:
 *                   type: integer
 *                   example: 1
 *                 category:
 *                   type: string
 *                   example: "Marketing"
 *                 category_id:
 *                   type: integer
 *                   example: 1
 *                 status:
 *                   type: integer
 *                   example: 3
 *                 time_zone:
 *                   type: string
 *                   example: "GMT +5:30"
 *                 start_datetime:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-02T11:45:00.000Z"
 *                 end_datetime:
 *                   type: string
 *                   example: "0000-00-00 00:00:00"
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-02T06:13:17.000Z"
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-02T06:15:10.000Z"
 *                 message_content:
 *                   type: string
 *                   example: "<p><strong>An unexpected error occurred. Please try again later.</strong></p>"
 *                 message_footer:
 *                   type: string
 *                   example: "Footer Section"
 *                 message_media:
 *                   type: string
 *                   example: "https://example.com/image.jpg"
 *                 media_type:
 *                   type: string
 *                   example: "image/jpeg"
 *                 bodyText:
 *                   type: string
 *                   example: "<p>(Body Section: With media and button)</p>"
 *                 buttons:
 *                   type: string
 *                   example: "[{\"type\":\"Copy offer Code\",\"buttonText\":\"Copy Offer Code\",\"code\":\"Get005\"}]"
 *                 csv_contacts:
 *                   type: string
 *                   description: JSON string containing contact details.
 *                   example: "[{\"Name\":\"Vijay\",\"Gmail\":\"Vijay@gmail.com\",\"Number\":\"919876473632\"}]"
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *       401:
 *         description: Unauthorized request.
 *       404:
 *         description: Campaign not found.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /deleteCampaign/{CampaignId}:
 *   get:
 *     summary: Delete a campaign by Campaign ID - Campaigns
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CampaignId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the campaign to delete
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fieldCount:
 *                   type: integer
 *                 affectedRows:
 *                   type: integer
 *                 insertId:
 *                   type: integer
 *                 serverStatus:
 *                   type: integer
 *                 warningCount:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 protocol41:
 *                   type: boolean
 *                 changedRows:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /addCampaign:
 *   post:
 *     summary: Create a new campaign - Campaigns
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: string
 *                 example: "55"
 *               title:
 *                 type: string
 *                 example: "Test Campaign"
 *               category:
 *                 type: string
 *                 example: "Marketing"
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               channel_id:
 *                 type: integer
 *                 example: 1
 *               bodyText:
 *                 type: string
 *                 example: "<p><strong>Success Messages (Body Section)</strong></p>"
 *               buttons:
 *                 type: string
 *                 example: "[]"
 *               buttonsVariable:
 *                 type: string
 *                 example: "[]"
 *               csv_contacts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               day:
 *                 type: string
 *                 example: "Monday"
 *               end_datetime:
 *                 type: string
 *                 example: ""
 *               end_time:
 *                 type: string
 *                 example: "23:30"
 *               headerText:
 *                 type: string
 *                 nullable: true
 *               isTemplate:
 *                 type: integer
 *                 example: 1
 *               language:
 *                 type: string
 *                 example: "English"
 *               media_type:
 *                 type: string
 *                 example: ""
 *               message_content:
 *                 type: string
 *                 example: "<p><strong>Success Messages (Body Section)</strong></p>"
 *               message_footer:
 *                 type: string
 *                 example: "Thanks for supporting"
 *               message_heading:
 *                 type: string
 *                 nullable: true
 *               message_media:
 *                 type: string
 *                 example: "text"
 *               message_variables:
 *                 type: string
 *                 example: "[{\"label\":\"{{Name}}\",\"value\":\"{{Name}}\",\"isAttribute\":true}]"
 *               name:
 *                 type: string
 *                 example: "no_media_template"
 *               optInStatus:
 *                 type: string
 *                 example: ""
 *               segments_contacts:
 *                 type: string
 *                 example: "[83527]"
 *               start_datetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-24 06:00:00"
 *               start_time:
 *                 type: string
 *                 example: "09:00"
 *               status:
 *                 type: integer
 *                 example: 1
 *               templateId:
 *                 type: integer
 *                 example: 1246
 *               time_zone:
 *                 type: string
 *                 example: "+05:30"
 *     responses:
 *       200:
 *         description: Campaign added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Campaign added"
 *                 addcampaign:
 *                   type: object
 *                   properties:
 *                     fieldCount:
 *                       type: integer
 *                       example: 0
 *                     affectedRows:
 *                       type: integer
 *                       example: 1
 *                     insertId:
 *                       type: integer
 *                       example: 1379
 *                     serverStatus:
 *                       type: integer
 *                       example: 2
 *                     warningCount:
 *                       type: integer
 *                       example: 1
 *                     message:
 *                       type: string
 *                       example: ""
 *                     protocol41:
 *                       type: boolean
 *                       example: true
 *                     changedRows:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /campaignReport:
 *   post:
 *     summary: Request a campaign report - Campaigns
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId:
 *                 type: integer
 *                 example: 781
 *               userName:
 *                 type: string
 *                 example: "EngageKart"
 *               emailId:
 *                 type: string
 *                 example: "engagekart@gmail.com"
 *               campaignName:
 *                 type: string
 *                 example: "with button"
 *               spid:
 *                 type: string
 *                 example: "55"
 *               timeZone:
 *                 type: string
 *                 example: "+05:30"
 *     responses:
 *       200:
 *         description: Campaign report request successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Campaign report has been sent"
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /getFilteredCampaign:
 *   post:
 *     summary: Retrieve filtered campaigns based on search criteria - Campaigns
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SPID:
 *                 type: string
 *                 example: "55"
 *               start_date:
 *                 type: string
 *                 example: ""
 *               end_date:
 *                 type: string
 *                 example: ""
 *               channelIn:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               categoryIn:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               statusIn:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               key:
 *                 type: string
 *                 example: ""
 *     responses:
 *       200:
 *         description: Successfully retrieved filtered campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Id:
 *                     type: integer
 *                     example: 781
 *                   title:
 *                     type: string
 *                     example: "with button"
 *                   sp_id:
 *                     type: integer
 *                     example: 55
 *                   category:
 *                     type: string
 *                     example: "Marketing"
 *                   status:
 *                     type: integer
 *                     example: 3
 *                   time_zone:
 *                     type: string
 *                     example: "GMT +5:30"
 *                   start_datetime:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-02T11:45:00.000Z"
 *                   end_datetime:
 *                     type: string
 *                     format: date-time
 *                     example: "0000-00-00 00:00:00"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-02T06:13:17.000Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-02T06:15:10.000Z"
 *                   message_content:
 *                     type: string
 *                     example: "<p><strong>An unexpected error occurred. Please try again later.</strong></p>"
 *                   message_media:
 *                     type: string
 *                     example: "https://example.com/image.jpg"
 *                   buttons:
 *                     type: string
 *                     example: "[{\"type\":\"Copy offer Code\",\"buttonText\":\"Copy Offer Code\",\"code\":\"Get005\"}]"
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /testCampaign:
 *   post:
 *     summary: Create or update a campaign - Campaigns
 *     description: Sends campaign details to create or update a campaign.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sp_id:
 *                 type: string
 *                 description: Service provider ID.
 *                 example: "55"
 *               optInStatus:
 *                 type: string
 *                 description: Opt-in status of the campaign.
 *                 example: ""
 *               title:
 *                 type: string
 *                 description: Campaign title.
 *                 example: "jhgjh"
 *               channel_id:
 *                 type: integer
 *                 description: Channel ID for the campaign.
 *                 example: 1
 *               message_heading:
 *                 type: string
 *                 nullable: true
 *                 description: Heading of the message.
 *                 example: null
 *               bodyText:
 *                 type: string
 *                 description: HTML content of the campaign body.
 *                 example: "<p><strong>Success Messages (Body Section)</strong></p><p><strong>hi,&nbsp;<span><span contenteditable=\"false\" class=\"e-mention-chip\"><a title=\"\">{{Name}}</a></span></span><span contenteditable=\"true\">&nbsp;</span></strong></p><p>Ignore this message only testing purpose&nbsp;</p><p>Enagekart.com<br></p>"
 *               buttons:
 *                 type: string
 *                 description: JSON string representing campaign buttons.
 *                 example: "[]"
 *               buttonsVariable:
 *                 type: string
 *                 description: JSON string representing button variables.
 *                 example: "[]"
 *               category:
 *                 type: string
 *                 description: Category of the campaign.
 *                 example: "Marketing"
 *               category_id:
 *                 type: integer
 *                 description: Category ID.
 *                 example: 1
 *               csv_contacts:
 *                 type: array
 *                 description: List of contacts in CSV format.
 *                 example: []
 *               end_datetime:
 *                 type: string
 *                 description: Campaign end datetime.
 *                 example: ""
 *               headerText:
 *                 type: string
 *                 nullable: true
 *                 description: Header text of the campaign.
 *                 example: null
 *               isTemplate:
 *                 type: integer
 *                 description: Whether the campaign is a template (1 = Yes, 0 = No).
 *                 example: 1
 *               language:
 *                 type: string
 *                 description: Language of the campaign.
 *                 example: "English"
 *               media_type:
 *                 type: string
 *                 description: Type of media attached to the campaign.
 *                 example: ""
 *               message_content:
 *                 type: string
 *                 description: HTML message content of the campaign.
 *                 example: "<p><p><strong>Success Messages (Body Section)</strong></p><p><strong>hi,&nbsp;<span><span contenteditable=\"false\" class=\"e-mention-chip\"><a title=\"\">{{Name}}</a></span></span><span contenteditable=\"true\">&nbsp;</span></strong></p><p>Ignore this message only testing purpose&nbsp;</p><p>Enagekart.com<br></p></p><p class=\"temp-footer\">Thanks for supporting</p>"
 *               message_media:
 *                 type: string
 *                 description: Media attached to the message.
 *                 example: ""
 *               message_variables:
 *                 type: string
 *                 description: JSON string representing message variables.
 *                 example: "[{\"label\":\"{{Name}}\",\"value\":\"{{Name}}\",\"fallback\":\"\",\"isAttribute\":true}]"
 *               name:
 *                 type: string
 *                 description: Name of the template.
 *                 example: "no_media_template"
 *               segments_contacts:
 *                 type: string
 *                 description: JSON string representing contact segments.
 *                 example: "[83527]"
 *               templateId:
 *                 type: integer
 *                 description: ID of the template.
 *                 example: 1246
 *               time_zone:
 *                 type: string
 *                 description: Time zone of the campaign.
 *                 example: "GMT +5:30"
 *     responses:
 *       200:
 *         description: Successful campaign creation/update.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message_status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request - Missing or invalid fields.
 *       401:
 *         description: Unauthorized - Invalid or missing Bearer token.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /copyCampaign/{CampaignId}/{spid}:
 *   get:
 *     summary: Copy an existing campaign - Campaigns
 *     description: Creates a duplicate of an existing campaign using the provided Campaign ID and Service Provider ID.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CampaignId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the campaign to be copied.
 *         example: 1379
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *         description: The Service Provider ID associated with the campaign.
 *         example: 55
 *     responses:
 *       200:
 *         description: Successfully copied the campaign.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: object
 *                   properties:
 *                     fieldCount:
 *                       type: integer
 *                       example: 0
 *                     affectedRows:
 *                       type: integer
 *                       example: 1
 *                     insertId:
 *                       type: integer
 *                       example: 1380
 *                     serverStatus:
 *                       type: integer
 *                       example: 2
 *                     warningCount:
 *                       type: integer
 *                       example: 2
 *                     message:
 *                       type: string
 *                       example: "&Records: 1  Duplicates: 0  Warnings: 2"
 *       400:
 *         description: Bad request - Invalid CampaignId or spid.
 *       401:
 *         description: Unauthorized - Invalid or missing Bearer token.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /exitCampaign/{title}/{spid}/{Id}:
 *   get:
 *     summary: Check if a campaign with the given title exists - Campaigns
 *     description: Checks if a campaign with the specified title, service provider ID, and campaign ID already exists.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: The title of the campaign to check.
 *         example: "copy of TEstttg1"
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *         description: The Service Provider ID associated with the campaign.
 *         example: 55
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the campaign.
 *         example: 1380
 *     responses:
 *       200:
 *         description: Campaign check successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Campaign ready to add"
 *       400:
 *         description: Bad request - Invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: string
 *                   example: "Invalid campaign title or parameters."
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 error:
 *                   type: string
 *                   example: "Unauthorized access."
 *       404:
 *         description: Campaign not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: "Campaign not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "Internal server error occurred."
 */

