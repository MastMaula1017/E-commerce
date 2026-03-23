import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
});

export const selectCartItems = (state) => state.cart.items;
export default cartSlice.reducer;
