import { raw } from 'body-parser'
import db from '../models/index'
require('dotenv').config
import _, { reject } from 'lodash';

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE
let getTopDoctorHome = (limitInput) => {
    return new Promise( async (resolve,reject) => {
        try { 
          let users = await db.User.findAll({
            limit: limitInput, 
            where: {roleId: 'R2'},
            order: [['createdAt','DESC']],
            attributes: {
                exclude: ['password']
               },
               include:[
                  {model: db.Allcode, as : 'positionData',attributes: ['valueEn','valueVi']},
                  {model: db.Allcode, as : 'genderData',attributes: ['valueEn','valueVi']}
               ],
               raw: true,
               nest: true 
            
       
               
          })
          resolve({
            errCode:0,
            data: users
          
          })
          
        } catch (e) {
           reject(e)
        }
      })
}
let getAllDoctorService = () => {
  return new Promise(async(resolve,reject) =>{
    try {
      let doctor = await db.User.findAll({
        where: { roleId: 'R2'},
        attributes: {
          exclude:['image','password']
        }
      });
      resolve({
        errCode:0,
        data: doctor
      })

      
    } catch (e) {
        reject(e);
      
    }
  })
}
let postTopDoctorService = (inputData) => {
  return new Promise(async(resolve,reject) =>{
    try {
       if(!inputData.doctorId || !inputData.contentHTML
         || !inputData.contentMarkdown || !inputData.action || 
         !inputData.selectedPrice || !inputData.selectedPayment || !inputData.selectedProvince || !inputData.nameClinic
         || !inputData.addressClinic || !inputData.note
        ){
           resolve({
            errCode: 1,
            errMessage: 'Missing parameter'
           })
       }
       else{
         if(inputData.action === 'CREATE'){
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId

          })

         }
         else if(inputData.action === 'EDIT'){
          let doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: inputData.doctorId},
            raw: false
          })
          if(doctorMarkdown){
            doctorMarkdown.contentHTML = inputData.contentHTML,
            doctorMarkdown.contentMarkdown =  inputData.contentMarkdown,
            doctorMarkdown.description = inputData.description,
            doctorMarkdown.updatedAt = new Date(),
            await doctorMarkdown.save();

          }
          //upsert to doctor_info
          let doctorInfo = await db.Doctor_Infor.findOne({
            where: { doctorId: inputData.doctorId},
            raw: false
          })
          if(doctorInfo){
            doctorInfo.doctorId = inputData.doctorId,
             doctorInfo.priceId = inputData.selectedPrice,
             doctorInfo.provinceId = inputData.selectedProvince,
             doctorInfo.paymentId = inputData.selectedPayment,
             doctorInfo.addressClinic = inputData.addressClinic,
             doctorInfo.nameClinic = inputData.nameClinic,
             doctorInfo.note = inputData.note,
            await doctorMarkdown.save();

          }
          await db.Doctor_Infor.create({
            doctorId: inputData.doctorId,
          priceId: inputData.selectedPrice,
           provinceId: inputData.selectedProvince,
          paymentId: inputData.selectedPayment,
         addressClinic: inputData.addressClinic,
          nameClinic: inputData.nameClinic,
          note: inputData.note

          })


          
         }
         
          resolve({
            errCode: 0,
            errMessage: 'Save Doctor success'
          })
       }

      
    } catch (e) {
        reject(e);
      
    }
  })
}
let getDetailDoctorIdService = (inputId) => {
  return new Promise(async(resolve,reject)=> {
    try {
      if(!inputId){
        resolve({
          errCode:1,
          errMessage: 'Missing parameter'
        })
      }
      else{
        let dataDoctor = await db.User.findOne({
          where: {
            id: inputId
          },
          attributes:{
            exclude: ['password']
          },
          include:[
            {
              model: db.Markdown, attributes:{ exclude: ['doctorId']}
            },
            {model: db.Allcode, as : 'positionData',attributes: ['valueEn','valueVi']},
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ['id','doctorId']
              },
              include:[
                {model: db.Allcode, as : 'priceTypeData',attributes: ['valueEn','valueVi']},
                {model: db.Allcode, as : 'provinceTypeData',attributes: ['valueEn','valueVi']},
                {model: db.Allcode, as : 'paymentTypeData',attributes: ['valueEn','valueVi']}
             ],
            }

          ], 
          raw: false,
          nest: true
        })
        if(dataDoctor && dataDoctor.image){
          dataDoctor.image = new Buffer(dataDoctor.image, 'base64').toString('binary')
        }
        resolve({
          errCode: 0, 
          data: dataDoctor
        })
      }
      
    } catch (e) {
      console.log(e)

      
    }

  })

}
let bulkCreateScheduleService = (data) => {
   return new Promise(async(resolve,reject) => {
    try {
      if(!data.arrSchedule || !data.doctorId || !data.formateDateTime){
        resolve({
          errCode: 1,
          errMessage: 'Missing required parametter'
        })
      }
      else{
        let schedule = data.arrSchedule;
      
        if(schedule && schedule.length > 0){
          schedule = schedule.map(item => {
            item.maxNumber = MAX_NUMBER_SCHEDULE;
            return item
          })
        
        } 
        // get All
       let existing = await db.Schedule.findAll({
          where: {
            doctorId: data.doctorId,
            date: data.formateDateTime

          },
          attributes:['timeType','date','doctorId','maxNumber'],
          raw: true,
        
       })
    
     
    
     
       //compare difference
       let toCreate = _.differenceWith(schedule,existing, (a,b)=>{
         return  a.timeType === b.timeType &&  +a.date === +b.date
       });
      // create data
      if(toCreate && toCreate.length > 0){
        await db.Schedule.bulkCreate(toCreate);
      }
       
        resolve({
          errCode: 0,
          errMessage: 'OK'
        })

      }    
      
    } catch (e) {
      reject(e)
      
    }
   })
}
let getScheduleByDateService = (doctorId,date) => {
  return new Promise(async(resolve,reject) => {
    try {
        if(!doctorId || !date) {
          resolve({
             errCode: 1,
             errMessage: "Missing the required parameter"
          })
        }
        else{
          let dataSchedule = await db.Schedule.findAll({
            where:{
              doctorId:doctorId,
              date: date
            },
            include:[
               { model: db.Allcode, as: 'timeTypeData',attributes: ['valueEn','valueVi']},
            ],
            raw: true,
            nest: true
          })
          if(!dataSchedule) dataSchedule = [];
          console.log('check database',dataSchedule)
           resolve({
            errCode: 0,
            data: dataSchedule
           })
        }
      
    } catch (e) {
      reject(e)
      
    }
   })

   

}
module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctorService:getAllDoctorService,
    postTopDoctorService: postTopDoctorService, 
    getDetailDoctorIdService: getDetailDoctorIdService,
    bulkCreateScheduleService: bulkCreateScheduleService,
    getScheduleByDateService: getScheduleByDateService
}