const router = require('koa-router')()
const departmentController = require('../../app/controllers/department-controller');

router.get('/all', departmentController.getAllDepartments);

router.post('/save', departmentController.updateDepartment);
router.get('/save', departmentController.updateDepartment);

router.post('/add', departmentController.createDepartment);
router.get('/add', departmentController.createDepartment);

router.post('/remove', departmentController.removeDepartment);
router.get('/remove', departmentController.removeDepartment);

module.exports = router;