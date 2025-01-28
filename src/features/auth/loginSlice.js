import { createSlice , createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios'
import axiosClient from "../../api/axiosClient";



export const loginThunk = createAsyncThunk("login/loginThunk" , async (loginData , {rejectWithValue})=>
{
    try {

        const response =  await axiosClient.post("/login",loginData)
        console.log('response from server : ',response);
        console.log(response);
        
         
        return loginData
       
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})


const initialState = {
    user : null,
    loading : false,
    error : null
}



const loginSlice = createSlice({
    name : "login",
    initialState,
    reducers:{},
    extraReducers:(builder)=>
    {

        builder
        .addCase(loginThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(loginThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload; // Store the loginData (username and password)
            state.error = null;
        })
        .addCase(loginThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });


    }
})



export default loginSlice.reducer