/**
 * @swagger
 * /getCustomField/{spid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve custom fields by SP_ID - Custom Fields
 *     description: Fetches a list of custom fields associated with a specific service provider ID (SP_ID).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *         example: 148
 *         description: Service provider ID to retrieve custom fields for.
 *     responses:
 *       200:
 *         description: Successfully retrieved the custom field list.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               getfields:
 *                 - id: 0
 *                   displayName: "Name"
 *                   ActuallName: "Name"
 *                   type: "Text"
 *                   mandatory: 1
 *                   status: 1
 *                   created: ""
 *                   updated: ""
 *                   dataTypeValues: ""
 *                   description: ""
 *                 - id: 0
 *                   displayName: "Phone Number"
 *                   ActuallName: "Phone_number"
 *                   type: "Number"
 *                   mandatory: 1
 *                   status: 1
 *                   created: ""
 *                   updated: ""
 *                   dataTypeValues: ""
 *                   description: ""
 *                 - id: 0
 *                   displayName: "Email"
 *                   ActuallName: "emailId"
 *                   type: "Text"
 *                   mandatory: 0
 *                   status: 1
 *                   created: ""
 *                   updated: ""
 *                   dataTypeValues: ""
 *                   description: ""
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
 *         description: No custom fields found for the provided SP_ID.
 *         content:
 *           application/json:
 *             example:
 *               msg: "No custom fields found"
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
 * /enableMandatory:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Enable or disable mandatory status of a field - Custom Fields
 *     description: Updates the mandatory status of a custom field by its ID.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             id: 575
 *             Mandatory: 0
 *     responses:
 *       200:
 *         description: Successfully updated the mandatory status.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               mandatoryfield:
 *                 fieldCount: 0
 *                 affectedRows: 1
 *                 insertId: 0
 *                 serverStatus: 2
 *                 warningCount: 0
 *                 changedRows: 1
 *                 message: "(Rows matched: 1  Changed: 1  Warnings: 0"
 *                 protocol41: true
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
 *         description: Field not found.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Field not found"
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
 * /enableStatus:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Enable or disable the status of a field - Custom Fields
 *     description: Updates the status of a custom field by its ID.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             id: 575
 *             Status: 0
 *     responses:
 *       200:
 *         description: Successfully updated the status.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               enableStatus:
 *                 fieldCount: 0
 *                 affectedRows: 1
 *                 insertId: 0
 *                 serverStatus: 2
 *                 warningCount: 0
 *                 changedRows: 1
 *                 message: "(Rows matched: 1  Changed: 1  Warnings: 0"
 *                 protocol41: true
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
 *         description: Field not found.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Field not found"
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
 * /editCustomField:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Edit an existing custom field - Custom Fields
 *     description: Updates a custom field with new details including column name, type, description, and values.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             id: 576
 *             SP_ID: 148
 *             ColumnName: "Multiselect"
 *             Type: "Multi Select"
 *             description: "h"
 *             values:
 *               - id: 0
 *                 optionName: "sunday"
 *               - id: 1
 *                 optionName: "monday"
 *               - id: 2
 *                 optionName: "tuesday"
 *     responses:
 *       200:
 *         description: Successfully updated the custom field.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               editedField:
 *                 fieldCount: 0
 *                 affectedRows: 1
 *                 insertId: 0
 *                 serverStatus: 2
 *                 warningCount: 0
 *                 changedRows: 1
 *                 message: "(Rows matched: 1  Changed: 1  Warnings: 0"
 *                 protocol41: true
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
 *         description: Custom field not found.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Custom field not found"
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
 * /deleteCustomField/{id}/{spid}:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Delete a custom field by ID and SP_ID - Custom Fields
 *     description: Deletes a custom field by its ID and Service Provider ID (SP_ID).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the custom field to delete.
 *         example: 580
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *         description: The Service Provider ID associated with the custom field.
 *         example: 148
 *     responses:
 *       200:
 *         description: Successfully deleted the custom field.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               deleteField:
 *                 fieldCount: 0
 *                 affectedRows: 1
 *                 insertId: 0
 *                 serverStatus: 2
 *                 warningCount: 0
 *                 changedRows: 1
 *                 message: "(Rows matched: 1  Changed: 1  Warnings: 0"
 *                 protocol41: true
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
 *         description: Custom field not found.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Custom field not found"
 *               status: 404
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal server error"
 *               status: 500
 */