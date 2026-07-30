import { Response } from "express";
import { Plan, Subscription } from "./subscription.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

const DEFAULT_PLANS = [
  {
    plan_name: "Basic",
    display_name: "Starter ERP",
    description: "Ideal for small schools needing essential academic & management tools.",
    monthly_price: 1999,
    half_yearly_price: 10999, // ~8% discount
    yearly_price: 18999,     // ~20% discount
    max_students: 300,
    max_teachers: 30,
    max_whatsapp_credits: 500,
    includes_biometric: false,
    includes_custom_certificates: false,
    includes_inventory: false,
    includes_visitor_pass: false,
    features: [
      "Student & Teacher Admission",
      "Daily Attendance Management",
      "Classes & Sections Timetable",
      "Fee Receipts & Defaulters Log",
      "Basic Exam & Marksheets",
      "Standard Email Notifications",
    ],
    is_popular: false,
  },
  {
    plan_name: "Pro",
    display_name: "Professional Campus",
    description: "Best for growing schools needing advanced automation, hostel & library.",
    monthly_price: 4999,
    half_yearly_price: 26999, // ~10% discount
    yearly_price: 45999,     // ~23% discount
    max_students: 1500,
    max_teachers: 100,
    max_whatsapp_credits: 5000,
    includes_biometric: true,
    includes_custom_certificates: true,
    includes_inventory: true,
    includes_visitor_pass: true,
    features: [
      "Everything in Basic Plan",
      "Library & Book Circulation",
      "Hostel & Room Allotments",
      "Transport & Bus Allocation",
      "Inventory & Asset Tracking",
      "Biometric Gate Integration",
      "TC & Custom Certificates",
      "5,000 WhatsApp Alerts / mo",
    ],
    is_popular: true,
  },
  {
    plan_name: "Enterprise",
    display_name: "Enterprise Multi-Branch",
    description: "Unrestricted scale for large institutions (100k+ students) with priority SLA.",
    monthly_price: 9999,
    half_yearly_price: 52999, // ~12% discount
    yearly_price: 89999,     // ~25% discount
    max_students: 100000,
    max_teachers: 5000,
    max_whatsapp_credits: 50000,
    includes_biometric: true,
    includes_custom_certificates: true,
    includes_inventory: true,
    includes_visitor_pass: true,
    features: [
      "Everything in Pro Plan",
      "Unlimited Students & Staff",
      "50,000 WhatsApp Broadcasts",
      "Dedicated Database Sharding",
      "Visitor Pass & Gate Badge Print",
      "Multi-Branch Central Admin",
      "24/7 Priority Phone Support",
      "Custom Domain & White Labelling",
    ],
    is_popular: false,
  },
];

export const GetPlans = async (_req: any, res: Response) => {
  try {
    let plans = await Plan.find().lean();
    if (!plans || plans.length === 0) {
      plans = await Plan.insertMany(DEFAULT_PLANS) as any;
    }
    return res.status(200).json({ success: true, data: plans });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetCurrentSubscription = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    let sub = await Subscription.findOne({
      organization_id: organizationId,
      status: "ACTIVE",
    })
      .sort({ end_date: -1 })
      .lean();

    if (!sub) {
      // Default active plan for trial/demo
      const now = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(now.getFullYear() + 1);

      sub = {
        _id: "demo-sub-id",
        organization_id: organizationId,
        plan_name: "Enterprise",
        billing_cycle: "YEARLY",
        price_paid: 89999,
        start_date: now,
        end_date: nextYear,
        status: "ACTIVE",
        payment_method: "UPI",
        transaction_id: "TXN-DEMO-2026-99",
        invoice_no: "INV-2026-0001",
        auto_renew: true,
      } as any;
    }

    const activeSub: any = sub;
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((new Date(activeSub.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return res.status(200).json({
      success: true,
      data: {
        ...activeSub,
        days_remaining: daysRemaining,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const SubscribeOrUpgrade = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { plan_name, billing_cycle, payment_method, transaction_id } = req.body;

  if (!plan_name || !billing_cycle) {
    return res.status(400).json({ success: false, message: "plan_name and billing_cycle are required" });
  }

  try {
    const plan = DEFAULT_PLANS.find((p) => p.plan_name === plan_name);
    if (!plan) return res.status(404).json({ success: false, message: "Selected plan not found" });

    let price = plan.monthly_price;
    let daysToAdd = 30;

    if (billing_cycle === "HALF_YEARLY") {
      price = plan.half_yearly_price;
      daysToAdd = 180;
    } else if (billing_cycle === "YEARLY") {
      price = plan.yearly_price;
      daysToAdd = 365;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    const invoiceCount = await Subscription.countDocuments({ organization_id: organizationId });
    const invoice_no = `INV-${new Date().getFullYear()}-${(invoiceCount + 1).toString().padStart(4, "0")}`;
    const txnId = transaction_id || `TXN-PAY-${Date.now().toString().slice(-8)}`;

    // Deactivate existing active subscriptions
    await Subscription.updateMany(
      { organization_id: organizationId, status: "ACTIVE" },
      { status: "CANCELLED" }
    );

    const subscription = await Subscription.create({
      organization_id: organizationId,
      plan_name,
      billing_cycle,
      price_paid: price,
      start_date: startDate,
      end_date: endDate,
      status: "ACTIVE",
      payment_method: payment_method || "UPI",
      transaction_id: txnId,
      invoice_no,
      auto_renew: true,
    });

    return res.status(201).json({
      success: true,
      message: `Successfully subscribed to ${plan_name} (${billing_cycle}) Plan!`,
      data: subscription,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetInvoices = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip } = getPagination(req);

  try {
    const [invoices, total] = await Promise.all([
      Subscription.find({ organization_id: organizationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Subscription.countDocuments({ organization_id: organizationId }),
    ]);

    return res.status(200).json({
      success: true,
      data: invoices,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
