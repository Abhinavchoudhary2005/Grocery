const Product = require("../modules/product");
const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "grocery_products",
    format: async (req, file) => {
      const allowedFormats = ["jpeg", "jpg", "png", "webp"];
      const fileExtension = file.mimetype.split("/")[1];

      if (!allowedFormats.includes(fileExtension)) {
        throw new Error(
          "Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed."
        );
      }

      return fileExtension;
    },
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname.split(".")[0]}`,
  },
});

const uploadMulter = multer({ storage });

const uploadProduct = async (req, res) => {
  try {
    const { name, category, new_price, old_price, quantity } = req.body;
    if (!req.file) {
      throw new Error("Image file is missing!");
    }
    const image = req.file.path;

    const newProduct = new Product({
      name,
      category,
      new_price,
      old_price,
      image,
      quantity,
      postedBy: req.user.name,
      postedByUserId: req.user._id,
    });

    await newProduct.save();
    res.status(201).json({
      success: true,
      message: "Product uploaded successfully",
      imageUrl: image,
    });
  } catch (error) {
    console.error("❌ Upload Error:", error); // Log the real error
    res.status(500).json({
      success: false,
      error: `Error uploading product: ${error.message}`,
    });
  }
};

module.exports = { uploadMulter, uploadProduct }; // ✅ Fixed export
