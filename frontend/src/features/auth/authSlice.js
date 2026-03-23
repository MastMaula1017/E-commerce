import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
});

export const selectCurrentUser = (state) => state.auth.user;
export default authSlice.reducer;
 