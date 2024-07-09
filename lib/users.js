const bcrypt = require('bcrypt');
const {object, string} = require('yup');
const prisma = require('./prisma.js');

let user_schema = object({
    user_name: string().required().test(async (value)=>{
        let doesExist = await prisma.user.findUnique({where: {user_name: value}});
        return doesExist ? false : true;
    }),
    password: string().required().min(8)
  });
  
module.exports = {
    create_user: async function(user){
        await user_schema.validate(user)
        let hashed_password = await bcrypt.hash(user.password, 10);
        user.password = hashed_password;
        return await prisma.user.create({data: user});
    },
    change_password: async function({id, old_password, new_password, current_user}){
        let user = await prisma.user.findUniqueOrThrow({where: {id: id}})
        let right_password = await bcrypt.compare(old_password, user.password);
        if(!right_password && current_user?.role != "SUPER_ADMIN"){
            throw new Error("Not Authorized");
        }

        let new_hashed_password = await bcrypt.hash(new_password, 10);
        await prisma.user.update({
            where:{id: id},
            data:{
                password: new_hashed_password
            }
        })
    }
}