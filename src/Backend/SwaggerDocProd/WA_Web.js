/**
 * @swagger
 * /sendMessage:
 *   post:
 *     summary: Send a message
 *     tags:
 *       - Messaging
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spNumber:
 *                 type: string
 *                 example: "911724610945"
 *               messageTo:
 *                 type: string
 *                 example: "91940000000000"
 *               headerText:
 *                 type: string
 *                 example: ""
 *               bodyText:
 *                 type: string
 *                 example: ""
 *               message_text:
 *                 type: string
 *                 example: "<p>Text Here: {{Name}}</p>"
 *               MessageVariables:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: "{{Name}}"
 *                     value:
 *                       type: string
 *                       example: "{{Name}}"
 *                     fallback:
 *                       type: string
 *                       example: ""
 *                     isFallback:
 *                       type: boolean
 *                       example: true
 *                 example:
 *                   - label: "{{Name}}"
 *                     value: "{{Name}}"
 *                     fallback: ""
 *                     isFallback: true
 *               message_type:
 *                 type: string
 *                 example: "text"
 *               isTemplate:
 *                 type: boolean
 *                 example: false
 *               templateDetails:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: ""
 *               language:
 *                 type: string
 *                 example: ""
 *               hasMedia:
 *                 type: boolean
 *                 example: false
 *                 description: "Indicates whether media is attached to the message."
 *               mediaDetails:
 *                 type: object
 *                 properties:
 *                   media_type:
 *                     type: string
 *                     example: "image/jpeg or video/mp4 etc."
 *                     description: Required if message_media is not "text"
 *                   message_media:
 *                     type: string
 *                     example: "https://example.com/image.jpg or https://example.com/video.mp4"
 *                     description: URL of the media file
 *                 description: Included only if message_media is not "text"
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 *  /v1/whatsapp/text:
 *   post:
 *     summary: Send a message - wrapper API
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageTo:
 *                 type: string
 *                 example: "91940000000000"
 *               message_text:
 *                 type: string
 *                 example: "<p>Text Here: {{Name}}</p>"
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /v1/whatsapp/media:
 *   post:
 *     summary: Send a message
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageTo:
 *                 type: string
 *                 example: "91940000000000"
 *               message_text:
 *                 type: string
 *                 example: "<p>Text Here: {{Name}}</p>"
 *               mediaDetails:
 *                 type: object
 *                 properties:
 *                   media_type:
 *                     type: string
 *                     example: "image/jpeg or video/mp4 etc."
 *                     description: Required if message_media is not "text"
 *                   message_media:
 *                     type: string
 *                     example: "https://example.com/image.jpg or https://example.com/video.mp4"
 *                     description: URL of the media file
 *                 description: Included only if message_media is not "text"
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /v1/whatsapp/getTemplateStatus:
 *   post:
 *     summary: Get the status of a specific template by name
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateName:
 *                 type: string
 *                 example: Order_Confirmation
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Successfully retrieved template status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 templateName:
 *                   type: string
 *                   example: Order_Confirmation
 *                 status:
 *                   type: string
 *                   example: Approved
 *       400:
 *         description: Bad Request - Missing or invalid data
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/whatsapp/getSessionStatus:
 *   post:
 *     summary: Get the latest inbound message time for a customer's most recent interaction
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *                 example: 95812
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Successfully retrieved session status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: object
 *                   properties:
 *                     lastInboundTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-05T10:15:30.000Z"
 *       400:
 *         description: Bad Request - Missing or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "customerId is required"
 *       404:
 *         description: No recent inbound message found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No recent inbound message found"
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/whatsapp/getContacts:
 *   post:
 *     summary: Get list of contacts for the current service provider
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Successfully fetched the contact list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contactList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       customerId:
 *                         type: integer
 *                         example: 95812
 *                       customerName:
 *                         type: string
 *                         example: John Doe
 *                       tag:
 *                         type: string
 *                         example: "1,2"
 *                       tag_names:
 *                         type: string
 *                         example: "Premium, Loyal"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-23T12:56:22.000Z"
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *       500:
 *         description: Internal Server Error - Something went wrong
 */

/**
 * @swagger
 * /v1/whatsapp/deleteContacts:
 *   post:
 *     summary: Delete one or more contacts by phone numbers
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumbers
 *               - apiKey
 *               - apiToken
 *             properties:
 *               phoneNumbers:
 *                 type: string
 *                 description: Comma-separated phone numbers to delete (including country code)
 *                 example: "917018934893,918627019494"
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Contacts successfully deleted
 *       400:
 *         description: Bad Request - Missing or invalid data
 *       404:
 *         description: No matching contacts found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/whatsapp/getUsers:
 *   post:
 *     summary: Retrieve a list of users
 *     tags:
 *       - Wrapper APIs
 *     description: Fetch all users from the system. Requires authentication via apiKey and apiToken.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Successfully retrieved list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                         example: 101
 *                       name:
 *                         type: string
 *                         example: Agent A
 *                       status:
 *                         type: string
 *                         example: online
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/whatsapp/getCustomFields:
 *   post:
 *     summary: Retrieve custom fields for the service provider
 *     tags:
 *       - Wrapper APIs
 *     responses:
 *       200:
 *         description: Successfully fetched custom fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fields:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fieldName:
 *                         type: string
 *                         example: "Email"
 *                       fieldType:
 *                         type: string
 *                         example: "text"
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/whatsapp/createContact:
 *   post:
 *     summary: Add a new custom contact
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 example: "TTest1"
 *               CountryCode:
 *                 type: string
 *                 example: "IN +91"
 *               Phone_number:
 *                 type: string
 *                 example: "91862701949"
 *               displayPhoneNumber:
 *                 type: string
 *                 example: "0862701949"
 *               emailId:
 *                 type: string
 *                 example: "ayush16849000@gmail.com"
 *               ContactOwner:
 *                 type: string
 *                 example: "Test"
 *               tag:
 *                 type: string
 *                 example: ""
 *               OptInStatus:
 *                 type: string
 *                 example: "Yes"
 *               column1:
 *                 type: string
 *                 example: "2025-06-23"
 *               column2:
 *                 type: string
 *                 example: "13:34"
 *               column3:
 *                 type: integer
 *                 example: 345324
 *               column4:
 *                 type: string
 *                 example: "234234"
 *               column5:
 *                 type: string
 *                 example: "542_0:option1"
 *               column6:
 *                 type: string
 *                 example: "No"
 *               column7:
 *                 type: string
 *                 example: "544_0:a"
 *               uid:
 *                 type: integer
 *                 example: 582
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Contact added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad Request – Payload issue
 *       500:
 *         description: Server Error – Unable to process the request
 */


/**
 * @swagger
 * /v1/whatsapp/updateContact:
 *   post:
 *     summary: Edit a custom contact
 *     tags:
 *       - Wrapper APIs
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 582
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 example: "TTest1"
 *               CountryCode:
 *                 type: string
 *                 example: "IN +91"
 *               Phone_number:
 *                 type: string
 *                 example: "91862701949"
 *               displayPhoneNumber:
 *                 type: string
 *                 example: "0862701949"
 *               emailId:
 *                 type: string
 *                 example: "ayush16849000@gmail.com"
 *               ContactOwner:
 *                 type: string
 *                 example: "Test"
 *               tag:
 *                 type: string
 *                 example: ""
 *               OptInStatus:
 *                 type: string
 *                 example: "Yes"
 *               column1:
 *                 type: string
 *                 example: "2025-06-23"
 *               column2:
 *                 type: string
 *                 example: "13:34"
 *               column3:
 *                 type: integer
 *                 example: 345324
 *               column4:
 *                 type: string
 *                 example: "234234"
 *               column5:
 *                 type: string
 *                 example: "542_0:option1"
 *               column6:
 *                 type: string
 *                 example: "No"
 *               column7:
 *                 type: string
 *                 example: "544_0:a"
 *               uid:
 *                 type: integer
 *                 example: 582
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Contact edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request – invalid payload
 *       500:
 *         description: Server error – failed to update contact
 */

/**
 * @swagger
 * /v1/whatsapp/createTemplatesBUTTON:
 *   post:
 *     summary: Create a new WHAPI template
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               TemplateName:
 *                 type: string
 *                 example: "tests11"
 *               Category:
 *                 type: string
 *                 example: "Marketing"
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               categoryChange:
 *                 type: string
 *                 example: "Yes"
 *               Language:
 *                 type: string
 *                 example: "English"
 *               Header:
 *                 type: string
 *                 example: "Header Text"
 *               BodyText:
 *                 type: string
 *                 example: "<p>Body Text</p>"
 *               FooterText:
 *                 type: string
 *                 example: "<em>Footer Text</em>"
 *               hasButtons:
 *                 type: boolean
 *                 example: true
 *               buttons:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [QUICK_REPLY, URL, PHONE, LIST_MESSAGE, COPY_BUTTON]
 *                       example: QUICK_REPLY, URL, PHONE, LIST_MESSAGE, COPY_BUTTON
 *                     buttonText:
 *                       type: string
 *                       example: "Click Me"
 *                     url:
 *                       type: string
 *                       example: "https://example.com"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+1234567890"
 *                     listOptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Option 1"
 *                           id:
 *                             type: string
 *                             example: "opt1"
 *                     copyCode:
 *                       type: string
 *                       example: "COPY123"
 *               Links:
 *                 type: string
 *                 example: ""
 *               media_type:
 *                 type: string
 *                 example: "text"
 *               created_By:
 *                 type: string
 *                 example: "EngageKart"
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Template created successfully
 *       400:
 *         description: Invalid payload
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /v1/whatsapp/createTemplatesWEB:
 *   post:
 *     summary: Create a new WhatsApp Web template
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               TemplateName:
 *                 type: string
 *                 example: "templateWeb01"
 *               Category:
 *                 type: string
 *                 example: "Marketing"
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               categoryChange:
 *                 type: string
 *                 example: "Yes"
 *               Language:
 *                 type: string
 *                 example: "English"
 *               Header:
 *                 type: string
 *                 example: "Header Text"
 *               BodyText:
 *                 type: string
 *                 example: "<p>This is body</p>"
 *               FooterText:
 *                 type: string
 *                 example: "<em>Footer Info</em>"
 *               Links:
 *                 type: string
 *                 example: "https://example.com"
 *               media_type:
 *                 type: string
 *                 example: "text"
 *               created_By:
 *                 type: string
 *                 example: "EngageZilla"
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Template created successfully
 *       400:
 *         description: Invalid payload
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /v1/whatsapp/sendTemplates:
 *   post:
 *     summary: Send an existing template message
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - TemplateName
 *             properties:
 *               TemplateName:
 *                 type: string
 *                 example: "testtemplatebtn1"
 *               messageTo:
 *                 type: string
 *                 example: "910000000000"
 *               buttonsVariable:
 *                 type: array
 *                 description: Button variables with value mapping
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: "https://www.amazon.in/"
 *                     value:
 *                       type: string
 *                       example: "{{Name}}"
 *                     Fallback:
 *                       type: string
 *                       example: ""
 *                     isAttribute:
 *                       type: boolean
 *                       example: true
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   description: Structured API response from sendMessageInstance
 *       400:
 *         description: Bad request or template not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /v1/whatsapp/sendInteractive:
 *   post:
 *     summary: Create a new template
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               TemplateName:
 *                 type: string
 *                 example: "tests11"
 *               Header:
 *                 type: string
 *                 example: "Header Text"
 *               BodyText:
 *                 type: string
 *                 example: "<p>Body Text</p>"
 *               FooterText:
 *                 type: string
 *                 example: "<em>Footer Text</em>"
 *               messageTo:
 *                 type: string
 *                 description: WhatsApp number of the recipient in international format (e.g., 919876543210)
 *                 example: "919876543210"
 *               hasButtons:
 *                 type: boolean
 *                 example: true
 *               buttons:
 *                 type: array
 *                 description: Only required if hasButtons is true
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [QUICK_REPLY, URL, PHONE, COUPON_CODE, FLOW]
 *                       example: QUICK_REPLY, URL, PHONE, COUPON_CODE, FLOW
 *                     buttonText:
 *                       type: string
 *                       description: Required for QUICK_REPLY
 *                       example: "Quick Response"
 *                     url:
 *                       type: string
 *                       description: Required for URL button type
 *                       example: "https://example.com"
 *                     CountryCode:
 *                       type: string
 *                       description: Required for PHONE button type
 *                       example: "IN +91"
 *                     phoneNumber:
 *                       type: string
 *                       description: Required for PHONE button type
 *                       example: "+1234567890"
 *                     couponCode:
 *                       type: string
 *                       description: Required for COUPON_CODE button type
 *                       example: "DISCOUNT50"
 *                     flowId:
 *                       type: string
 *                       description: Required for FLOW button type
 *                       example: "flow_abc123"
 *               Links:
 *                 type: string
 *                 example: ""
 *               media_type:
 *                 type: string
 *                 example: "text"
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Template created successfully
 *       400:
 *         description: Invalid payload
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /v1/whatsapp/getMessages:
 *   post:
 *     summary: Get all messages for a customer based on phone number
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNo:
 *                 type: string
 *                 example: "917018934893"
 *                 description: The phone number of the customer whose messages need to be fetched.
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 101
 *                       interaction_id:
 *                         type: integer
 *                         example: 6838
 *                       message:
 *                         type: string
 *                         example: "Hello! How can I help you?"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-01T10:23:54.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Customer not found"
 */

/**
 * @swagger
 * /v1/whatsapp/getTemplates:
 *   post:
 *     summary: Fetch WhatsApp templates for the given service provider
 *     tags:
 *       - Wrapper APIs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apiKey
 *               - apiToken
 *             properties:
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *               apiToken:
 *                 type: string
 *                 example: "yfn1k1j1xuvxpi3f3wp9hfjbrqk3tilm"
 *     responses:
 *       200:
 *         description: Templates fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 templates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Order_Confirmation
 *                       language:
 *                         type: string
 *                         example: en
 *                       status:
 *                         type: string
 *                         example: APPROVED
 *                       category:
 *                         type: string
 *                         example: UTILITY
 *       404:
 *         description: No templates found
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
 *                   example: Template not found
 *       500:
 *         description: Internal server error
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
 *                   example: Database query error
 */