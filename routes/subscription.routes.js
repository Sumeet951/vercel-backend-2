import express from 'express';
import {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getStats,
  getUpcoming,
} from '../controllers/subscription.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all subscriptions
router.get('/', isLoggedIn,getSubscriptions);

// Create a new subscription
router.post('/',isLoggedIn, createSubscription);

// Get stats overview
router.get('/stats/overview',isLoggedIn, getStats);

// Get upcoming subscriptions
router.get('/upcoming',isLoggedIn, getUpcoming);

// Get a single subscription by ID
router.get('/:id',isLoggedIn, getSubscription);

// Update a subscription by ID
router.put('/:id',isLoggedIn, updateSubscription);

// Delete a subscription by ID
router.delete('/:id',isLoggedIn, deleteSubscription);

export default router;