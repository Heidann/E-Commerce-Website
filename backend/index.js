const port = 4000;
const express = require("express");
var app = express();
const mongoose = require("mongoose"); //MongoDB ORM
const jwt = require("jsonwebtoken"); // JSON Web Token for authentication
const multer = require("multer"); //  Middleware for handling multipart/form-data
const path = require("path");
const cors = require("cors"); //  Cross Origin Resource Sharing (CORS) middleware for node.js
const { error } = require("console");

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

app.listen(port, (error) => {
  if (!error) {
    console.log(`Server  is listening on ${port}`);
  } else {
    console.log("Error : ", error);
  }
});
