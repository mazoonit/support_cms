const {object, string, date, array} = require('yup');
const prisma = require('./prisma.js');
let speaker_schema = object({
    name: string(),
    role: string(),
  });
  
module.exports = {
    create_speaker: async function(speaker){
        await speaker_schema.validate(speaker);
        await prisma.speaker.create({data: speaker});
    },
    update_speaker: async function(updates){
        // pre-operations
        let speaker = await prisma.speaker.findUnique({where:{id: updates.id}});
        for (const key in updates){
            speaker[key] = updates[key];      
        }
        // validate
        await speaker_schema.validate(speaker);
        // update
        return await prisma.speaker.update({
            data: speaker,
            where:{
                id: speaker.id
            }
        })
    }
}