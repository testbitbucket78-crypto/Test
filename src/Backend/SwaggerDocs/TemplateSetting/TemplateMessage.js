/**
 * @swagger
 * /getTemplate/{spid}/{isTemplate}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve templates based on service provider ID and template type - Template Messages
 *     description: Fetches templates based on the specified service provider ID (SP_ID) and whether they are templates (`isTemplate`).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service provider ID (SP_ID) to filter templates.
 *       - in: path
 *         name: isTemplate
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Flag to indicate if fetching templates (1) or other items (0).
 *     responses:
 *       200:
 *         description: Successful response with template data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 templates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ID:
 *                         type: integer
 *                         example: 1012
 *                       TemplateName:
 *                         type: string
 *                         example: "Template1"
 *                       Channel:
 *                         type: string
 *                         example: "WA Web"
 *                       Category:
 *                         type: string
 *                         example: "Marketing"
 *                       Language:
 *                         type: string
 *                         example: "English"
 *                       BodyText:
 *                         type: string
 *                         example: "<p>A<br>B C D E F G H I J K<br>BODY end&nbsp;</p>"
 *                       FooterText:
 *                         type: string
 *                         example: "Footer END"
 *                       isTemplate:
 *                         type: integer
 *                         example: 1
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-09T11:37:51.000Z"
 *       400:
 *         description: Invalid request (missing or incorrect parameters).
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /getTemplateForGallery/{spid}/{isTemplate}/{channel}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve gallery templates based on service provider, type, and channel - Template Messages
 *     description: Fetches templates for the gallery based on the service provider ID, template type, and channel.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *           example: 0
 *         description: Service provider ID (SP_ID) to filter templates.
 *       - in: path
 *         name: isTemplate
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [0, 1, 2]
 *           example: 2
 *         description: Template type (0 = None, 1 = Standard, 2 = Gallery).
 *       - in: path
 *         name: channel
 *         required: true
 *         schema:
 *           type: string
 *           example: "web"
 *         description: Channel for which templates are fetched (e.g., "web", "mobile").
 *     responses:
 *       200:
 *         description: Successful response with gallery templates.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 templates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ID:
 *                         type: integer
 *                         example: 1407
 *                       TemplateName:
 *                         type: string
 *                         example: "Personalized Discount Offer"
 *                       Channel:
 *                         type: string
 *                         example: "WA Web"
 *                       Category:
 *                         type: string
 *                         example: "Marketing"
 *                       Language:
 *                         type: string
 *                         example: "English"
 *                       BodyText:
 *                         type: string
 *                         example: "👋 Hello {{customer_Name}}! \n\nWe’ve got a special offer just for you! 🎉 Get {{discount_percentage}}% off on your next purchase of {{product_category}}."
 *                       FooterText:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       industry:
 *                         type: string
 *                         example: "Ecommerce"
 *                       isTemplate:
 *                         type: integer
 *                         example: 2
 *                       topic:
 *                         type: string
 *                         example: "Lead Gen"
 *       400:
 *         description: Invalid request (missing or incorrect parameters).
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /getFlows/{spid}:
 *   get:
 *     tags:
 *       - Settings 
 *     summary: Retrieve campaign flows for a specific service provider - Template Messages
 *     description: Fetches a list of campaign flows associated with the given service provider ID (SP_ID).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *           example: 91
 *         description: Service provider ID (SP_ID) to filter flows.
 *     responses:
 *       200:
 *         description: Successful response with a list of flows.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 flows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ID:
 *                         type: integer
 *                         example: 101
 *                       FlowName:
 *                         type: string
 *                         example: "Welcome Campaign"
 *                       Description:
 *                         type: string
 *                         example: "A flow designed to welcome new users."
 *                       CreatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-10T12:00:00.000Z"
 *                       UpdatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-12T14:30:00.000Z"
 *       400:
 *         description: Invalid request (missing or incorrect parameters).
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /addTemplate:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Add a new template - Template Messages
 *     description: Creates a new message template for a specified service provider.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - spid
 *               - TemplateName
 *               - Category
 *               - Channel
 *               - isTemplate
 *               - media_type
 *             properties:
 *               spid:
 *                 type: integer
 *                 example: 91
 *               TemplateName:
 *                 type: string
 *                 example: "heytest"
 *               Category:
 *                 type: string
 *                 example: "Marketing"
 *               Channel:
 *                 type: string
 *                 example: "WA Web"
 *               BodyText:
 *                 type: string
 *                 example: "<p>Hey Body&nbsp;</p>"
 *               FooterText:
 *                 type: string
 *                 example: "<em>null</em>"
 *               Header:
 *                 type: string
 *                 example: "hey Header"
 *               Language:
 *                 type: string
 *                 example: "English"
 *               categoryChange:
 *                 type: string
 *                 example: "Yes"
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               created_By:
 *                 type: string
 *                 example: "Ayush Chauhan"
 *               isTemplate:
 *                 type: integer
 *                 example: 1
 *               media_type:
 *                 type: string
 *                 example: "text"
 *               status:
 *                 type: string
 *                 example: "saved"
 *               template_json:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: []
 *     responses:
 *       200:
 *         description: Template successfully added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 addedtem:
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
 *                       example: 1648
 *                     serverStatus:
 *                       type: integer
 *                       example: 2
 *                     warningCount:
 *                       type: integer
 *                       example: 0
 *                     message:
 *                       type: string
 *                       example: ""
 *       400:
 *         description: Invalid request (missing or incorrect parameters).
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /deleteTemplates:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Delete a template - Template Messages
 *     description: Deletes a template based on the provided template ID.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID:
 *                 type: integer
 *                 description: ID of the template to be deleted
 *                 example: 1648
 *     responses:
 *       200:
 *         description: Template deleted successfully
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
 *                   example: "Template deleted successfully"
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /getTemplateForGallery/{spid}/{isTemplate}/{channel}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve templates for the gallery - Gallery
 *     description: Fetches a list of templates based on service provider ID, template type, and channel.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: spid
 *         in: path
 *         required: true
 *         description: Service provider ID
 *         schema:
 *           type: integer
 *           example: 0
 *       - name: isTemplate
 *         in: path
 *         required: true
 *         description: Template type identifier (e.g., 1 for active, 2 for draft, etc.)
 *         schema:
 *           type: integer
 *           example: 2
 *       - name: channel
 *         in: path
 *         required: true
 *         description: The communication channel (e.g., WA Web, Email, SMS)
 *         schema:
 *           type: string
 *           example: "web"
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 templates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ID:
 *                         type: integer
 *                         example: 1407
 *                       TemplateName:
 *                         type: string
 *                         example: "Personalized Discount Offer"
 *                       Channel:
 *                         type: string
 *                         example: "WA Web"
 *                       Category:
 *                         type: string
 *                         example: "Marketing"
 *                       BodyText:
 *                         type: string
 *                         example: "👋 Hello {{customer_Name}}! Get {{discount_percentage}}% off on {{product_category}}."
 *                       FooterText:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       Header:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       Language:
 *                         type: string
 *                         example: "English"
 *                       industry:
 *                         type: string
 *                         example: "Ecommerce"
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       isTemplate:
 *                         type: integer
 *                         example: 2
 *                       topic:
 *                         type: string
 *                         example: "Lead Gen"
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */