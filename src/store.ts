import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit';
// import usersReducer from '@/slices/users/usersSlice';
// import studentsReducer from '@/slices/students/studentsSlice';
import meetingsReducer from '@/slices/meetings/meetingsSlice';
// import settingsReducer from '@/slices/settings/settingsSlice';
// import { PrismaClient } from '@prisma/client';
import { prisma } from '@/server/db'
import { type GetServerSideProps } from 'next';


// Define your async thunk to fetch data
export const fetchMeetingsFromDatabase: GetServerSideProps = (): ThunkAction<void, RootState, unknown, Action<string>> => async (dispatch) => {
  try {
    dispatch(fetchMeetingsStart());

    // Use Prisma to query your Postgres Database
    const meetings = await prisma.meetingsData.findMany();

    dispatch(fetchMeetingsSuccess(meetings));
  } catch (error) {
    dispatch(fetchMeetingsFailure(error.message));
  }
};

const store = configureStore({
  reducer: {
    meetings: meetingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;