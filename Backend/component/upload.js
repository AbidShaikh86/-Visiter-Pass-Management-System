const multer = require('multer');
const path = require('path');

// Setting up storage configuration for multer
const storage = multer.diskStorage({
    // Destination folder
    destination: './uploads/',
    // Filename configuration to avoid name error
    filename: function(req, file, cb) {
        // Generating unique filename
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initializing multer with the defined storage
const upload = multer({
    // Setting storage
    storage: storage,
    // Setting file size limit
    limits: { fileSize: 10000000 },
    // Setting file filter
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
    // Accepting single file with field name photo
}).single('photo');

// Function to check file type
function checkFileType(file, cb) {
    // this type of photos only allowed
    const filetypes = /jpeg|jpg|png/;
    // Checking file extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Checking file mimetype
    const mimetype = filetypes.test(file.mimetype);

    // If mimetype and extension is valid than take file
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

module.exports = upload;
