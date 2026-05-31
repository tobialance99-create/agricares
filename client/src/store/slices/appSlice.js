import { createSlice } from '@reduxjs/toolkit'

const appSlice = createSlice({
    name: 'app',
    initialState: {
        isLoading: false,
    },
    reducers: {
        setAppLoading: (state, action) => {
            state.isLoading = action.payload
        },
    },
})

export const { setAppLoading } = appSlice.actions
export default appSlice.reducer
