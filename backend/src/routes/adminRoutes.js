const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/courses', adminController.getCourses);
router.get('/courses/list', adminController.getCoursesList);
router.post('/courses', adminController.createCourse);
router.get('/metrics', adminController.getMetrics);
router.get('/users', adminController.getUsers);
router.post('/users/create', adminController.createStudent);
router.put('/users/:cedula/courses', adminController.updateStudentCourses);

module.exports = router;
