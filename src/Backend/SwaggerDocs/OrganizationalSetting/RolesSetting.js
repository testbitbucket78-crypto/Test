/**
 * @swagger
 * /rolesList/{spid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get roles list for a service provider - Roles Settings
 *     description: Retrieves the list of roles assigned to a specific service provider.
 *     parameters:
 *       - in: path
 *         name: SP_ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service provider ID.
 *         example: 148
 *     responses:
 *       200:
 *         description: Successfully retrieved roles list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Get roles list"
 *                 getRoles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       roleID:
 *                         type: integer
 *                         example: 635
 *                       SP_ID:
 *                         type: integer
 *                         example: 148
 *                       RoleName:
 *                         type: string
 *                         example: "Admin"
 *                       Privileges:
 *                         type: string
 *                         example: ""
 *                       subPrivileges:
 *                         type: string
 *                         example: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48"
 *                       defaultsubRights:
 *                         type: string
 *                         example: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48"
 *                       optRights:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       rights:
 *                         type: integer
 *                         example: 48
 *                       IsActive:
 *                         type: integer
 *                         example: 1
 *                       NoOfUser:
 *                         type: integer
 *                         example: 7
 *                       users_count:
 *                         type: integer
 *                         example: 0
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-30T06:10:41.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-30T06:10:41.000Z"
 *       400:
 *         description: Bad request due to missing or invalid SP_ID.
 *       404:
 *         description: No roles found for the given SP_ID.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /subrights:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get the list of subrights - Roles Settings
 *     description: Retrieves a list of all subrights available in the system.
 *     responses:
 *       200:
 *         description: Successfully retrieved the subrights list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Get subrights successfully !"
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 subRightRes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       rightsID:
 *                         type: integer
 *                         example: 1
 *                       subRights:
 *                         type: string
 *                         example: "Access Dashboard summary content"
 *                       accessRight:
 *                         type: integer
 *                         example: 1
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       visibilityStatus:
 *                         type: integer
 *                         example: 1
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-27T15:09:43.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /rights:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve the list of rights - Roles Settings
 *     description: Fetches all rights available in the system.
 *     responses:
 *       200:
 *         description: Successfully retrieved the rights list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Get Rights successfully !"
 *                 Rights:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       rightsName:
 *                         type: string
 *                         example: "Dashboard"
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       visibilityStatus:
 *                         type: integer
 *                         example: 1
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-06-16T11:35:27.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /addRole:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Add a new role - Roles Settings
 *     description: Creates a new role with specified privileges and sub-privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: integer
 *                 example: 148
 *               RoleName:
 *                 type: string
 *                 example: "TestRole1"
 *               roleID:
 *                 type: integer
 *                 example: 0
 *               Privileges:
 *                 type: string
 *                 example: ""
 *               subPrivileges:
 *                 type: string
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Role added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 SP_ID:
 *                   type: integer
 *                   example: 148
 *                 RoleName:
 *                   type: string
 *                   example: "TestRole1"
 *                 roleID:
 *                   type: integer
 *                   example: 0
 *                 Privileges:
 *                   type: string
 *                   example: ""
 *                 subPrivileges:
 *                   type: string
 *                   example: "1"
 *       400:
 *         description: Invalid request parameters.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /deleteRole/{roleID}/{spid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Delete a role by role ID and SP ID - Roles Settings
 *     description: Deletes a specific role based on its role ID and service provider (SP) ID.
 *     parameters:
 *       - in: path
 *         name: roleID
 *         required: true
 *         schema:
 *           type: integer
 *         example: 684
 *         description: The ID of the role to be deleted.
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *         example: 148
 *         description: The service provider ID associated with the role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: "Deleted Successfully"
 *                 deletedData:
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
 *                       example: 0
 *                     serverStatus:
 *                       type: integer
 *                       example: 2
 *                     warningCount:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Invalid request parameters.
 *       404:
 *         description: Role not found.
 *       500:
 *         description: Internal server error.
 */