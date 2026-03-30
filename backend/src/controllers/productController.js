const Product = require("../models/Product");
const fileStore = require("../utils/fileStore");

const getProducts = async (req, res) => {
  try {
    const {
      category,
      featured,
      search,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    if (fileStore.isFileStoreEnabled()) {
      const result = fileStore.getProducts({
        category,
        featured,
        search,
        sort,
        page,
        limit,
      });

      return res.status(200).json({
        success: true,
        count: result.data.length,
        data: result.data,
        pagination: result.pagination,
      });
    }

    const query = {};

    if (category) {
      const categories = category.split(",").map((item) => item.trim());
      query.category = { $in: categories };
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortQuery = { createdAt: -1 };

    if (sort === "price-asc") {
      sortQuery = { price: 1 };
    } else if (sort === "price-desc") {
      sortQuery = { price: -1 };
    } else if (sort === "rating-desc") {
      sortQuery = { rating: -1, reviews: -1 };
    } else if (sort === "name-asc") {
      sortQuery = { name: 1 };
    }

    const currentPage = Number(page) || 1;
    const pageSize = Number(limit) || 12;
    const skip = (currentPage - 1) * pageSize;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortQuery).skip(skip).limit(pageSize),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
      pagination: {
        page: currentPage,
        pages: Math.max(1, Math.ceil(total / pageSize)),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const product = fileStore.getProductBySlug(req.params.slug);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    }

    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const product = fileStore.createProduct(req.body);

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

const getFeaturedProducts = async (req, res) => {
  req.query.featured = "true";
  return getProducts(req, res);
};

const updateProduct = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const product = fileStore.updateProduct(req.params.id, req.body);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const deleted = fileStore.deleteProduct(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
