const {object, string } = require('yup');
const prisma = require('./prisma.js');

let speaker_schema = object({
    name: string().required(),
    role: string().required(),
  });
  
module.exports = {
    create_speaker: async function(speaker){
        await speaker_schema.validate(speaker);
        return await prisma.speaker.create({data: speaker});
    },
    // update_speaker: async function(updates){
    //     // pre-operations
    //     let speaker = await prisma.speaker.findUnique({where:{id: updates.id}});
    //     for (const key in updates){
    //         speaker[key] = updates[key];
            
    //     }
    //     if(typeof speaker.speakers == 'string'){
    //         speaker.speakers = JSON.parse(speaker.speakers);
    //     }
    //     // validate
    //     await speaker_schema.validate(speaker);
        
    //     speaker.speakers = JSON.stringify(speaker.speakers);
    //     // update
    //     return await prisma.speaker.update({
    //         data: speaker,
    //         where:{
    //             id: speaker.id
    //         }
    //     })
    // }
}