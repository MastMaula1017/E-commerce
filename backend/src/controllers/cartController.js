import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// GET /api/cart - get cart for current user
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price images slug stock"
    );

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// POST /api/cart/items - add item or increase quantity
export const addItem = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ msg: "productId is required" });
  }

  try {
    const userId = req.user.id;
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({ msg: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const qtyToAdd = Number(quantity) || 1;
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    const currentQty = existingItem ? existingItem.quantity : 0;
    const desiredQty = currentQty + qtyToAdd;

    if (desiredQty > product.stock) {
      return res.status(400).json({ msg: "Not enough stock available" });
    }

    if (existingItem) {
      existingItem.quantity = desiredQty;
    } else {
      cart.items.push({
        product: productId,
        quantity: qtyToAdd,
        priceAtAdd: product.price,
      });
    }

    await cart.save();

    const populated = await cart.populate(
      "items.product",
      "name price images slug stock"
    );

    res.status(200).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// PUT /api/cart/items - update item quantity (set absolute quantity)
export const updateItem = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity == null) {
    return res
      .status(400)
      .json({ msg: "productId and quantity are required" });
  }

  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ msg: "Item not found in cart" });
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);

      if (!product || !product.isActive) {
        return res.status(404).json({ msg: "Product not found" });
      }

      if (qty > product.stock) {
        return res.status(400).json({ msg: "Not enough stock available" });
      }

      cart.items[itemIndex].quantity = qty;
    }

    await cart.save();

    const populated = await cart.populate(
      "items.product",
      "name price images slug stock"
    );

    res.status(200).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// DELETE /api/cart/items - remove item from cart
export const removeItem = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ msg: "productId is required" });
  }

  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({ msg: "Item not found in cart" });
    }

    await cart.save();

    const populated = await cart.populate(
      "items.product",
      "name price images slug stock"
    );

    res.status(200).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// DELETE /api/cart - clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ msg: "Cart cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
