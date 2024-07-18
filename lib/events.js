const {object, string, date, array} = require('yup');
const prisma = require('./prisma.js');
const types = ["WEBINAR", "PODCAST"]
let event_schema = object({
    title: string(),
    subtitle: string(),
    description: string(),
    body: string(),
    /*
    speakers: array().of(
        object().shape({
            name: string().required(),
            role: string().required()
        })
    ),
    */
    date: date().required(),
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
        await event_schema.validate(event);
        let event = await prisma.event.create({data: event});
        let eventSpeakers = [];
        event.speakers.map((speaker)=>{
            let eventSpeaker = {
                speaker_id: speaker,
                event_id: event.id
            }
            eventSpeakers.push(eventSpeaker)
        })
        await prisma.eventSpeaker.createMany({data: eventSpeakers})
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