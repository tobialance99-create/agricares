import { createSlice } from '@reduxjs/toolkit'

const appSlice = createSlice({
    name: 'app',
    initialState: {
        isLoading: false,
        sessionExpired: false,
    },
    reducers: {
        setAppLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setSessionExpired: (state, action) => {
            state.sessionExpired = action.payload
        },
    },
})

export const { setAppLoading, setSessionExpired } = appSlice.actions
export default appSlice.reducer
