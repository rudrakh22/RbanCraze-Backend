// const mongoose = require('mongoose');
// const crypto = require('crypto');
// const axios = require('axios');
// const Order = require('../models/Order');
// const OrderItem = require('../models/OrderItem');
// const Payment = require('../models/Payment');

// // PhonePe Configuration (Add to .env)
// const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
// const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
// const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
// const PHONEPE_BASE_URL = 'https://api.phonepe.com/apis/hermes';

// // Helper to generate transaction ID
// const generateTransactionId = () => `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

// // Helper to generate checksum
// const generateChecksum = (payload, endpoint) => {
//     const string = payload + endpoint + PHONEPE_SALT_KEY;
//     return crypto.createHash('sha256').update(string).digest('hex') + `###${PHONEPE_SALT_INDEX}`;
// };

// exports.createOrder = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const userId = req.user._id;
//         const { items, address_id, payment_method, phone } = req.body;

//         // Validate inputs
//         if (!items?.length) throw new Error('Order items required');
//         if (!address_id) throw new Error('Address required');
//         if (!['cod', 'phonepe'].includes(payment_method)) throw new Error('Invalid payment method');
//         if (payment_method === 'phonepe' && !phone) throw new Error('Phone number required');

//         // Create Order Items
//         let total = 0;
//         const orderItems = await OrderItem.insertMany(items.map(item => ({
//         product_id: item.product_id,
//         quantity: item.quantity,
//         price_at_order_time: item.price,
//         variant: item.variant
//         })), { session });

//         // Calculate total
//         total = orderItems.reduce((sum, item) => sum + (item.price_at_order_time * item.quantity), 0);

//         // Create Order
//         const order = new Order({
//         user_id: userId,
//         items: orderItems.map(item => item._id),
//         totalPrice: total,
//         address_id,
//         orderStatus: 'pending',
//         deliveryStatus: 'processing'
//         });
//         await order.save({ session });

//         // Handle Payment
//         if (payment_method === 'phonepe') {
//         // PhonePe Payment Flow
//         const merchantTransactionId = generateTransactionId();
//         const amountInPaise = total * 100;

//         const payload = {
//             merchantId: PHONEPE_MERCHANT_ID,
//             merchantTransactionId,
//             merchantUserId: `USER_${userId}`,
//             amount: amountInPaise,
//             mobileNumber: phone,
//             redirectUrl: `${process.env.BASE_URL}/api/payments/callback/${merchantTransactionId}`,
//             redirectMode: 'POST',
//             paymentInstrument: { type: 'PAY_PAGE' }
//         };

//         const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
//         const xVerify = generateChecksum(payloadBase64, '/pg/v1/pay');

//         // Initiate PhonePe Payment
//         const response = await axios.post(`${PHONEPE_BASE_URL}/pg/v1/pay`, 
//             { request: payloadBase64 },
//             { headers: { 'Content-Type': 'application/json', 'X-VERIFY': xVerify } }
//         );

//         // Create Payment Record
//         await Payment.create([{
//             order_id: order._id,
//             payment_method: 'phonepe',
//             transaction_id: merchantTransactionId,
//             status: 'pending',
//             amount: total
//         }], { session });

//         await session.commitTransaction();
        
//         return res.status(200).json({
//             success: true,
//             paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
//             orderId: order._id
//         });
//         } 
//         else {
//         // COD Flow
//         await Payment.create([{
//             order_id: order._id,
//             payment_method: 'cash_on_delivery',
//             transaction_id: `COD_${order._id}`,
//             status: 'pending',
//             amount: total
//         }], { session });

//         await session.commitTransaction();
        
//         return res.status(201).json({
//             success: true,
//             message: 'COD order created',
//             orderId: order._id
//         });
//         }
//     } catch (error) {
//         await session.abortTransaction();
//         console.error('Order creation error:', error);
//         return res.status(500).json({ 
//         success: false,
//         message: error.message 
//     });
//     } finally {
//         session.endSession();
//     }
// };

// // PhonePe Callback Handler
// exports.handlePhonePeCallback = async (req, res) => {
//     try {
//         const { merchantTransactionId } = req.params;
//         const endpoint = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`;
        
//         // Verify checksum
//         const xVerify = generateChecksum('', endpoint);
        
//         const response = await axios.get(`${PHONEPE_BASE_URL}${endpoint}`, {
//         headers: { 
//             'Content-Type': 'application/json',
//             'X-VERIFY': xVerify,
//             'X-MERCHANT-ID': PHONEPE_MERCHANT_ID 
//         }
//         });

//         const paymentStatus = response.data.code === 'PAYMENT_SUCCESS' ? 'completed' : 'failed';
        
//         // Update Payment
//         await Payment.findOneAndUpdate(
//         { transaction_id: merchantTransactionId },
//         { status: paymentStatus, payment_date: Date.now() }
//         );

//         // Update Order
//         await Order.findOneAndUpdate(
//         { _id: (await Payment.findOne({ transaction_id: merchantTransactionId })).order_id },
//         { orderStatus: paymentStatus === 'completed' ? 'confirmed' : 'failed' }
//         );

//         return res.send(`<h1>Payment ${paymentStatus.toUpperCase()}</h1>`);
        
//     } catch (error) {
//         console.error('Callback error:', error);
//         return res.status(500).send('Payment verification failed');
//     }
// };
