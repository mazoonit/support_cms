// const {object, string, date, array} = require('yup');
// const prisma = require('./prisma.js');
// const types = ["WEBINAR", "PODCAST"]
// let event_schema = object({
//     title: string(),
//     subtitle: string(),
//     description: string(),
//     body: string(),
//     /*
//     speakers: array().of(
//         object().shape({
//             name: string().required(),
//             role: string().required()
//         })
//     ),
//     */
//     date: date().required(),
//     type: string().required().test(async (value)=>{
//         for(let index in types){
//             if(types[index] == value){
//                 return true;
//             }
//         }
//         return false;
//     }),
//   });
  
// module.exports = {
//     create_event: async function(event){
//         let data = {
//             title: event.title,
//             subtitle: event.subtitle,
//             description: event.description,
//             body: event.body,
//             date: event.date,
//             type: event.type
//         }
//         await event_schema.validate(data);
//         let eventObj = await prisma.event.create({data: data});
//         if(event.speakers) {
//             let eventSpeakers = [];
//             event.speakers.map((speaker)=>{
//                 let eventSpeaker = {
//                     speaker_id: speaker,
//                     event_id: eventObj.id
//                 }
//                 eventSpeakers.push(eventSpeaker)
//             })
//             console.log(eventSpeakers);
//             let test = await prisma.eventSpeaker.createMany({data: eventSpeakers})
//             console.log(test);
//         }
//         return eventObj;
//     },
//     update_event: async function(updates){
//         // pre-operations
//         let event = await prisma.event.findUnique({where:{id: updates.id}});
//         for (const key in updates){
//             event[key] = updates[key];      
//         }
//         // validate
//         await event_schema.validate(event);
//         // update
//         return await prisma.event.update({
//             data: event,
//             where:{
//                 id: event.id
//             }
//         })
//     }
// }




const {object, string, date, array} = require('yup');
const yup = require('yup');

const prisma = require('./prisma.js');
const types = ["WEBINAR", "PODCAST"]

// const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/;

let event_schema = object({
    title: string(),
    subtitle: string(),
    description: string(),
    body: string(),
    speakers: array().of(
        object().shape({
            name: string().required(),
            role: string().required()
        })
    ),
    date: yup.string().matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'Invalid date format (YYYY-MM-DD)').required(),
    time: yup.string().matches(/^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/, 'Invalid time format').required(),
    type: string().required().test(async (value)=>{
        for(let index in types){
            if(types[index] == value){
                return true;
            }
        }
        return false;
    }),
  });
  
module.exports = {
    create_event: async function(event){
        console.log(event.user , "event.user")
        await event_schema.validate(event);
        let eventObj = await prisma.event.create({
            data: {
              type: event.type,
              date: event.date,
              time: event.time,
              title: event.title,
              subtitle: event.subtitle,
              description: event.description,
              body: event.body,
              speakers: {
                create: event.speakers // Create speakers related to the event
              },
            //   user: {
            //     connect: { id: event.user.id }
            //   }
            }
          });
        return eventObj;
    },
    update_event: async function(updates){
        // pre-operations
        let event = await prisma.event.findUnique({where:{id: updates.id}});
        for (const key in updates){
            event[key] = updates[key];      
        }
        // validate
        await event_schema.validate(event);
        // update
        return await prisma.event.update({
            data: event,
            where:{
                id: event.id
            }
        })
    }
}