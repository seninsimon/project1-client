import { createSlice , createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";





export const cartFetchThunk = createAsyncThunk('cart/cartFetchThunk' , async (id , {rejectWithValue})=>
{
    try {

        const response = await axiosClient('/cart')
        
    } catch (error) {
        rejectWithValue(error.response)
    }
})


const initialState = {
    id : null
}


const cartSlice = createSlice(
    {
        name : "cart" ,
        initialState,
        reducers:{},
        extraReducers : (builder)=>
        {
            builder
            .addCase()
        }

    }
)