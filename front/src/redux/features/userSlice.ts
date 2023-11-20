import { axiosInstance } from "@/utils/axiosInstance";
import {
  ContactData,
  UpdateUser,
  User,
  UserLogin,
  UserState,
} from "@/utils/types";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addError, removeError } from "./uiSlice";

//get logged in user
export const getUser = createAsyncThunk("user/getUser", async (_, thunkAPI) => {
  try {
    const { data } = await axiosInstance.get<UserState>("/user/me", {
      withCredentials: true,
    });

    thunkAPI.dispatch(removeError("getUserError"));
    thunkAPI.dispatch(login());
    return data;
  } catch (error: any) {
    thunkAPI.dispatch(
      addError({ id: "getUserError", message: error.response.data })
    );
    throw thunkAPI.rejectWithValue(error.response.data);
  }
});

//register user
export const registerUser = createAsyncThunk(
  "user/register",
  async (user: User, thunkAPI) => {
    try {
      const { data } = await axiosInstance.post<{
        token: string;
        message: string;
      }>("/user/register", user, { withCredentials: true });
      thunkAPI.dispatch(removeError("registerError"));
      thunkAPI.dispatch(login());
    } catch (error: any) {
      thunkAPI.dispatch(
        addError({ id: "registerError", message: error.response.data })
      );
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);
//login user
export const loginUser = createAsyncThunk(
  "user/login",
  async (user: UserLogin, thunkAPI) => {
    try {
      const response = await axiosInstance.post<{
        token: string;
        message: string;
      }>("/user/login", user, { withCredentials: true });
      thunkAPI.dispatch(removeError("loginError"));
      thunkAPI.dispatch(login());
    } catch (error: any) {
      thunkAPI.dispatch(
        addError({ id: "loginError", message: error.response.data })
      );
      throw thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

//send email

export const sendEmail = createAsyncThunk(
  "mail/send",
  async (contactData: ContactData, thunkAPI) => {
    try {
      await axiosInstance.post("/mail/send", contactData);
      thunkAPI.dispatch(removeError("sendMailError"));
    } catch (error: any) {
      thunkAPI.dispatch(
        addError({ id: "sendMailError", message: error.response.data })
      );
      throw thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

//logout user

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      await axiosInstance.post("/user/logout", _, { withCredentials: true });
      thunkAPI.dispatch(logout());
      thunkAPI.dispatch(removeError("logoutError"));
    } catch (error: any) {
      thunkAPI.dispatch(
        addError({ id: "logoutError", message: error.response.data })
      );
      throw thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

//check old password
export const changePasswordAction = createAsyncThunk(
  "user/changePassword",
  async (data: { oldPassword: string; newPassword: string }, thunkAPI) => {
    try {
      await axiosInstance.patch(
        "/user/changePassword",
        { ...data },
        {
          withCredentials: true,
        }
      );
      thunkAPI.dispatch(removeError("changePasswordError"));
    } catch (error: any) {
      thunkAPI.dispatch(
        addError({ id: "changePasswordError", message: error.response.data })
      );
      throw thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

//update profile settings

export const updateUserAction = createAsyncThunk(
  "/user/editProfile",
  async (user: UpdateUser, thunkAPI) => {
    try {
      const response = await axiosInstance.patch("/user", user, {
        withCredentials: true,
      });
      thunkAPI.dispatch(setUser(response.data));
      thunkAPI.dispatch(removeError("updateUserError"));
    } catch (error: any) {
      thunkAPI.dispatch(
        addError({ id: "updateUserError", message: error.response.data })
      );
      throw thunkAPI.rejectWithValue(error.response.data);
    }
  }
);
const initialState: UserState = {
  isLoggedIn: false,
  username: "",
  name: "",
  surname: "",
  email: "",
  role: "",
  planName: "No_Plan",
  startDate: "",
  endDate: "",
};
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state) => {
      state.isLoggedIn = true;
    },
    logout(state) {
      state.isLoggedIn = false;
    },
    setUser(state, action: PayloadAction<UpdateUser>) {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      getUser.fulfilled,
      (state, action: PayloadAction<UserState>) => {
        return { ...state, ...action.payload };
      }
    );
    builder.addCase(logoutUser.fulfilled, (state) => {
      return initialState;
    });
  },
});
export default userSlice.reducer;
export const { login, setUser, logout } = userSlice.actions;
