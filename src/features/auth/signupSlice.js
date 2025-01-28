import { createAsyncThunk , createSlice, isRejected } from "@reduxjs/toolkit";
import axios from 'axios';
import axiosClient from "../../api/axiosClient";

export const signupThunk = createAsyncThunk("signup/signupThunk" , async (signupData , {rejectWithValue}) => {
    try {
        const response = await axiosClient.post("/signup", signupData);

        console.log("response from server : ", response);
        console.log(response.data.message);
    } catch (error) {
        return rejectWithValue("error in registering user ");
    }
});

const initialState = {
    user : null,
    loading : false,
    error : null
};

const singupSlice = createSlice({
    name : "signup",
    initialState,
    reducers:{},
    extraReducers : (builder) => {
        builder
            .addCase(signupThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(signupThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default singupSlice.reducer;