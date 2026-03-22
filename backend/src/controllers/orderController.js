import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Helper to calculate totals (simple version: no tax/shipping yet)
const calculateTotals = (items) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = 0; // placeholder for future tax logic
  const shipping = 0; // placeholder for future shipping logic
  const grandTotal = subtotal + tax + shipping;

  return { subtotal, tax, shipping, grandTotal };
};

// POST /api/orders - create order from current cart
export const createOrderFromCart = async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress } = req.body;

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
    return res.status(400).json({ msg: "Incomplete shipping address" });
  }

  try {
    let cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price images slug stock isActive"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: "Cart is empty" });
    }

    // Re-check stock and build order items snapshot
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({ msg: "One of the products is no longer available" });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({ msg: `Not enough stock for product ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0],
        price: item.priceAtAdd ?? product.price,
        quantity: item.quantity,
      });
    }

    const totals = calculateTotals(orderItems);

    const order = await Order.create({
      user: userId,
      items: orderItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      grandTotal: totals.grandTotal,
      shippingAddress,
    });

    // Adjust inventory
    for (const item of cart.items) {
      const product = item.product;
      product.stock -= item.quantity;
      await product.save();
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /api/orders - list current user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort("-createdAt");
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /api/orders/:id - get single order (user or admin)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.product",
      "name price images slug"
    );

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Only owner or admin can view
    if (
      order.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ADMIN: GET /api/orders/admin/all - list all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort("-createdAt");

    res.status(200).json(orders);
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
      new: true,
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
