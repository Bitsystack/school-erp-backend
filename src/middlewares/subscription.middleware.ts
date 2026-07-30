import { Response, NextFunction } from "express";
import { Subscription } from "../modules/subscriptions/subscription.model";

export const checkSubscriptionAccess = (requiredFeature?: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    const { organizationId } = req.user;
    try {
      const activeSub = await Subscription.findOne({
        organization_id: organizationId,
        status: "ACTIVE",
      }).sort({ end_date: -1 });

      if (!activeSub) {
        // Allow fallback trial mode if no record exists
        return next();
      }

      if (new Date(activeSub.end_date) < new Date()) {
        activeSub.status = "EXPIRED";
        await activeSub.save();
        return res.status(402).json({
          success: false,
          message: "Subscription plan has expired. Please renew your subscription to access this module.",
          subscription_expired: true,
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};
