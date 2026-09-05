/**
 * ChargeGuard AI - Realistic Merchant Demo Transaction Dataset
 * 
 * Contains 32+ diverse Indian e-commerce / payment transactions with realistic
 * customer profiles, INR currency values, payment gateways (Razorpay, PayU, Cashfree),
 * and varied risk indicators.
 */

import { Transaction } from '../types';
import { evaluateTransaction } from '../services/riskEngine';

const rawTransactions: Transaction[] = [
  {
    id: 'txn_in_984102',
    orderId: 'ord_ind_84719',
    amountINR: 134990,
    currency: 'INR',
    timestamp: '2026-08-30T07:45:12.000Z',
    customer: {
      name: 'Rohan Deshmukh',
      email: 'rohan.d.temporary99@mailtemp.in',
      phone: '9845012399',
      accountAgeDays: 1,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 1,
      pastDisputeRate: 100,
      ipAddress: '185.220.101.5',
      locationCity: 'Mumbai',
      locationState: 'Maharashtra',
      locationCountry: 'India',
      deviceFingerprint: 'fp_untrusted_88a91c',
      deviceType: 'Unknown/Emulated',
      isVpnProxy: true
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '8821',
      cardIssuerBank: 'HDFC Bank',
      authStatus3DS: 'ATTEMPTED_ONLY',
      gatewayRefId: 'pay_Hdfc_998124',
      arnRrn: 'ARN749201948201',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Flat 402, Sea Breeze Apts, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Near Railway Station Locker 4B, Surat',
      city: 'Surat',
      state: 'Gujarat',
      postalCode: '395003',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_1',
        title: 'Apple iPhone 16 Pro Max (256GB - Desert Titanium)',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 134990,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'PENDING_FULFILLMENT',
    velocity: {
      txnsLast1Hour: 3,
      txnsLast24Hours: 5,
      failedAttemptsLast24h: 4,
      deviceSwitchesLast7Days: 4
    },
    chargebackDispute: {
      isDisputed: true,
      disputeId: 'DISP-MUM-104-984',
      disputeReasonCode: '10.4',
      disputeReasonName: 'Other Fraud: Card-Absent Environment / Stolen Credentials',
      disputeFiledAt: '2026-08-30T08:10:00.000Z',
      claimAmountINR: 134990,
      gatewayDeadline: '2026-09-06T23:59:59.000Z',
      status: 'OPEN'
    },
    status: 'CHARGEBACK_DISPUTED',
    riskScore: 0,
    riskLevel: 'HIGH',
    riskFactors: [],
    recommendedAction: 'MANUAL_VERIFICATION',
    actionReason: ''
  },
  {
    id: 'txn_in_984103',
    orderId: 'ord_ind_84720',
    amountINR: 4299,
    currency: 'INR',
    timestamp: '2026-08-30T07:22:04.000Z',
    customer: {
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '9820194821',
      accountAgeDays: 420,
      totalPastOrders: 14,
      totalPastSpentINR: 64200,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '157.48.210.12',
      locationCity: 'Bengaluru',
      locationState: 'Karnataka',
      locationCountry: 'India',
      deviceFingerprint: 'fp_ios_safari_7721',
      deviceType: 'Mobile (iOS)',
      isVpnProxy: false
    },
    payment: {
      method: 'UPI',
      upiVpa: 'priya.sharma@okhdfcbank',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Upi_882914',
      arnRrn: 'RRN94820194812',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: '12th Main, 4th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      country: 'India'
    },
    shippingAddress: {
      line1: '12th Main, 4th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_2',
        title: 'FabIndia Pure Chanderi Silk Kurta & Dupatta Set',
        category: 'Apparel & Fashion',
        quantity: 1,
        unitPriceINR: 4299,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'IN_TRANSIT',
    proofOfDelivery: {
      carrier: 'BlueDart',
      trackingNumber: 'BLU-88291482',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984104',
    orderId: 'ord_ind_84721',
    amountINR: 89900,
    currency: 'INR',
    timestamp: '2026-08-30T06:50:30.000Z',
    customer: {
      name: 'Aditya Sen',
      email: 'aditya.sen91@rediffmail.com',
      phone: '9903128491',
      accountAgeDays: 4,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '103.21.144.92',
      locationCity: 'Kolkata',
      locationState: 'West Bengal',
      locationCountry: 'India',
      deviceFingerprint: 'fp_win_chrome_901a',
      deviceType: 'Desktop (Windows)',
      isVpnProxy: false
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Mastercard',
      cardLast4: '3104',
      cardIssuerBank: 'ICICI Bank',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Icici_771920',
      arnRrn: 'ARN89201948102',
      paymentGateway: 'PayU'
    },
    billingAddress: {
      line1: 'Ballygunge Circular Road, Flat 3B',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700019',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Hostel Block 3, Salt Lake Sector 5',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700091',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_3',
        title: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera Body',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 89900,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'PENDING_FULFILLMENT',
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 2,
      failedAttemptsLast24h: 2,
      deviceSwitchesLast7Days: 1
    },
    status: 'UNDER_VERIFICATION',
    riskScore: 0,
    riskLevel: 'MEDIUM',
    riskFactors: [],
    recommendedAction: 'MANUAL_VERIFICATION',
    actionReason: ''
  },
  {
    id: 'txn_in_984105',
    orderId: 'ord_ind_84722',
    amountINR: 1999,
    currency: 'INR',
    timestamp: '2026-08-30T06:15:18.000Z',
    customer: {
      name: 'Kavita Menon',
      email: 'kavita.menon@outlook.com',
      phone: '9447192841',
      accountAgeDays: 680,
      totalPastOrders: 28,
      totalPastSpentINR: 122400,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '117.204.88.19',
      locationCity: 'Kochi',
      locationState: 'Kerala',
      locationCountry: 'India',
      deviceFingerprint: 'fp_mac_chrome_1048',
      deviceType: 'Desktop (Mac)',
      isVpnProxy: false
    },
    payment: {
      method: 'NETBANKING',
      bankName: 'State Bank of India',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Sbi_192841',
      arnRrn: 'RRN48291048190',
      paymentGateway: 'Cashfree'
    },
    billingAddress: {
      line1: 'Panampilly Nagar, House No 44',
      city: 'Kochi',
      state: 'Kerala',
      postalCode: '682036',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Panampilly Nagar, House No 44',
      city: 'Kochi',
      state: 'Kerala',
      postalCode: '682036',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_4',
        title: 'Organic Malabar Spices & Filter Coffee Beans Hamper',
        category: 'Groceries & Essentials',
        quantity: 1,
        unitPriceINR: 1999,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'DELIVERED',
    proofOfDelivery: {
      carrier: 'Delhivery',
      trackingNumber: 'DEL-88492019',
      signedBy: 'Kavita Menon',
      deliveredAt: '2026-08-29T14:30:00.000Z',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984106',
    orderId: 'ord_ind_84723',
    amountINR: 75000,
    currency: 'INR',
    timestamp: '2026-08-30T05:40:55.000Z',
    customer: {
      name: 'Vikram Choudhary',
      email: 'vikram.choudhary.invest@proton.me',
      phone: '9811092834',
      accountAgeDays: 0,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 2,
      pastDisputeRate: 100,
      ipAddress: '45.154.255.8',
      locationCity: 'New Delhi',
      locationState: 'Delhi',
      locationCountry: 'India',
      deviceFingerprint: 'fp_emulator_android_91',
      deviceType: 'Unknown/Emulated',
      isVpnProxy: true
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'RuPay',
      cardLast4: '9901',
      cardIssuerBank: 'SBI Cards',
      authStatus3DS: 'CHALLENGED_FAILED',
      gatewayRefId: 'pay_Sbi_failed_991',
      arnRrn: 'ARN99019284102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Connaught Place, Regal Building 12',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Sector 62, Commercial Warehouse Unit 4',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201309',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_5',
        title: 'Tanishq 24 Karat (999.9) Gold Coin 10g with Tamper-Proof Assay',
        category: 'Jewelry & Gold',
        quantity: 1,
        unitPriceINR: 75000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'PENDING_FULFILLMENT',
    velocity: {
      txnsLast1Hour: 4,
      txnsLast24Hours: 7,
      failedAttemptsLast24h: 5,
      deviceSwitchesLast7Days: 3
    },
    chargebackDispute: {
      isDisputed: true,
      disputeId: 'DISP-DEL-4837-105',
      disputeReasonCode: '4837',
      disputeReasonName: 'Mastercard / RuPay: No Cardholder Authorization / Suspected Friendly Fraud',
      disputeFiledAt: '2026-08-30T07:15:00.000Z',
      claimAmountINR: 75000,
      gatewayDeadline: '2026-09-07T23:59:59.000Z',
      status: 'OPEN'
    },
    status: 'BLOCKED',
    riskScore: 0,
    riskLevel: 'HIGH',
    riskFactors: [],
    recommendedAction: 'MANUAL_VERIFICATION',
    actionReason: ''
  },
  {
    id: 'txn_in_984107',
    orderId: 'ord_ind_84724',
    amountINR: 24999,
    currency: 'INR',
    timestamp: '2026-08-30T04:30:10.000Z',
    customer: {
      name: 'Ananya Roy',
      email: 'ananya.roy@tcs.com',
      phone: '9830192841',
      accountAgeDays: 180,
      totalPastOrders: 6,
      totalPastSpentINR: 48000,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '115.110.244.18',
      locationCity: 'Hyderabad',
      locationState: 'Telangana',
      locationCountry: 'India',
      deviceFingerprint: 'fp_ios_safari_5541',
      deviceType: 'Mobile (iOS)',
      isVpnProxy: false
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '4192',
      cardIssuerBank: 'Axis Bank',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Axis_881920',
      arnRrn: 'ARN48102948102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Hitec City, Madhapur, Flat 601',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500081',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Hitec City, Madhapur, Flat 601',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500081',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_6',
        title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 24999,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'DELIVERED',
    proofOfDelivery: {
      carrier: 'Delhivery',
      trackingNumber: 'DEL-99182941',
      signedBy: 'Ananya Roy',
      deliveredAt: '2026-08-28T16:45:00.000Z',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984108',
    orderId: 'ord_ind_84725',
    amountINR: 48500,
    currency: 'INR',
    timestamp: '2026-08-30T03:14:22.000Z',
    customer: {
      name: 'Sameer Qureshi',
      email: 'sam.qureshi.deals@gmail.com',
      phone: '9717192841',
      accountAgeDays: 8,
      totalPastOrders: 1,
      totalPastSpentINR: 1200,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '182.73.241.10',
      locationCity: 'Jaipur',
      locationState: 'Rajasthan',
      locationCountry: 'India',
      deviceFingerprint: 'fp_win_edge_3301',
      deviceType: 'Desktop (Windows)',
      isVpnProxy: false
    },
    payment: {
      method: 'EMI',
      cardNetwork: 'Mastercard',
      cardLast4: '5519',
      cardIssuerBank: 'Kotak Mahindra Bank',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Kotak_772819',
      arnRrn: 'ARN88492019481',
      paymentGateway: 'PayU'
    },
    billingAddress: {
      line1: 'C-Scheme, Ashok Nagar, House 18',
      city: 'Jaipur',
      state: 'Rajasthan',
      postalCode: '302001',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Tonk Road, Commercial Complex Office 102',
      city: 'Jaipur',
      state: 'Rajasthan',
      postalCode: '302015',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_7',
        title: 'OnePlus 12 5G (16GB RAM, 512GB Storage - Flowy Emerald)',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 48500,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'OUT_FOR_DELIVERY',
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 2,
      failedAttemptsLast24h: 1,
      deviceSwitchesLast7Days: 1
    },
    status: 'MONITORED',
    riskScore: 0,
    riskLevel: 'MEDIUM',
    riskFactors: [],
    recommendedAction: 'MONITOR',
    actionReason: ''
  },
  {
    id: 'txn_in_984109',
    orderId: 'ord_ind_84726',
    amountINR: 185000,
    currency: 'INR',
    timestamp: '2026-08-30T02:08:44.000Z',
    customer: {
      name: 'Nitin Kulkarni',
      email: 'nitin.kulkarni88@yahoo.com',
      phone: '9822194820',
      accountAgeDays: 2,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 1,
      pastDisputeRate: 100,
      ipAddress: '194.26.29.112',
      locationCity: 'Pune',
      locationState: 'Maharashtra',
      locationCountry: 'India',
      deviceFingerprint: 'fp_mac_chrome_8819',
      deviceType: 'Desktop (Mac)',
      isVpnProxy: true
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '7721',
      cardIssuerBank: 'HDFC Bank Infinia',
      authStatus3DS: 'ATTEMPTED_ONLY',
      gatewayRefId: 'pay_Hdfc_119284',
      arnRrn: 'ARN99482019481',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Koregaon Park, Lane 7, Bungalow 14',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Viman Nagar, Courier Hold Center',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411014',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_8',
        title: 'Apple MacBook Pro 16" M3 Max (36GB Unified Memory, 1TB SSD)',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 185000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'PENDING_FULFILLMENT',
    velocity: {
      txnsLast1Hour: 2,
      txnsLast24Hours: 4,
      failedAttemptsLast24h: 3,
      deviceSwitchesLast7Days: 2
    },
    status: 'UNDER_VERIFICATION',
    riskScore: 0,
    riskLevel: 'HIGH',
    riskFactors: [],
    recommendedAction: 'MANUAL_VERIFICATION',
    actionReason: ''
  },
  {
    id: 'txn_in_984110',
    orderId: 'ord_ind_84727',
    amountINR: 6499,
    currency: 'INR',
    timestamp: '2026-08-30T01:45:19.000Z',
    customer: {
      name: 'Deepak Singhania',
      email: 'deepak.singhania@wipro.com',
      phone: '9848019283',
      accountAgeDays: 540,
      totalPastOrders: 19,
      totalPastSpentINR: 98500,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '122.175.48.91',
      locationCity: 'Hyderabad',
      locationState: 'Telangana',
      locationCountry: 'India',
      deviceFingerprint: 'fp_android_app_4491',
      deviceType: 'Mobile (Android)',
      isVpnProxy: false
    },
    payment: {
      method: 'UPI',
      upiVpa: 'deepak@ybl',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Upi_PhonePe_991',
      arnRrn: 'RRN48291048201',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Gachibowli, Telecom Nagar, House 90',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500032',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Gachibowli, Telecom Nagar, House 90',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500032',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_9',
        title: 'Ergonomic Mesh Office Chair with Lumbar Support',
        category: 'Apparel & Fashion',
        quantity: 1,
        unitPriceINR: 6499,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'IN_TRANSIT',
    proofOfDelivery: {
      carrier: 'BlueDart',
      trackingNumber: 'BLU-99281048',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984111',
    orderId: 'ord_ind_84728',
    amountINR: 50000,
    currency: 'INR',
    timestamp: '2026-08-30T00:30:42.000Z',
    customer: {
      name: 'Karan Mehra',
      email: 'karan.m.express@gmail.com',
      phone: '9871194820',
      accountAgeDays: 0,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '198.51.100.44',
      locationCity: 'Gurugram',
      locationState: 'Haryana',
      locationCountry: 'India',
      deviceFingerprint: 'fp_win_brave_8819',
      deviceType: 'Desktop (Windows)',
      isVpnProxy: true
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '9012',
      cardIssuerBank: 'Standard Chartered India',
      authStatus3DS: 'ATTEMPTED_ONLY',
      gatewayRefId: 'pay_Scb_772819',
      arnRrn: 'ARN88492019481',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'DLF Phase 5, Club Drive 21',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002',
      country: 'India'
    },
    shippingAddress: {
      line1: 'DLF Cyber City, Tower 8 Reception',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122008',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_10',
        title: 'Amazon Pay & Croma Instant Gift Cards (₹10,000 x 5)',
        category: 'Digital Goods/Voucher',
        quantity: 5,
        unitPriceINR: 10000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'PENDING_FULFILLMENT',
    velocity: {
      txnsLast1Hour: 3,
      txnsLast24Hours: 6,
      failedAttemptsLast24h: 3,
      deviceSwitchesLast7Days: 2
    },
    chargebackDispute: {
      isDisputed: true,
      disputeId: 'DISP-GUR-104-111',
      disputeReasonCode: '10.4',
      disputeReasonName: 'Visa Fraud: Card-Absent Environment / Instant Voucher Exploitation',
      disputeFiledAt: '2026-08-30T06:45:00.000Z',
      claimAmountINR: 50000,
      gatewayDeadline: '2026-09-08T23:59:59.000Z',
      status: 'OPEN'
    },
    status: 'CHARGEBACK_DISPUTED',
    riskScore: 0,
    riskLevel: 'HIGH',
    riskFactors: [],
    recommendedAction: 'MANUAL_VERIFICATION',
    actionReason: ''
  },
  {
    id: 'txn_in_984112',
    orderId: 'ord_ind_84729',
    amountINR: 12499,
    currency: 'INR',
    timestamp: '2026-08-29T23:10:14.000Z',
    customer: {
      name: 'Sunita Agarwal',
      email: 'sunita.agarwal@gmail.com',
      phone: '9433194820',
      accountAgeDays: 310,
      totalPastOrders: 9,
      totalPastSpentINR: 42000,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '122.160.19.44',
      locationCity: 'Jaipur',
      locationState: 'Rajasthan',
      locationCountry: 'India',
      deviceFingerprint: 'fp_android_chrome_9912',
      deviceType: 'Mobile (Android)',
      isVpnProxy: false
    },
    payment: {
      method: 'DEBIT_CARD',
      cardNetwork: 'RuPay',
      cardLast4: '2281',
      cardIssuerBank: 'Bank of Baroda',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Bob_449102',
      arnRrn: 'RRN48291048192',
      paymentGateway: 'Cashfree'
    },
    billingAddress: {
      line1: 'Mansarovar, Sector 5, Plot 142',
      city: 'Jaipur',
      state: 'Rajasthan',
      postalCode: '302020',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Mansarovar, Sector 5, Plot 142',
      city: 'Jaipur',
      state: 'Rajasthan',
      postalCode: '302020',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_11',
        title: 'Bajaj 25L Storage Geyser with Titan Armour & Free Installation',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 12499,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'DELIVERED',
    proofOfDelivery: {
      carrier: 'Delhivery',
      trackingNumber: 'DEL-44910294',
      signedBy: 'Sunita Agarwal',
      deliveredAt: '2026-08-29T18:00:00.000Z',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984113',
    orderId: 'ord_ind_84730',
    amountINR: 32000,
    currency: 'INR',
    timestamp: '2026-08-29T21:40:00.000Z',
    customer: {
      name: 'Mohit Rawat',
      email: 'mohit.rawat94@gmail.com',
      phone: '9899194820',
      accountAgeDays: 45,
      totalPastOrders: 2,
      totalPastSpentINR: 4800,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '49.36.192.81',
      locationCity: 'Chandigarh',
      locationState: 'Punjab',
      locationCountry: 'India',
      deviceFingerprint: 'fp_ios_safari_2291',
      deviceType: 'Mobile (iOS)',
      isVpnProxy: false
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Mastercard',
      cardLast4: '4481',
      cardIssuerBank: 'RBL Bank',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Rbl_882914',
      arnRrn: 'ARN48291048102',
      paymentGateway: 'PayU'
    },
    billingAddress: {
      line1: 'Sector 35-C, House 204',
      city: 'Chandigarh',
      state: 'Punjab',
      postalCode: '160035',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Sector 17 Market, Shop 44',
      city: 'Chandigarh',
      state: 'Punjab',
      postalCode: '160017',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_12',
        title: 'Dyson Airwrap Multi-Styler Complete Long (Nickel/Copper)',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 32000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'IN_TRANSIT',
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 2,
      failedAttemptsLast24h: 1,
      deviceSwitchesLast7Days: 0
    },
    status: 'MONITORED',
    riskScore: 0,
    riskLevel: 'MEDIUM',
    riskFactors: [],
    recommendedAction: 'MONITOR',
    actionReason: ''
  },
  {
    id: 'txn_in_984114',
    orderId: 'ord_ind_84731',
    amountINR: 112000,
    currency: 'INR',
    timestamp: '2026-08-29T20:15:33.000Z',
    customer: {
      name: 'Ashwin Nair',
      email: 'ashwin.nair.trader@rediffmail.com',
      phone: '9847192800',
      accountAgeDays: 0,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 1,
      pastDisputeRate: 100,
      ipAddress: '193.106.191.24',
      locationCity: 'Kozhikode',
      locationState: 'Kerala',
      locationCountry: 'India',
      deviceFingerprint: 'fp_emulated_linux_99',
      deviceType: 'Unknown/Emulated',
      isVpnProxy: true
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '1092',
      cardIssuerBank: 'HDFC Bank',
      authStatus3DS: 'ATTEMPTED_ONLY',
      gatewayRefId: 'pay_Hdfc_002914',
      arnRrn: 'ARN77102948190',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Mavoor Road, Flat 2A',
      city: 'Kozhikode',
      state: 'Kerala',
      postalCode: '673004',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Locker Box 12, Calicut Railway Station',
      city: 'Kozhikode',
      state: 'Kerala',
      postalCode: '673001',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_13',
        title: 'Samsung Galaxy S24 Ultra (512GB - Titanium Gray) + Galaxy Watch 6',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 112000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'PENDING_FULFILLMENT',
    velocity: {
      txnsLast1Hour: 3,
      txnsLast24Hours: 6,
      failedAttemptsLast24h: 4,
      deviceSwitchesLast7Days: 3
    },
    status: 'BLOCKED',
    riskScore: 0,
    riskLevel: 'HIGH',
    riskFactors: [],
    recommendedAction: 'MANUAL_VERIFICATION',
    actionReason: ''
  },
  {
    id: 'txn_in_984115',
    orderId: 'ord_ind_84732',
    amountINR: 850,
    currency: 'INR',
    timestamp: '2026-08-29T19:02:11.000Z',
    customer: {
      name: 'Pooja Bhatt',
      email: 'pooja.bhatt@gmail.com',
      phone: '9820194899',
      accountAgeDays: 730,
      totalPastOrders: 34,
      totalPastSpentINR: 145000,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '157.34.18.99',
      locationCity: 'Ahmedabad',
      locationState: 'Gujarat',
      locationCountry: 'India',
      deviceFingerprint: 'fp_ios_safari_0019',
      deviceType: 'Mobile (iOS)',
      isVpnProxy: false
    },
    payment: {
      method: 'UPI',
      upiVpa: 'pooja@oksbi',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Upi_881920',
      arnRrn: 'RRN48291048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Bodakdev, Judges Bungalow Road 4',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380054',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Bodakdev, Judges Bungalow Road 4',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380054',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_14',
        title: 'Forest Essentials Ayurvedic Hand Pounded Body Scrub',
        category: 'Groceries & Essentials',
        quantity: 1,
        unitPriceINR: 850,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'DELIVERED',
    proofOfDelivery: {
      carrier: 'Delhivery',
      trackingNumber: 'DEL-88192044',
      signedBy: 'Pooja Bhatt',
      deliveredAt: '2026-08-29T12:00:00.000Z',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984116',
    orderId: 'ord_ind_84733',
    amountINR: 58000,
    currency: 'INR',
    timestamp: '2026-08-29T17:48:29.000Z',
    customer: {
      name: 'Harish Verma',
      email: 'harish.v.tech@gmail.com',
      phone: '9810194820',
      accountAgeDays: 12,
      totalPastOrders: 1,
      totalPastSpentINR: 1500,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '103.44.18.22',
      locationCity: 'Noida',
      locationState: 'Uttar Pradesh',
      locationCountry: 'India',
      deviceFingerprint: 'fp_win_chrome_5519',
      deviceType: 'Desktop (Windows)',
      isVpnProxy: false
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '6619',
      cardIssuerBank: 'ICICI Bank Amazon Pay',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Icici_991820',
      arnRrn: 'ARN48291048190',
      paymentGateway: 'PayU'
    },
    billingAddress: {
      line1: 'Sector 50, Mahagun Maple Flat 904',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201301',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Sector 62, Embassy Tech Park Gate 2',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201309',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_15',
        title: 'LG 55 Inch 4K UHD Smart OLED TV with Dolby Vision',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 58000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'IN_TRANSIT',
    proofOfDelivery: {
      carrier: 'BlueDart',
      trackingNumber: 'BLU-88291044',
      otpVerified: false,
      deliveryAddressMatch: false
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 2,
      failedAttemptsLast24h: 1,
      deviceSwitchesLast7Days: 1
    },
    status: 'MONITORED',
    riskScore: 0,
    riskLevel: 'MEDIUM',
    riskFactors: [],
    recommendedAction: 'MONITOR',
    actionReason: ''
  },
  {
    id: 'txn_in_984117',
    orderId: 'ord_ind_84734',
    amountINR: 95000,
    currency: 'INR',
    timestamp: '2026-08-29T16:20:10.000Z',
    customer: {
      name: 'Farhan Sheikh',
      email: 'farhan.sheikh.crypto@proton.me',
      phone: '9920194811',
      accountAgeDays: 0,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 1,
      pastDisputeRate: 100,
      ipAddress: '185.191.171.12',
      locationCity: 'Mumbai',
      locationState: 'Maharashtra',
      locationCountry: 'India',
      deviceFingerprint: 'fp_unverified_proxy_19',
      deviceType: 'Unknown/Emulated',
      isVpnProxy: true
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Mastercard',
      cardLast4: '7744',
      cardIssuerBank: 'Yes Bank',
      authStatus3DS: 'CHALLENGED_FAILED',
      gatewayRefId: 'pay_Yes_failed_001',
      arnRrn: 'ARN88492019481',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Andheri West, Lokhandwala Complex 14',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400053',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Thane West, Commercial Parcel Hub 2',
      city: 'Thane',
      state: 'Maharashtra',
      postalCode: '400601',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_16',
        title: 'Sony PlayStation 5 Pro Console (2TB) + 3 DualSense Controllers + VR2 Headset',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 95000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'PENDING_FULFILLMENT',
    velocity: {
      txnsLast1Hour: 4,
      txnsLast24Hours: 8,
      failedAttemptsLast24h: 5,
      deviceSwitchesLast7Days: 3
    },
    status: 'BLOCKED',
    riskScore: 0,
    riskLevel: 'HIGH',
    riskFactors: [],
    recommendedAction: 'MANUAL_VERIFICATION',
    actionReason: ''
  },
  {
    id: 'txn_in_984118',
    orderId: 'ord_ind_84735',
    amountINR: 3499,
    currency: 'INR',
    timestamp: '2026-08-29T15:10:00.000Z',
    customer: {
      name: 'Sneha Kulkarni',
      email: 'sneha.k@infosys.com',
      phone: '9845194820',
      accountAgeDays: 490,
      totalPastOrders: 11,
      totalPastSpentINR: 52000,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '106.51.78.22',
      locationCity: 'Bengaluru',
      locationState: 'Karnataka',
      locationCountry: 'India',
      deviceFingerprint: 'fp_ios_safari_8819',
      deviceType: 'Mobile (iOS)',
      isVpnProxy: false
    },
    payment: {
      method: 'UPI',
      upiVpa: 'sneha@okaxis',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Upi_881920',
      arnRrn: 'RRN48291048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Whitefield, Prestige Shantiniketan Apt 1204',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Whitefield, Prestige Shantiniketan Apt 1204',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_17',
        title: 'Titan Raga Viva Analog Mother of Pearl Dial Watch',
        category: 'Jewelry & Gold',
        quantity: 1,
        unitPriceINR: 3499,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'DELIVERED',
    proofOfDelivery: {
      carrier: 'BlueDart',
      trackingNumber: 'BLU-77281044',
      signedBy: 'Sneha Kulkarni',
      deliveredAt: '2026-08-29T10:00:00.000Z',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984119',
    orderId: 'ord_ind_84736',
    amountINR: 62000,
    currency: 'INR',
    timestamp: '2026-08-29T14:05:44.000Z',
    customer: {
      name: 'Tanmay Bhatnagar',
      email: 'tanmay.bhatnagar@gmail.com',
      phone: '9818194820',
      accountAgeDays: 6,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '103.251.168.14',
      locationCity: 'New Delhi',
      locationState: 'Delhi',
      locationCountry: 'India',
      deviceFingerprint: 'fp_mac_safari_3301',
      deviceType: 'Desktop (Mac)',
      isVpnProxy: false
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '3301',
      cardIssuerBank: 'SBI Cards Elite',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Sbi_882914',
      arnRrn: 'ARN48291048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Greater Kailash 1, M-Block House 24',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110048',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Greater Kailash 2, Office Complex 401',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110048',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_18',
        title: 'Apple iPad Pro 11-inch M4 Chip (Wi-Fi, 256GB - Space Black)',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 62000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'IN_TRANSIT',
    proofOfDelivery: {
      carrier: 'Delhivery',
      trackingNumber: 'DEL-33819204',
      otpVerified: false,
      deliveryAddressMatch: false
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 2,
      failedAttemptsLast24h: 1,
      deviceSwitchesLast7Days: 1
    },
    status: 'MONITORED',
    riskScore: 0,
    riskLevel: 'MEDIUM',
    riskFactors: [],
    recommendedAction: 'MONITOR',
    actionReason: ''
  },
  {
    id: 'txn_in_984120',
    orderId: 'ord_ind_84737',
    amountINR: 2800,
    currency: 'INR',
    timestamp: '2026-08-29T12:55:00.000Z',
    customer: {
      name: 'Meera Nambiar',
      email: 'meera.nambiar@gmail.com',
      phone: '9847019283',
      accountAgeDays: 600,
      totalPastOrders: 22,
      totalPastSpentINR: 88000,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '117.218.44.12',
      locationCity: 'Thiruvananthapuram',
      locationState: 'Kerala',
      locationCountry: 'India',
      deviceFingerprint: 'fp_ios_safari_7719',
      deviceType: 'Mobile (iOS)',
      isVpnProxy: false
    },
    payment: {
      method: 'UPI',
      upiVpa: 'meera@okicici',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Upi_771820',
      arnRrn: 'RRN48291048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Sasthamangalam, TC 24/890',
      city: 'Thiruvananthapuram',
      state: 'Kerala',
      postalCode: '695010',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Sasthamangalam, TC 24/890',
      city: 'Thiruvananthapuram',
      state: 'Kerala',
      postalCode: '695010',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_19',
        title: 'Handloom Kasavu Saree with Pure Zari Border',
        category: 'Apparel & Fashion',
        quantity: 1,
        unitPriceINR: 2800,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'DELIVERED',
    proofOfDelivery: {
      carrier: 'Delhivery',
      trackingNumber: 'DEL-77192044',
      signedBy: 'Meera Nambiar',
      deliveredAt: '2026-08-28T11:00:00.000Z',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984121',
    orderId: 'ord_ind_84738',
    amountINR: 145000,
    currency: 'INR',
    timestamp: '2026-08-29T11:30:19.000Z',
    customer: {
      name: 'Siddharth Vats',
      email: 'sid.vats.express@proton.me',
      phone: '9811194820',
      accountAgeDays: 1,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 1,
      pastDisputeRate: 100,
      ipAddress: '194.38.20.14',
      locationCity: 'New Delhi',
      locationState: 'Delhi',
      locationCountry: 'India',
      deviceFingerprint: 'fp_untrusted_tor_991',
      deviceType: 'Unknown/Emulated',
      isVpnProxy: true
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '5512',
      cardIssuerBank: 'Axis Bank Magnus',
      authStatus3DS: 'ATTEMPTED_ONLY',
      gatewayRefId: 'pay_Axis_001928',
      arnRrn: 'ARN88192048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Vasant Vihar, Block E House 12',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110057',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Old Delhi Railway Station Parcel Counter',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110006',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_20',
        title: 'Canon EOS R6 Mark II Mirrorless Camera + RF 24-105mm F4 L IS USM Lens',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 145000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'PENDING_FULFILLMENT',
    velocity: {
      txnsLast1Hour: 3,
      txnsLast24Hours: 6,
      failedAttemptsLast24h: 4,
      deviceSwitchesLast7Days: 4
    },
    chargebackDispute: {
      isDisputed: true,
      disputeId: 'DISP-DEL-104-121',
      disputeReasonCode: '10.4',
      disputeReasonName: 'Visa Fraud: Stolen Card Credential Compromise',
      disputeFiledAt: '2026-08-30T05:00:00.000Z',
      claimAmountINR: 145000,
      gatewayDeadline: '2026-09-08T23:59:59.000Z',
      status: 'OPEN'
    },
    status: 'CHARGEBACK_DISPUTED',
    riskScore: 0,
    riskLevel: 'HIGH',
    riskFactors: [],
    recommendedAction: 'MANUAL_VERIFICATION',
    actionReason: ''
  },
  {
    id: 'txn_in_984122',
    orderId: 'ord_ind_84739',
    amountINR: 18999,
    currency: 'INR',
    timestamp: '2026-08-29T10:14:02.000Z',
    customer: {
      name: 'Geeta Balakrishnan',
      email: 'geeta.bala@gmail.com',
      phone: '9840192830',
      accountAgeDays: 410,
      totalPastOrders: 15,
      totalPastSpentINR: 76000,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '157.49.19.88',
      locationCity: 'Chennai',
      locationState: 'Tamil Nadu',
      locationCountry: 'India',
      deviceFingerprint: 'fp_ios_safari_3391',
      deviceType: 'Mobile (iOS)',
      isVpnProxy: false
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Mastercard',
      cardLast4: '9928',
      cardIssuerBank: 'HDFC Bank Regalia Gold',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Hdfc_771920',
      arnRrn: 'ARN48291048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Anna Nagar West, 6th Avenue House 40',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600040',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Anna Nagar West, 6th Avenue House 40',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600040',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_21',
        title: 'Ninja Air Fryer Max XL (5.2L) with Digital Crisping Tech',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 18999,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'DELIVERED',
    proofOfDelivery: {
      carrier: 'BlueDart',
      trackingNumber: 'BLU-99182044',
      signedBy: 'Geeta Balakrishnan',
      deliveredAt: '2026-08-28T14:30:00.000Z',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984123',
    orderId: 'ord_ind_84740',
    amountINR: 54000,
    currency: 'INR',
    timestamp: '2026-08-29T09:00:11.000Z',
    customer: {
      name: 'Rajat Kapoor',
      email: 'rajat.kapoor.deals@yahoo.in',
      phone: '9811094820',
      accountAgeDays: 5,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '103.22.18.99',
      locationCity: 'Chandigarh',
      locationState: 'Punjab',
      locationCountry: 'India',
      deviceFingerprint: 'fp_win_chrome_9918',
      deviceType: 'Desktop (Windows)',
      isVpnProxy: false
    },
    payment: {
      method: 'EMI',
      cardNetwork: 'Visa',
      cardLast4: '4410',
      cardIssuerBank: 'Federal Bank',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Fed_881920',
      arnRrn: 'ARN48291048102',
      paymentGateway: 'PayU'
    },
    billingAddress: {
      line1: 'Sector 8-C, Villa 102',
      city: 'Chandigarh',
      state: 'Punjab',
      postalCode: '160009',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Industrial Area Phase 2, Unit 5',
      city: 'Chandigarh',
      state: 'Punjab',
      postalCode: '160002',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_22',
        title: 'Asus TUF Gaming A15 (AMD Ryzen 7, RTX 4060, 16GB RAM, 1TB SSD)',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 54000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'IN_TRANSIT',
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 2,
      failedAttemptsLast24h: 1,
      deviceSwitchesLast7Days: 1
    },
    status: 'MONITORED',
    riskScore: 0,
    riskLevel: 'MEDIUM',
    riskFactors: [],
    recommendedAction: 'MONITOR',
    actionReason: ''
  },
  {
    id: 'txn_in_984124',
    orderId: 'ord_ind_84741',
    amountINR: 120000,
    currency: 'INR',
    timestamp: '2026-08-29T08:12:00.000Z',
    customer: {
      name: 'Manish Tyagi',
      email: 'manish.tyagi.trade@mailinator.com',
      phone: '9873019280',
      accountAgeDays: 0,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 2,
      pastDisputeRate: 100,
      ipAddress: '185.220.100.244',
      locationCity: 'Ghaziabad',
      locationState: 'Uttar Pradesh',
      locationCountry: 'India',
      deviceFingerprint: 'fp_anonymous_tor_node',
      deviceType: 'Unknown/Emulated',
      isVpnProxy: true
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '7799',
      cardIssuerBank: 'SBI Cards',
      authStatus3DS: 'CHALLENGED_FAILED',
      gatewayRefId: 'pay_Sbi_failed_99',
      arnRrn: 'ARN99102948190',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Raj Nagar, Sector 10 House 4',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      postalCode: '201002',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Truck Terminal Parking Post, NH 24',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      postalCode: '201009',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_23',
        title: 'Kalyan Jewellers 22K (916) Gold Necklace Set 18 grams',
        category: 'Jewelry & Gold',
        quantity: 1,
        unitPriceINR: 120000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'PENDING_FULFILLMENT',
    velocity: {
      txnsLast1Hour: 4,
      txnsLast24Hours: 8,
      failedAttemptsLast24h: 6,
      deviceSwitchesLast7Days: 4
    },
    status: 'BLOCKED',
    riskScore: 0,
    riskLevel: 'HIGH',
    riskFactors: [],
    recommendedAction: 'MANUAL_VERIFICATION',
    actionReason: ''
  },
  {
    id: 'txn_in_984125',
    orderId: 'ord_ind_84742',
    amountINR: 1499,
    currency: 'INR',
    timestamp: '2026-08-29T07:15:33.000Z',
    customer: {
      name: 'Devika Pillai',
      email: 'devika.pillai@gmail.com',
      phone: '9446194820',
      accountAgeDays: 520,
      totalPastOrders: 16,
      totalPastSpentINR: 58000,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '117.240.18.91',
      locationCity: 'Kollam',
      locationState: 'Kerala',
      locationCountry: 'India',
      deviceFingerprint: 'fp_ios_safari_2210',
      deviceType: 'Mobile (iOS)',
      isVpnProxy: false
    },
    payment: {
      method: 'UPI',
      upiVpa: 'devika@okaxis',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Upi_881920',
      arnRrn: 'RRN48291048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Beach Road, Residency Lane 12',
      city: 'Kollam',
      state: 'Kerala',
      postalCode: '691001',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Beach Road, Residency Lane 12',
      city: 'Kollam',
      state: 'Kerala',
      postalCode: '691001',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_24',
        title: 'Forest Essentials Soundarya Radiance Silk Night Cream',
        category: 'Groceries & Essentials',
        quantity: 1,
        unitPriceINR: 1499,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'DELIVERED',
    proofOfDelivery: {
      carrier: 'Delhivery',
      trackingNumber: 'DEL-99182044',
      signedBy: 'Devika Pillai',
      deliveredAt: '2026-08-28T09:00:00.000Z',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984126',
    orderId: 'ord_ind_84743',
    amountINR: 38990,
    currency: 'INR',
    timestamp: '2026-08-29T06:05:00.000Z',
    customer: {
      name: 'Amitabh Sen',
      email: 'amitabh.sen.consult@gmail.com',
      phone: '9903019280',
      accountAgeDays: 120,
      totalPastOrders: 4,
      totalPastSpentINR: 28000,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '103.21.144.18',
      locationCity: 'Kolkata',
      locationState: 'West Bengal',
      locationCountry: 'India',
      deviceFingerprint: 'fp_mac_chrome_8819',
      deviceType: 'Desktop (Mac)',
      isVpnProxy: false
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '8810',
      cardIssuerBank: 'HDFC Bank Diners Club',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Hdfc_991820',
      arnRrn: 'ARN48291048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Alipore Park Place, Tower 2 Apt 14B',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700027',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Alipore Park Place, Tower 2 Apt 14B',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700027',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_25',
        title: 'Bose QuietComfort Ultra Wireless Noise Cancelling Spatial Earbuds',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 28990,
        isHighResaleRisk: false
      },
      {
        id: 'itm_26',
        title: 'Anker Prime 27650mAh Power Bank (250W Multi-Port Fast Charge)',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 10000,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'DELIVERED',
    proofOfDelivery: {
      carrier: 'BlueDart',
      trackingNumber: 'BLU-88192044',
      signedBy: 'Amitabh Sen',
      deliveredAt: '2026-08-28T08:30:00.000Z',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984127',
    orderId: 'ord_ind_84744',
    amountINR: 98000,
    currency: 'INR',
    timestamp: '2026-08-29T04:45:10.000Z',
    customer: {
      name: 'Yogesh Parekh',
      email: 'yogesh.parekh.quick@proton.me',
      phone: '9820019280',
      accountAgeDays: 0,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 1,
      pastDisputeRate: 100,
      ipAddress: '185.191.171.88',
      locationCity: 'Surat',
      locationState: 'Gujarat',
      locationCountry: 'India',
      deviceFingerprint: 'fp_anonymous_win_99',
      deviceType: 'Unknown/Emulated',
      isVpnProxy: true
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Mastercard',
      cardLast4: '0019',
      cardIssuerBank: 'IndusInd Bank',
      authStatus3DS: 'ATTEMPTED_ONLY',
      gatewayRefId: 'pay_Indus_001928',
      arnRrn: 'ARN88192048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Ghod Dod Road, Diamond Plaza 14',
      city: 'Surat',
      state: 'Gujarat',
      postalCode: '395007',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Surat Textile Market Locker 9B',
      city: 'Surat',
      state: 'Gujarat',
      postalCode: '395002',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_27',
        title: 'Apple iPad Pro 13-inch (M4 Chip, 512GB Storage, Nano-Texture Glass)',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 98000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'PENDING_FULFILLMENT',
    velocity: {
      txnsLast1Hour: 3,
      txnsLast24Hours: 5,
      failedAttemptsLast24h: 3,
      deviceSwitchesLast7Days: 3
    },
    chargebackDispute: {
      isDisputed: true,
      disputeId: 'DISP-SUR-104-127',
      disputeReasonCode: '10.4',
      disputeReasonName: 'Visa / Mastercard Fraud: Compromised Card in CNP Channel',
      disputeFiledAt: '2026-08-30T04:15:00.000Z',
      claimAmountINR: 98000,
      gatewayDeadline: '2026-09-08T23:59:59.000Z',
      status: 'OPEN'
    },
    status: 'CHARGEBACK_DISPUTED',
    riskScore: 0,
    riskLevel: 'HIGH',
    riskFactors: [],
    recommendedAction: 'MANUAL_VERIFICATION',
    actionReason: ''
  },
  {
    id: 'txn_in_984128',
    orderId: 'ord_ind_84745',
    amountINR: 5200,
    currency: 'INR',
    timestamp: '2026-08-29T03:30:00.000Z',
    customer: {
      name: 'Nandini Swaminathan',
      email: 'nandini.swami@tcs.com',
      phone: '9841019280',
      accountAgeDays: 360,
      totalPastOrders: 13,
      totalPastSpentINR: 62000,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '157.48.99.14',
      locationCity: 'Coimbatore',
      locationState: 'Tamil Nadu',
      locationCountry: 'India',
      deviceFingerprint: 'fp_ios_safari_5519',
      deviceType: 'Mobile (iOS)',
      isVpnProxy: false
    },
    payment: {
      method: 'UPI',
      upiVpa: 'nandini@okhdfcbank',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Upi_771920',
      arnRrn: 'RRN48291048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'RS Puram, DB Road House 42',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      postalCode: '641002',
      country: 'India'
    },
    shippingAddress: {
      line1: 'RS Puram, DB Road House 42',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      postalCode: '641002',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_28',
        title: 'Preethi Zodiac MG 218 750-Watt Mixer Grinder with 5 Jars',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 5200,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'DELIVERED',
    proofOfDelivery: {
      carrier: 'Delhivery',
      trackingNumber: 'DEL-88192044',
      signedBy: 'Nandini Swaminathan',
      deliveredAt: '2026-08-27T15:00:00.000Z',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984129',
    orderId: 'ord_ind_84746',
    amountINR: 42000,
    currency: 'INR',
    timestamp: '2026-08-29T02:10:00.000Z',
    customer: {
      name: 'Varun Grover',
      email: 'varun.grover.deals@gmail.com',
      phone: '9810019280',
      accountAgeDays: 14,
      totalPastOrders: 1,
      totalPastSpentINR: 2400,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '103.25.18.44',
      locationCity: 'Gurugram',
      locationState: 'Haryana',
      locationCountry: 'India',
      deviceFingerprint: 'fp_win_edge_9918',
      deviceType: 'Desktop (Windows)',
      isVpnProxy: false
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '6610',
      cardIssuerBank: 'ICICI Bank Sapphiro',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Icici_771920',
      arnRrn: 'ARN48291048102',
      paymentGateway: 'PayU'
    },
    billingAddress: {
      line1: 'Golf Course Road, The Magnolias Apt 804',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Sohna Road, Spaze i-Tech Park Tower B',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122018',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_29',
        title: 'Garmin Forerunner 965 Premium GPS Running Smartwatch (Titanium Bezel)',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 42000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'IN_TRANSIT',
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 2,
      failedAttemptsLast24h: 1,
      deviceSwitchesLast7Days: 1
    },
    status: 'MONITORED',
    riskScore: 0,
    riskLevel: 'MEDIUM',
    riskFactors: [],
    recommendedAction: 'MONITOR',
    actionReason: ''
  },
  {
    id: 'txn_in_984130',
    orderId: 'ord_ind_84747',
    amountINR: 88000,
    currency: 'INR',
    timestamp: '2026-08-29T01:00:19.000Z',
    customer: {
      name: 'Tariq Mansoor',
      email: 'tariq.mansoor.trade@proton.me',
      phone: '9821019280',
      accountAgeDays: 0,
      totalPastOrders: 0,
      totalPastSpentINR: 0,
      pastChargebackCount: 2,
      pastDisputeRate: 100,
      ipAddress: '194.26.29.88',
      locationCity: 'Hyderabad',
      locationState: 'Telangana',
      locationCountry: 'India',
      deviceFingerprint: 'fp_emulated_android_tor',
      deviceType: 'Unknown/Emulated',
      isVpnProxy: true
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '9941',
      cardIssuerBank: 'SBI Cards Prime',
      authStatus3DS: 'CHALLENGED_FAILED',
      gatewayRefId: 'pay_Sbi_failed_88',
      arnRrn: 'ARN88192048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Banjara Hills, Road No 12 House 14',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500034',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Secunderabad Railway Station Luggage Room',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500003',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_30',
        title: 'Sony Bravia 65 Inch 4K Ultra HD Smart LED Google TV',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 88000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'PENDING_FULFILLMENT',
    velocity: {
      txnsLast1Hour: 4,
      txnsLast24Hours: 7,
      failedAttemptsLast24h: 5,
      deviceSwitchesLast7Days: 3
    },
    status: 'BLOCKED',
    riskScore: 0,
    riskLevel: 'HIGH',
    riskFactors: [],
    recommendedAction: 'MANUAL_VERIFICATION',
    actionReason: ''
  },
  {
    id: 'txn_in_984131',
    orderId: 'ord_ind_84748',
    amountINR: 3200,
    currency: 'INR',
    timestamp: '2026-08-28T23:45:00.000Z',
    customer: {
      name: 'Shalini Murthy',
      email: 'shalini.murthy@wipro.com',
      phone: '9845019280',
      accountAgeDays: 680,
      totalPastOrders: 24,
      totalPastSpentINR: 114000,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '122.175.88.19',
      locationCity: 'Bengaluru',
      locationState: 'Karnataka',
      locationCountry: 'India',
      deviceFingerprint: 'fp_mac_safari_8819',
      deviceType: 'Desktop (Mac)',
      isVpnProxy: false
    },
    payment: {
      method: 'UPI',
      upiVpa: 'shalini@oksbi',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Upi_771920',
      arnRrn: 'RRN48291048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Indiranagar, 100 Feet Road House 88',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Indiranagar, 100 Feet Road House 88',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India'
    },
    billingShippingMatch: true,
    items: [
      {
        id: 'itm_31',
        title: 'Nespresso Vertuo Pop Coffee Machine with Starter Capsule Pack',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 3200,
        isHighResaleRisk: false
      }
    ],
    deliveryStatus: 'DELIVERED',
    proofOfDelivery: {
      carrier: 'BlueDart',
      trackingNumber: 'BLU-88192044',
      signedBy: 'Shalini Murthy',
      deliveredAt: '2026-08-27T11:30:00.000Z',
      otpVerified: true,
      deliveryAddressMatch: true
    },
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 1,
      failedAttemptsLast24h: 0,
      deviceSwitchesLast7Days: 0
    },
    status: 'APPROVED',
    riskScore: 0,
    riskLevel: 'LOW',
    riskFactors: [],
    recommendedAction: 'APPROVE',
    actionReason: ''
  },
  {
    id: 'txn_in_984132',
    orderId: 'ord_ind_84749',
    amountINR: 65000,
    currency: 'INR',
    timestamp: '2026-08-28T22:15:40.000Z',
    customer: {
      name: 'Kunal Singhal',
      email: 'kunal.singhal.shop@gmail.com',
      phone: '9818019280',
      accountAgeDays: 10,
      totalPastOrders: 1,
      totalPastSpentINR: 1999,
      pastChargebackCount: 0,
      pastDisputeRate: 0,
      ipAddress: '103.44.88.19',
      locationCity: 'Noida',
      locationState: 'Uttar Pradesh',
      locationCountry: 'India',
      deviceFingerprint: 'fp_ios_safari_9918',
      deviceType: 'Mobile (iOS)',
      isVpnProxy: false
    },
    payment: {
      method: 'CREDIT_CARD',
      cardNetwork: 'Visa',
      cardLast4: '1102',
      cardIssuerBank: 'HDFC Bank Millennia',
      authStatus3DS: 'AUTHENTICATED',
      gatewayRefId: 'pay_Hdfc_881920',
      arnRrn: 'ARN48291048102',
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: 'Sector 44, Express View Apartments Flat 501',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201303',
      country: 'India'
    },
    shippingAddress: {
      line1: 'Sector 128, Jaypee Greens Commercial Tower',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201304',
      country: 'India'
    },
    billingShippingMatch: false,
    items: [
      {
        id: 'itm_32',
        title: 'Sony PlayStation VR2 Horizon Call of the Mountain Bundle',
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: 65000,
        isHighResaleRisk: true
      }
    ],
    deliveryStatus: 'IN_TRANSIT',
    velocity: {
      txnsLast1Hour: 1,
      txnsLast24Hours: 2,
      failedAttemptsLast24h: 1,
      deviceSwitchesLast7Days: 1
    },
    status: 'MONITORED',
    riskScore: 0,
    riskLevel: 'MEDIUM',
    riskFactors: [],
    recommendedAction: 'MONITOR',
    actionReason: ''
  }
];

// Initialize and evaluate all demo transactions using the modular Risk Scoring Engine
export const initialDemoTransactions: Transaction[] = rawTransactions.map(txn => {
  const evaluated = evaluateTransaction(txn);
  // Default natural language AI explanation if server endpoint isn't called yet
  const aiExplanation = evaluated.riskLevel === 'HIGH'
    ? `Critical chargeback liability alert: Order #${evaluated.orderId} (₹${evaluated.amountINR.toLocaleString('en-IN')}) presents significant anomalies including ${evaluated.riskFactors.map(f => f.name.toLowerCase()).join(', ')}. Disputed or rejected 3DS authentication elevates issuer liability exposure under card brand rules. Recommend immediate manual verification hold prior to dispatch.`
    : evaluated.riskLevel === 'MEDIUM'
    ? `Moderate risk detected for Order #${evaluated.orderId} (₹${evaluated.amountINR.toLocaleString('en-IN')}). While primary payment credentials passed basic checks, factor variances (${evaluated.riskFactors.map(f => f.name.toLowerCase()).join(', ')}) warrant strict delivery OTP tracking.`
    : `Low chargeback risk verified for Order #${evaluated.orderId}. Account age, consistent shipping location, and authenticated 3DS authorization establish strong cardholder authenticity. Safe for immediate automated fulfillment.`;

  return {
    ...evaluated,
    aiRiskAssessment: aiExplanation
  };
});
