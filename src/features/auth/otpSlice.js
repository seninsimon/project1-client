import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios';
import axiosClient from "../../api/axiosClient";

export const otpThunk = createAsyncThunk("otp/otpThunk", async (otpData, { rejectWithValue }) => {
    try {
        const response = await axiosClient.post("/verifyotp", { otpData });
        console.log("response from server : ", response);
        localStorage.setItem("usertoken",response.data.usertoken)
    } catch (error) {
        console.log(error?.response?.message || "invalid otp");
        return rejectWithValue(error?.response?.message || "invalid otp");
    }
});

const initialState = {
    otp: null,
    loading: false,
    error: null
};

const otpSlice = createSlice({
    name: "otp",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(otpThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(otpThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.otp = action.payload;
                state.error = null;
            })
            .addCase(otpThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default otpSlice.reducer;