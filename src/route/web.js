import express from "express";
import homeController from "../controllers/homeController"
// import loginController from "../controllers/admin/loginController"
import userController from "../controllers/userController"
import doctorController from "../controllers/doctorController"
let router = express.Router();
let initWebRoutes = (app) => {
    router.get('/',homeController.getHomePage);
    router.get('/crud',homeController.getCRUD);
    router.post('/post-crud',homeController.postCRUD);
    router.get('/get-crud',homeController.displayGETCRUD);
    router.get('/edit-crud',homeController.getEditCrud);
    router.post('/put-crud',homeController.putCRUD);
    router.get('/delete-crud',homeController.deleteCRUD);
    // router.get('/admin',loginController.login),
    router.post('/api/login',userController.handleLogin);
    router.get('/api/get-all-user',userController.handleGetAllUser);
    router.post('/api/create-new-user',userController.handleCreateNewUser);
    router.put('/api/edit-user',userController.handleEditUser);
    router.delete('/api/delete-user',userController.handleDeleteUser);
    router.get('/api/allcode',userController.getAllCode);
    router.get('/api/top-doctor',doctorController.getTopDoctorHome);
    router.get('/api/get-all-doctor',doctorController.getAllDoctor);
    router.post('/api/save-doctor-info',doctorController.postTopDoctor);
    router.get('/api/get-detail-doctor-by-id',doctorController.getDetailDoctor);
    router.post('/api/bulk-create-schedule', doctorController.bulkCreateSchedule);
    router.get('/api/get-schedule-doctor-by-date',doctorController.getScheduleByDate);



    return app.use("/", router);
}
module.exports = initWebRoutes;