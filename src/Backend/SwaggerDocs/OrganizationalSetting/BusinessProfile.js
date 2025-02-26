/**
 * @swagger
 * /billingDetails/{spID}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve billing details for a service provider - Business Details
 *     description: Fetches the billing details such as address, email, and payment status for a given service provider ID.
 *     parameters:
 *       - in: path
 *         name: SP_ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service provider ID.
 *         example: 91
 *     responses:
 *       200:
 *         description: Billing details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "billingDetails got successfully !"
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 billingDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 37
 *                       SP_ID:
 *                         type: integer
 *                         example: 91
 *                       Address1:
 *                         type: string
 *                         example: "T esting spaces"
 *                       Address2:
 *                         type: string
 *                         example: "testing spaces 2."
 *                       City:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       State:
 *                         type: string
 *                         example: "Haryana"
 *                       Country:
 *                         type: string
 *                         example: "India"
 *                       zip_code:
 *                         type: integer
 *                         example: 171207
 *                       billing_email:
 *                         type: string
 *                         example: "ayush168490@gmail.com"
 *                       GSTId:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       InvoiceId:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       InvoiceDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       Invoice_status:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       PaymentDue_date:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       created_By:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       uid:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       plan_id:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       location:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-12T10:25:29.000Z"
 *       404:
 *         description: No billing details found for the service provider.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /companyDetail/{spID}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve company details for a service provider - Business Details
 *     description: Fetches company details such as name, website, industry, and phone number for a given service provider ID.
 *     parameters:
 *       - in: path
 *         name: SP_ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service provider ID.
 *         example: 91
 *     responses:
 *       200:
 *         description: Company details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "companyDetail got successfully !"
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 companyDetail:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 31
 *                       SP_ID:
 *                         type: integer
 *                         example: 91
 *                       Company_Name:
 *                         type: string
 *                         example: "test test"
 *                       Company_Website:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       Country:
 *                         type: string
 *                         example: "India"
 *                       Employees_count:
 *                         type: string
 *                         example: "11-50"
 *                       Industry:
 *                         type: string
 *                         example: "Education"
 *                       Phone_Number:
 *                         type: string
 *                         example: "8627019494"
 *                       country_code:
 *                         type: string
 *                         example: "IN +91"
 *                       profile_img:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       created_By:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-12T10:24:55.000Z"
 *       404:
 *         description: No company details found for the service provider.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /localDetails/{spID}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve localization details for a service provider - Business Details
 *     description: Fetches localization settings such as date format, time format, time zone, and currency for a given service provider ID.
 *     parameters:
 *       - in: path
 *         name: SP_ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service provider ID.
 *         example: 91
 *     responses:
 *       200:
 *         description: Localization details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "localDetails got successfully !"
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 localDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 56
 *                       SP_ID:
 *                         type: integer
 *                         example: 91
 *                       Date_Format:
 *                         type: string
 *                         example: "MMMM d, yyyy"
 *                       Time_Format:
 *                         type: string
 *                         example: "12"
 *                       Time_Zone:
 *                         type: string
 *                         example: "Asia/Calcutta"
 *                       Currency:
 *                         type: string
 *                         example: "INR"
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       created_By:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-21T06:15:12.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-09-09T06:30:11.000Z"
 *       404:
 *         description: No localization details found for the service provider.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /companyDetail:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Add or update company details - Business Details
 *     description: Creates or updates company information for a service provider.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: integer
 *                 description: Service provider ID.
 *                 example: 91
 *               Company_Name:
 *                 type: string
 *                 description: Name of the company.
 *                 example: "Stacknize Tech Pvt Ltd"
 *               Company_Website:
 *                 type: string
 *                 format: uri
 *                 description: Company website URL.
 *                 example: "https://stacknize.com"
 *               Country:
 *                 type: string
 *                 description: Country where the company is located.
 *                 example: "India"
 *               Employees_count:
 *                 type: string
 *                 description: Number of employees in the company.
 *                 example: "11-50"
 *               Industry:
 *                 type: string
 *                 description: Industry in which the company operates.
 *                 example: "Software Development"
 *               Phone_Number:
 *                 type: string
 *                 description: Contact phone number of the company.
 *                 example: "+91 9876543210"
 *               country_code:
 *                 type: string
 *                 description: Country code for the phone number.
 *                 example: "IN +91"
 *     responses:
 *       200:
 *         description: Company details saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Company details saved successfully!"
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request due to missing or invalid fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /billingDetails:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Add or update billing details - Business Details
 *     description: Creates or updates the billing details for a service provider.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: integer
 *                 description: Service provider ID.
 *                 example: 91
 *               Address1:
 *                 type: string
 *                 description: Primary billing address.
 *                 example: "123 Main Street"
 *               Address2:
 *                 type: string
 *                 description: Secondary billing address (optional).
 *                 example: "Suite 456"
 *               City:
 *                 type: string
 *                 description: City of the billing address.
 *                 example: "Gurgaon"
 *               State:
 *                 type: string
 *                 description: State of the billing address.
 *                 example: "Haryana"
 *               Country:
 *                 type: string
 *                 description: Country of the billing address.
 *                 example: "India"
 *               zip_code:
 *                 type: integer
 *                 description: ZIP code of the billing address.
 *                 example: 122018
 *               GSTId:
 *                 type: string
 *                 description: GST Identification Number.
 *                 example: "29ABCDE1234F1Z5"
 *               billing_email:
 *                 type: string
 *                 format: email
 *                 description: Email associated with the billing details.
 *                 example: "billing@example.com"
 *               InvoiceId:
 *                 type: string
 *                 nullable: true
 *                 description: Invoice ID for the billing record.
 *                 example: "INV-2024-001"
 *               InvoiceDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Date when the invoice was generated.
 *                 example: "2024-08-21"
 *               Invoice_status:
 *                 type: string
 *                 nullable: true
 *                 description: Status of the invoice.
 *                 example: "Paid"
 *               PaymentDue_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Due date for invoice payment.
 *                 example: "2024-09-15"
 *               plan_id:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of the subscribed plan.
 *                 example: 102
 *     responses:
 *       200:
 *         description: Billing details saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Billing details saved successfully!"
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request due to missing or invalid fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /billingDetails:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Add or update billing details - Business Details
 *     description: Creates or updates the billing details for a service provider.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: integer
 *                 description: Service provider ID.
 *                 example: 91
 *               Address1:
 *                 type: string
 *                 description: Primary billing address.
 *                 example: "T esting spaces"
 *               Address2:
 *                 type: string
 *                 description: Secondary billing address (optional).
 *                 example: "testing spaces 2."
 *               City:
 *                 type: string
 *                 nullable: true
 *                 description: City of the billing address.
 *                 example: "Gurgaon"
 *               State:
 *                 type: string
 *                 description: State of the billing address.
 *                 example: "Haryana"
 *               Country:
 *                 type: string
 *                 description: Country of the billing address.
 *                 example: "India"
 *               zip_code:
 *                 type: string
 *                 description: ZIP code of the billing address.
 *                 example: "171208"
 *               GSTId:
 *                 type: string
 *                 nullable: true
 *                 description: GST Identification Number.
 *                 example: "07AAEPM1234A1Z5"
 *               billing_email:
 *                 type: string
 *                 format: email
 *                 description: Email associated with the billing details.
 *                 example: "ayush168490@gmail.com"
 *               InvoiceId:
 *                 type: string
 *                 nullable: true
 *                 description: Invoice ID for the billing record.
 *                 example: "INV-20241112-001"
 *               InvoiceDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Date when the invoice was generated.
 *                 example: "2024-11-12"
 *               Invoice_status:
 *                 type: string
 *                 nullable: true
 *                 description: Status of the invoice.
 *                 example: "Pending"
 *               PaymentDue_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Due date for invoice payment.
 *                 example: "2024-12-01"
 *               plan_id:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of the subscribed plan.
 *                 example: 3
 *               uid:
 *                 type: integer
 *                 nullable: true
 *                 description: Unique ID of the user.
 *                 example: 101
 *               created_By:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of the user who created the record.
 *                 example: 5
 *               created_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Record creation timestamp.
 *                 example: "2024-08-21T06:15:12.000Z"
 *               updated_at:
 *                 type: string
 *                 format: date-time
 *                 description: Record last updated timestamp.
 *                 example: "2024-11-12T10:25:29.000Z"
 *               isDeleted:
 *                 type: integer
 *                 description: Deletion flag (0 = active, 1 = deleted).
 *                 example: 0
 *               location:
 *                 type: string
 *                 nullable: true
 *                 description: Location details.
 *                 example: "Gurgaon, India"
 *     responses:
 *       200:
 *         description: Billing details saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Billing details saved successfully!"
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request due to missing or invalid fields.
 *       500:
 *         description: Internal server error.
 */