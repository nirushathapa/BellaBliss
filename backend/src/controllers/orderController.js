const Order = require("../models/Order");
const Product = require("../models/Product");
const fileStore = require("../utils/fileStore");

const createOrder = async (req, res) => {
  try {
    const { items = [], shippingAddress = {}, totalAmount, paymentMethod } = req.body;

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    if (fileStore.isFileStoreEnabled()) {
      const normalizedItems = items.map((item) => {
        const productId = String(item.product || item.productId);
        const product = fileStore.getProductById(productId);

        if (!product) {
          throw new Error("One or more products were not found");
        }

        return {
          product: product._id,
          name: product.name,
          image: product.image,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || product.price,
        };
      });

      const computedTotal = normalizedItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      const order = fileStore.createOrder({
        user: req.user._id,
        items: normalizedItems,
        shippingAddress,
        totalAmount: Number(totalAmount) || computedTotal,
        paymentMethod: paymentMethod || "cod",
        paymentStatus: "pending",
        status: "pending",
      });

      return res.status(201).json({
        success: true,
        data: order,
      });
    }

    const productIds = items.map((item) => item.product || item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    const normalizedItems = items.map((item) => {
      const productId = String(item.product || item.productId);
      const product = productMap.get(productId);

      if (!product) {
        throw new Error("One or more products were not found");
      }

      return {
        product: product._id,
        name: product.name,
        image: product.image,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || product.price,
      };
    });

    const computedTotal = normalizedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const order = await Order.create({
      user: req.user._id,
      items: normalizedItems,
      shippingAddress,
      totalAmount: Number(totalAmount) || computedTotal,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "khalti" ? "pending" : "pending",
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const orders = fileStore
        .getOrdersByUser(req.user._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    }

    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const order = fileStore.getOrderById(req.params.id, req.user._id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
