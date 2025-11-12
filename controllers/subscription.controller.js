import Subscription from "../models/subscription.model.js"
 //@desc Get all subscription
 //@route Get /api/subscriptions
 //@access Private
 export const getSubscriptions=async(req,res,next)=>{
    try{
        console.log(req.user);
        const subscriptions=await Subscription.find({user:req.user.id})
        .sort({nextBilling:1});
        return res.status(200).json({
            success: true,
      count: subscriptions.length,
      subscriptions,
        })
    }
    catch(error){
        return next(new AppError(error.message, 500));
    }
 }
 // @desc    Get single subscription
// @route   GET /api/subscriptions/:id
// @access  Private
export const getSubscription=async(req,res,next)=>{
        try {
            const subscription = await Subscription.findById(req.params.id);
        
            if (!subscription) {
              return res.status(404).json({
                success: false,
                message: 'Subscription not found',
              });
            }
        
            // Check ownership
            if (subscription.user.toString() !== req.user.id) {
              return res.status(403).json({
                success: false,
                message: 'Not authorized',
              });
            }
        
            res.status(200).json({
              success: true,
              subscription,
              message:"Subscription Fetch successfully"
            });
    }
    catch(error){
        return next(new AppError(error.message, 500));
    }
}
//@desc    Create subscription
// @route   POST /api/subscriptions
// @access  Private
export const createSubscription = async (req, res) => {
    try {
      const subscription = await Subscription.create({
        ...req.body,
        user: req.user.id,
      });
  
      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        subscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
      });
    }
  };
  // @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
export const updateSubscription = async (req, res) => {
    try {
      let subscription = await Subscription.findById(req.params.id);
  
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found',
        });
      }
  
      // Check ownership
      if (subscription.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized',
        });
      }
  
      subscription = await Subscription.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
  
      res.json({
        success: true,
        message: 'Subscription updated successfully',
        subscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
}
// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
export const deleteSubscription = async (req, res) => {
    try {
      const subscription = await Subscription.findById(req.params.id);
  
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found',
        });
      }
  
      // Check ownership
      if (subscription.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized',
        });
      }
  
      await subscription.deleteOne();
  
      res.json({
        success: true,
        message: 'Subscription deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  };
  // @desc    Get subscription stats
// @route   GET /api/subscriptions/stats/overview
// @access  Private
export const getStats = async (req, res) => {
    try {
      const subscriptions = await Subscription.find({
        user: req.user.id,
        status: 'active',
      });
  
      const monthlyTotal = subscriptions.reduce((sum, sub) => {
        if (sub.billingCycle === 'monthly') return sum + sub.cost;
        if (sub.billingCycle === 'yearly') return sum + sub.cost / 12;
        if (sub.billingCycle === 'quarterly') return sum + sub.cost / 3;
        if (sub.billingCycle === 'weekly') return sum + sub.cost * 4;
        return sum;
      }, 0);
  
      const annualTotal = monthlyTotal * 12;
  
      // Get upcoming renewals (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
      const upcomingCount = subscriptions.filter(
        (sub) => new Date(sub.nextBilling) <= thirtyDaysFromNow
      ).length;
  
      // Mock spending data for chart (replace with real historical data)
      const spendingData = [
        { month: 'Jul', amount: 234 },
        { month: 'Aug', amount: 256 },
        { month: 'Sep', amount: 223 },
        { month: 'Oct', amount: 267 },
        { month: 'Nov', amount: 245 },
        { month: 'Dec', amount: monthlyTotal },
      ];
  
      res.json({
        success: true,
        stats: {
          monthlyTotal: Math.round(monthlyTotal * 100) / 100,
          annualTotal: Math.round(annualTotal * 100) / 100,
          activeCount: subscriptions.length,
          upcomingCount,
        },
        spendingData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  };
  
  // @desc    Get upcoming renewals
  // @route   GET /api/subscriptions/upcoming
  // @access  Private
  export const getUpcoming = async (req, res) => {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
      const subscriptions = await Subscription.find({
        user: req.user.id,
        status: 'active',
        nextBilling: { $lte: thirtyDaysFromNow },
      })
        .sort({ nextBilling: 1 })
        .limit(5);
  
      // Calculate days until renewal
      const today = new Date();
      const subscriptionsWithDays = subscriptions.map((sub) => ({
        ...sub.toObject(),
        daysUntil: Math.ceil(
          (new Date(sub.nextBilling) - today) / (1000 * 60 * 60 * 24)
        ),
      }));
  
      res.json({
        success: true,
        subscriptions: subscriptionsWithDays,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  };