const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// For multipart upload: check that multer produced a file
const checkFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }
  next();
};

const captionFromUrlValidation = [
  body('url').trim().notEmpty().withMessage('Image URL is required').isURL().withMessage('Invalid URL'),
];

module.exports = { registerValidation, loginValidation, runValidation, checkFile, captionFromUrlValidation };
