const port = 4000;
const express = require("express");
var app = express();
const mongoose = require("mongoose"); //MongoDB ORM
const jwt = require("jsonwebtoken"); // JSON Web Token for authentication
const multer = require("multer"); //  Middleware for handling multipart/form-data
const path = require("path");
const cors = require("cors"); //  Cross Origin Resource Sharing (CORS) middleware for node.js
const { error, log } = require("console");
const { type } = require("os");

app.use(express.json()); //  Parse incoming requests with JSON payloads and return responses with JSON payloads
app.use(cors()); //

// Database connection with  MongoDB
mongoose.connect(
  "mongodb+srv://phhaidann:007007007@cluster0.xkj4mm5.mongodb.net/Ecommerce_Fashion"
);

// API creation
app.get("/", (req, res) => {
  res.send({ message: "Welcome to eCommerce API!" });
});

// Image storage engine
const storage = multer.diskStorage({
  // Định nghĩa thư mục đích để lưu trữ các tệp tin được tải lên
  destination: "./upload/images",

  // Định nghĩa tên của tệp tin sau khi được lưu trữ
  filename: (req, file, cb) => {
    // Callback function trả về tên của tệp tin
    return cb(
      null,
      // Định dạng tên tệp tin: <tên trường của tệp>_<thời gian hiện tại>_<phần mở rộng của tệp tin gốc>
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Khởi tạo middleware upload để xử lý việc tải lên các tệp tin
const upload = multer({ storage: storage });

// Sử dụng middleware `express.static()` để phục vụ các tệp tĩnh
// Endpoint này sẽ phục vụ các tệp tĩnh từ thư mục được chỉ định cho mọi yêu cầu tới đường dẫn "/images"
app.use("/images", express.static("upload/images"));

// Tạo endpoint POST để xử lý yêu cầu tải lên hình ảnh
app.post("/upload", upload.single("product"), (req, res) => {
  // Trả về JSON object chứa thông tin về việc tải lên thành công và URL của hình ảnh tải lên
  res.json({
    success: 1,
    // Địa chỉ URL của hình ảnh tải lên, bao gồm địa chỉ localhost và tên file
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// Schema for creating products
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  image: {
    type: String,
    require: true,
  },
  category: {
    type: String,
    require: true,
  },
  new_price: {
    type: Number,
    require: true,
  },
  old_price: {
    type: Number,
    require: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  avilable: {
    type: Boolean,
    default: true,
  },
});

app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log("Saved");

  res.json({
    success: true,
    name: req.body.name,
  });
});

// Creating API for deleting
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Creating API for getting all product
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products Fetched");
  res.send(products);
});

// schema creating for User model
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// creating Endpoint for register the user
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res
      .status(400)
      .json({ success: false, errors: "Email already exists" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });
  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };
  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

//creating endpoint for user login
app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password == user.password;
    if (passCompare) {
      const data = {
        user: { id: user.id },
      };
      const token = jwt.sign(data, "secret_ecom");
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Wrong Password" });
    }
  } else {
    res.json({ success: false, errors: "Wrong Email Id" });
  }
});

app.listen(port, (error) => {
  if (!error) {
    console.log(`Server  is listening on ${port}`);
  } else {
    console.log("Error : ", error);
  }
});
