import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios'
import axiosClient from "../../api/axiosClient";



export const googleLoginThunk = createAsyncThunk(
    "googleLogin/googleLoginThunk",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/googleauth", { credentials });
            return response.data; // Return backend response
        } catch (error) {
            return rejectWithValue(error.response.data || error.message); // Handle errors
        }
    }
);


const initialState = {
    user: null,
    loading: false,
    error: null
}

const googleLoginSlice = createSlice({
    name: "googleLogin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {

        builder
            .addCase(googleLoginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLoginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(googleLoginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


    }
})

export default googleLoginSlice.reducer
