const Payment = require('../models/Payment');
const axios = require('axios');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

/**
 * @swagger
 * /api/payments/initialize:
 *   post:
 *     summary: Initialize payment with Paystack
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentType
 *               - description
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in kobo (NGN * 100)
 *               paymentType:
 *                 type: string
 *                 enum: [tuition, accommodation, library, other]
 *               description:
 *                 type: string
 *               currency:
 *                 type: string
 *                 default: NGN
 *     responses:
 *       201:
 *         description: Payment initialized successfully
 */
const initializePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { amount, paymentType, description, currency = 'NGN' } = req.body;
    const studentId = req.user._id;

    // Create payment record
    const payment = new Payment({
      student: studentId,
      amount: amount * 100, // Convert to kobo
      currency,
      paymentType,
      description,
      department: req.user.department,
      status: 'pending'
    });

    await payment.save();

    // Initialize Paystack transaction
    const paystackData = {
      amount: amount * 100, // Paystack expects amount in kobo
      email: req.user.email,
      reference: `UMaT_${payment._id}`,
      callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
      metadata: {
        payment_id: payment._id.toString(),
        student_id: studentId.toString(),
        payment_type: paymentType,
        department: req.user.department
      }
    };

    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (paystackResponse.data.status) {
      // Update payment with Paystack reference
      payment.paystackReference = paystackResponse.data.data.reference;
      payment.paystackAccessCode = paystackResponse.data.data.access_code;
      await payment.save();

      res.status(201).json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          payment: payment,
          paystack: paystackResponse.data.data
        }
      });
    } else {
      throw new Error('Paystack initialization failed');
    }
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing payment'
    });
  }
};

/**
 * @swagger
 * /api/payments/verify/{reference}:
 *   get:
 *     summary: Verify payment with Paystack
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Paystack transaction reference
 *     responses:
 *       200:
 *         description: Payment verification result
 */
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (paystackResponse.data.status) {
      const transaction = paystackResponse.data.data;
      
      // Find payment by reference
      const payment = await Payment.findOne({ paystackReference: reference });
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Update payment status based on Paystack response
      if (transaction.status === 'success') {
        await payment.markSuccessful(transaction);
      } else if (transaction.status === 'failed') {
        await payment.markFailed(transaction);
      } else {
        await payment.markAbandoned();
      }

      res.json({
        success: true,
        message: 'Payment verification completed',
        data: {
          payment: payment,
          paystack: transaction
        }
      });
    } else {
      throw new Error('Paystack verification failed');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
};

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Paystack webhook handler
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
const handleWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    // Verify webhook signature
    const signature = req.headers['x-paystack-signature'];
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== hash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Find payment by reference
    const payment = await Payment.findOne({ paystackReference: data.reference });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Handle different events
    switch (event) {
      case 'charge.success':
        await payment.markSuccessful(data);
        break;
      case 'charge.failed':
        await payment.markFailed(data);
        break;
      case 'transfer.failed':
        await payment.markFailed(data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook'
    });
  }
};

/**
 * @swagger
 * /api/payments/my-payments:
 *   get:
 *     summary: Get student's payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *       - in: query
 *         name: paymentType
 *         schema:
 *           type: string
 *         description: Filter by payment type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: Student's payment history
 */
const getMyPayments = async (req, res) => {
  try {
    const { status, paymentType, startDate, endDate } = req.query;
    const filters = { status, paymentType, startDate, endDate };

    const payments = await Payment.getByStudent(req.user._id, filters);

    res.json({
      success: true,
      data: payments,
      count: payments.length
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments'
    });
  }
};

/**
 * @swagger
 * /api/payments/by-department:
 *   get:
 *     summary: Get payments by department (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *         description: Department to filter payments
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *       - in: query
 *         name: paymentType
 *         schema:
 *           type: string
 *         description: Filter by payment type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: Payments by department
 */
const getPaymentsByDepartment = async (req, res) => {
  try {
    const { department } = req.query;
    const { status, paymentType, startDate, endDate } = req.query;
    const filters = { status, paymentType, startDate, endDate };

    const payments = await Payment.getByDepartment(department, filters);

    res.json({
      success: true,
      data: payments,
      count: payments.length
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments'
    });
  }
};

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Get payment statistics (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *       - in: query
 *         name: paymentType
 *         schema:
 *           type: string
 *         description: Filter by payment type
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: Payment statistics
 */
const getPaymentStats = async (req, res) => {
  try {
    const { status, paymentType, department, startDate, endDate } = req.query;
    const filters = { status, paymentType, department, startDate, endDate };

    const stats = await Payment.getPaymentStats(filters);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics'
    });
  }
};

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 */
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('student', 'firstName lastName referenceNumber department program level');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment'
    });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getMyPayments,
  getPaymentsByDepartment,
  getPaymentStats,
  getPaymentById
}; 