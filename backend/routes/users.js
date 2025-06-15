const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getDashboard,
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const {protect} = require('../middleware/auth')
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

router.get('/dashboard',protect, getDashboard);

// User routes
router.get('/', getUsers);
router.post('/', createUserValidation, createUser);
router.get('/:id', getUser);
router.put('/:id', updateUserValidation, updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
