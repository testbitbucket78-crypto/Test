/**
 * @swagger
 * /getFilteredList:
 *   post:
 *     tags:
 *       - Contacts
 *     summary: Get filtered list of contacts - Contacts
 *     description: Retrieves a filtered list of contacts based on the provided `SP_ID` and query parameters.
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
 *                 type: string
 *                 example: "91"
 *                 description: Service Provider ID
 *               Query:
 *                 type: string
 *                 example: ""
 *                 description: Query for filtering contacts (optional)
 *     responses:
 *       200:
 *         description: Successfully retrieved filtered contacts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                   description: HTTP status code
 *                 IsFilteredList:
 *                   type: boolean
 *                   example: false
 *                   description: Indicates if filtering was applied
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       customerId:
 *                         type: integer
 *                         example: 83697
 *                         description: Unique customer ID
 *                       Name:
 *                         type: string
 *                         example: "anshul"
 *                         description: Contact name
 *                       Phone_number:
 *                         type: string
 *                         example: "918894436686"
 *                         description: Contact phone number
 *                       channel:
 *                         type: string
 *                         example: "WA Web"
 *                         description: Communication channel
 *                       OptInStatus:
 *                         type: string
 *                         example: "No"
 *                         description: Opt-in status of the contact
 *                       ContactOwner:
 *                         type: string
 *                         example: "Ayush Chauhan"
 *                         description: Owner of the contact
 *                       countryCode:
 *                         type: string
 *                         example: "IN +91"
 *                         description: Country code of the contact
 *                       tag_names:
 *                         type: string
 *                         example: ""
 *                         description: Tags associated with the contact
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-31T09:40:56.000Z"
 *                         description: Contact creation date
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: No data found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /addCustomContact:
 *   post:
 *     tags:
 *       - Contacts
 *     summary: Add or update a custom contact - Contacts
 *     description: Adds a new contact or updates an existing contact in the database. Handles cases for temporary or deleted contacts.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: string
 *                 description: The Service Provider ID associated with the contact.
 *                 example: "12345"
 *               result:
 *                 type: array
 *                 description: Array of objects containing contact field details.
 *                 items:
 *                   type: object
 *                   properties:
 *                     ActuallName:
 *                       type: string
 *                       description: The actual database column name for the field.
 *                       example: "Phone_number"
 *                     displayName:
 *                       type: string
 *                       description: The value to be inserted or updated for the field.
 *                       example: "9876543210"
 *             required:
 *               - SP_ID
 *               - result
 *     responses:
 *       200:
 *         description: Contact added or updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Contact updated successfully"
 *                 result:
 *                   type: object
 *                   description: Details of the added or updated contact.
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request due to missing or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Please add Name and Phone number"
 *                 status:
 *                   type: integer
 *                   example: 400
 *       409:
 *         description: Conflict due to an existing phone number.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Conflict error message.
 *                   example: "Phone number already exists"
 *                 status:
 *                   type: integer
 *                   example: 409
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 500
 *                 err:
 *                   type: object
 *                   description: Error details.
 */

/**
 * @swagger
 * /editCustomContact:
 *   post:
 *     tags:
 *       - Contacts
 *     summary: Edit an existing custom contact - Contacts
 *     description: Updates the details of a specific customer in the database and optionally logs interactions if triggered by an event.
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the customer.
 *         example: "45678"
 *       - in: query
 *         name: SP_ID
 *         required: true
 *         schema:
 *           type: string
 *         description: The Service Provider ID associated with the customer.
 *         example: "12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               result:
 *                 type: array
 *                 description: Array of objects containing contact field details to be updated.
 *                 items:
 *                   type: object
 *                   properties:
 *                     ActuallName:
 *                       type: string
 *                       description: The actual database column name to be updated.
 *                       example: "Phone_number"
 *                     displayName:
 *                       type: string
 *                       description: The updated value for the column.
 *                       example: "9876543210"
 *               event:
 *                 type: string
 *                 description: Event type triggering the update (e.g., 'teamBox').
 *                 example: "teamBox"
 *               action:
 *                 type: string
 *                 description: Action performed in response to the event.
 *                 example: "update"
 *               action_at:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp for the action performed.
 *                 example: "2024-11-28T10:30:00Z"
 *               action_by:
 *                 type: string
 *                 description: The user or system performing the action.
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Contact updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 200
 *                 result:
 *                   type: object
 *                   description: Details of the update operation.
 *       400:
 *         description: Bad request due to missing or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Invalid customerId or SP_ID"
 *                 status:
 *                   type: integer
 *                   example: 400
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 500
 */

/**
 * @swagger
 * /exportCheckedContact:
 *   post:
 *     tags:
 *       - Contacts
 *     summary: Export selected contacts as a CSV file - Contacts
 *     description: Processes and exports selected contact data into a CSV file, attaches it to an email, and sends it to the specified recipient.
 *     parameters:
 *       - in: query
 *         name: SP_ID
 *         required: true
 *         schema:
 *           type: string
 *         description: The Service Provider ID associated with the contacts.
 *         example: "12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *                 description: Array of contact details to be exported.
 *                 items:
 *                   type: object
 *                   properties:
 *                     contactField:
 *                       type: string
 *                       description: A field of the contact.
 *                       example: "John Doe"
 *               loginData:
 *                 type: string
 *                 description: Email address to send the exported CSV.
 *                 example: "user@example.com"
 *               Name:
 *                 type: string
 *                 description: Name of the recipient for personalization in the email.
 *                 example: "John"
 *     responses:
 *       200:
 *         description: Contacts exported and email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Confirmation message.
 *                   example: "Contacts exported successfully!"
 *       400:
 *         description: Bad request due to missing or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Invalid SP_ID or missing data array."
 *                 status:
 *                   type: integer
 *                   example: 400
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Unexpected error occurred."
 *                 status:
 *                   type: integer
 *                   example: 500
 */

/**
 * @swagger
 * /importContact:
 *   post:
 *     tags:
 *       - Contacts
 *     summary: Import and manage contacts - Contacts
 *     description: Allows adding, updating, or a combination of both for imported contacts. The operation is determined by the `purpose` field. 
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: array
 *                 description: List of specific fields to update (optional for adding new contacts).
 *                 items:
 *                   type: string
 *                   example: "email"
 *               importedData:
 *                 type: array
 *                 description: Array of contact data objects to import.
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       displayName:
 *                         type: string
 *                         description: The display name of the contact field.
 *                       ActuallName:
 *                         type: string
 *                         description: The actual name of the contact field.
 *               identifier:
 *                 type: string
 *                 description: Unique identifier to determine duplicate records, such as "Phone_number".
 *                 example: "Phone_number"
 *               purpose:
 *                 type: string
 *                 description: Specifies the operation type (Add, Update, or Both).
 *                 enum:
 *                   - Add new contact only
 *                   - Update Existing Contacts Only
 *                   - Add and Update Contacts
 *               SP_ID:
 *                 type: string
 *                 description: Service Provider ID for the operation.
 *                 example: "12345"
 *               emailId:
 *                 type: string
 *                 description: Email ID to send notifications after processing.
 *                 example: "user@example.com"
 *               user:
 *                 type: string
 *                 description: Username associated with the request.
 *                 example: "admin"
 *               messageOptIn:
 *                 type: string
 *                 description: Opt-in status for the contacts.
 *                 example: "true"
 *             required:
 *               - importedData
 *               - identifier
 *               - purpose
 *               - SP_ID
 *     responses:
 *       200:
 *         description: Contacts processed successfully based on the specified purpose.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Success message.
 *                   example: "Contact Added Successfully"
 *                 data:
 *                   type: object
 *                   description: Details of the processed contacts.
 *                   properties:
 *                     count:
 *                       type: integer
 *                       description: Number of new contacts added.
 *                       example: 5
 *                     updated:
 *                       type: integer
 *                       description: Number of existing contacts updated.
 *                       example: 3
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 200
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Error message.
 *                   example: "An unexpected error occurred."
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 500
 */

/**
 * @swagger
 * /getContactById:
 *   get:
 *     tags:
 *       - Contacts
 *     summary: Retrieve a contact by customer ID - Contacts
 *     description: Fetches details of a contact using `customerId` and `SP_ID`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 83697
 *         description: Unique customer ID
 *       - in: query
 *         name: SP_ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 91
 *         description: Service Provider ID
 *     responses:
 *       200:
 *         description: Successfully retrieved contact details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   customerId:
 *                     type: integer
 *                     example: 83697
 *                     description: Unique customer ID
 *                   Name:
 *                     type: string
 *                     example: "anshul"
 *                     description: Contact name
 *                   Phone_number:
 *                     type: string
 *                     example: "918894436686"
 *                     description: Contact phone number
 *                   channel:
 *                     type: string
 *                     example: "WA Web"
 *                     description: Communication channel
 *                   OptInStatus:
 *                     type: string
 *                     example: "No"
 *                     description: Opt-in status of the contact
 *                   ContactOwner:
 *                     type: string
 *                     example: "Ayush Chauhan"
 *                     description: Owner of the contact
 *                   countryCode:
 *                     type: string
 *                     example: "IN +91"
 *                     description: Country code of the contact
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-31T09:40:56.000Z"
 *                     description: Contact creation date
 *                   displayPhoneNumber:
 *                     type: string
 *                     example: "8894436686"
 *                     description: Display phone number without country code
 *                   status:
 *                     type: string
 *                     nullable: true
 *                     example: null
 *                     description: Contact status
 *                   tag_names:
 *                     type: string
 *                     example: ""
 *                     description: Tags associated with the contact
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /deletContact:
 *   post:
 *     tags:
 *       - Contacts
 *     summary: Delete a contact - Contacts
 *     description: Deletes a contact using `customerId` and `SP_ID`.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *                 example: 83929
 *                 description: Unique customer ID
 *               Phone_number:
 *                 type: string
 *                 example: "917876370388"
 *                 description: Contact phone number
 *               SP_ID:
 *                 type: integer
 *                 example: 91
 *                 description: Service Provider ID
 *     responses:
 *       200:
 *         description: Successfully deleted the contact.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 affectedRows:
 *                   type: integer
 *                   example: 1
 *                   description: Number of rows affected
 *                 changedRows:
 *                   type: integer
 *                   example: 1
 *                   description: Number of rows changed
 *                 message:
 *                   type: string
 *                   example: "(Rows matched: 1  Changed: 1  Warnings: 0)"
 *                   description: Status message from the database
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /blockedContact:
 *   post:
 *     tags:
 *       - Contacts
 *     summary: Block or unblock a contact - Contacts
 *     description: Updates the `isBlocked` status of a contact using `customerId` and `SP_ID`.
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
 *                 example: 1
 *                 description: Service Provider ID
 *               customerId:
 *                 type: integer
 *                 example: 1
 *                 description: Unique customer ID
 *               isBlocked:
 *                 type: integer
 *                 example: 1
 *                 description: Block status (1 for blocked, 0 for unblocked)
 *     responses:
 *       200:
 *         description: Successfully updated block status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 affectedRows:
 *                   type: integer
 *                   example: 1
 *                   description: Number of rows affected
 *                 changedRows:
 *                   type: integer
 *                   example: 1
 *                   description: Number of rows changed
 *                 message:
 *                   type: string
 *                   example: "(Rows matched: 1  Changed: 1  Warnings: 0)"
 *                   description: Status message from the database
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /exportCheckedContact:
 *   post:
 *     tags:
 *       - Contacts
 *     summary: Export selected contacts - Contacts
 *     description: Exports the checked contacts based on `SP_ID` and other parameters.
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
 *                 example: 91
 *                 description: Service Provider ID
 *               Channel:
 *                 type: string
 *                 example: "web"
 *                 description: Source channel of the export request
 *               Name:
 *                 type: string
 *                 example: "Ayush Chauhan"
 *                 description: Name of the user exporting contacts
 *               loginData:
 *                 type: string
 *                 example: "ayush168490@gmail.com"
 *                 description: Email of the logged-in user
 *               data:
 *                 type: array
 *                 description: List of selected contacts for export
 *                 items:
 *                   type: object
 *                   properties:
 *                     ID:
 *                       type: integer
 *                       example: 83697
 *                       description: Unique contact ID
 *                     Name:
 *                       type: string
 *                       example: "anshul"
 *                       description: Contact name
 *                     Phone Number:
 *                       type: string
 *                       example: "918894436686"
 *                       description: Contact phone number
 *                     Email:
 *                       type: string
 *                       example: ""
 *                       description: Contact email (if available)
 *                     Message Opt-in:
 *                       type: string
 *                       example: "No"
 *                       description: Opt-in status for messaging
 *                     Tag:
 *                       type: string
 *                       example: ""
 *                       description: Tag assigned to the contact
 *                     Date:
 *                       type: string
 *                       format: date
 *                       example: "2025-02-17"
 *                     Time:
 *                       type: string
 *                       example: "03:45"
 *                     TesMs:
 *                       type: string
 *                       example: "a"
 *                     TestN1:
 *                       type: string
 *                       example: "1"
 *                     TestS1:
 *                       type: string
 *                       example: "option1 "
 *                     TestSw1:
 *                       type: string
 *                       example: "Yes"
 *                     TestT1:
 *                       type: string
 *                       example: "1"
 *     responses:
 *       200:
 *         description: Contacts exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Contacts exported successfully!"
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /columns/{spid}:
 *   get:
 *     summary: Retrieve column information for a specific spid - Contacts
 *     tags:
 *       - Contacts
 *     parameters:
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: string
 *         example: "55"
 *         description: Service Provider ID to fetch column details.
 *     responses:
 *       200:
 *         description: Successfully retrieved column details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       displayName:
 *                         type: string
 *                         example: "Name"
 *                       ActuallName:
 *                         type: string
 *                         example: "Name"
 *       400:
 *         description: Bad request, invalid SP_ID.
 *       401:
 *         description: Unauthorized request.
 *       404:
 *         description: No columns found for the given SP_ID.
 *       500:
 *         description: Internal server error.
 */

