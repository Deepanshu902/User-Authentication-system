import {Router } from "express"
import {
    registerUser,loginUser,currentUser,assignRole,logoutUser,changeCurrentPassword
} from "../controllers/user.controller.js"

import { verifyJwt } from "../middleware/auth.middleware.js"


const router  = Router()


router.route("/login").post(loginUser)


router.route("/change-password").post(verifyJwt,changeCurrentPassword)

router.route("/current-user").get(verifyJwt,currentUser)

router.route("/register").post(registerUser)

router.route("/role").post(verifyJwt,assignRole)

router.route("/logout").post(verifyJwt,logoutUser)



export default router 