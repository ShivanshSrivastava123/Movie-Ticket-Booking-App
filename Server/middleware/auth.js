import { clerkClient } from "@clerk/express";

const protectAdmin = async(req , res , next) => {
    const {userId} = req.auth()

    const user = await clerkClient.users.getUser(userId)

    // console.log("CLERK METADATA:", user.privateMetadata);

    if(user.privateMetadata.role !== 'admin') {
        return res.json({success: true, message:`not authorized`})
    }

    next()
}

export default protectAdmin