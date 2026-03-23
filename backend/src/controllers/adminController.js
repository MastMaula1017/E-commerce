import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// GET /api/admin/users - list users with pagination
export const listUsers = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [users, totalUsers] = await Promise.all([
      User.find({})
        .select("name email role isActive createdAt")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      User.countDocuments({}),
    ]);

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    res.status(200).json({
      items: users,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems: totalUsers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// PATCH /api/admin/users/:id/status - activate/deactivate a user
export const updateUserStatus = async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ msg: "isActive (boolean) is required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { returnDocument: "after", runValidators: true }
    ).select("name email role isActive createdAt");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /api/admin/metrics - basic dashboard metrics
export const getAdminMetrics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalProducts,
      activeProducts,
      totalOrders,
      paidOrders,
      salesAgg,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      Product.countDocuments({}),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({}),
      Order.countDocuments({ paymentStatus: "paid" }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
    ]);

    const totalSales = salesAgg[0]?.total || 0;

    res.status(200).json({
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
      },
      orders: {
        total: totalOrders,
        paid: paidOrders,
        totalSales,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ADMIN: GET /api/orders/admin/all - list all orders
export const getAllOrders = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const [orders, totalOrders] = await Promise.all([
      Order.find({})
        .populate("user", "name email")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Order.countDocuments({}),
    ]);

    const totalPages = Math.ceil(totalOrders / limit) || 1;

    res.status(200).json({
      items: orders,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems: totalOrders,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ADMIN: PATCH /api/orders/:id/status - update status/paymentStatus
export const updateOrderStatus = async (req, res) => {
  const { status, paymentStatus } = req.body;

  try {
    const update = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, {
    returnDocument: "after",
  });

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
