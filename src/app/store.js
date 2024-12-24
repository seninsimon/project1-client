import { configureStore } from "@reduxjs/toolkit";
import signupReducer from "../features/auth/signupSlice";
import loginReducer from "../features/auth/loginSlice";
import googleLoginReducer from "../features/auth/googleAuthSlice";


export const store = configureStore({

    reducer:
    {
        signup: signupReducer,
        login : loginReducer,
        //otp reducer if needed
        googleAuth : googleLoginReducer

    }

})

export default store