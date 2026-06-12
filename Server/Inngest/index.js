import { Inngest } from "inngest";
import { User } from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

//function to add a user to the data base
const createUser = inngest.createFunction(
    { id: 'sync-user-from-clerk', triggers: [{ event: "clerk/user.created" }] },
    async ({event}) => {
        const {id, first_name, last_name, image_url, email_addresses} = event.data
        const user = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(user)
    }
)

//function to delete the user from db
const deleteUser = inngest.createFunction(
    { id: 'delete-user-from-clerk', triggers: [{ event: "clerk/user.deleted" }] },
    async ({event}) => {
        const {id} = event.data
        await User.findByIdAndDelete(id)
    }
)

//Function to update the user details
const updateUser = inngest.createFunction(
    { id: 'update-user-from-clerk', triggers: [{ event: "clerk/user.updated" }] },
    async ({event}) => {
        const {id, first_name, last_name, image_url, email_addresses} = event.data
        const user = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id, user)
    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [
    createUser,
    deleteUser,
    updateUser
];