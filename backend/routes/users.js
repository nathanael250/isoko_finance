const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

// Import validation middleware
const {
    createUserValidation,
    updateUserValidation
} = require('../middleware/validation');

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'User routes working'
    });
});

// User routes
router.get('/', getUsers);
router.post('/', createUserValidation, createUser);
router.get('/:id', getUser);
router.put('/:id', updateUserValidation, updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
