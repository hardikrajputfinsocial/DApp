import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { futuresAPI } from "../../services/api";

// Async thunks
export const fetchAllFutures = createAsyncThunk(
  "futures/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await futuresAPI.getAllFutures();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const fetchFutureById = createAsyncThunk(
  "futures/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await futuresAPI.getFutureById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const createFuture = createAsyncThunk(
  "futures/create",
  async ({ futureData, privateKey }, { rejectWithValue }) => {
    try {
      const response = await futuresAPI.createFuture(futureData, privateKey);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateFuture = createAsyncThunk(
  "futures/update",
  async ({ id, updateData, privateKey }, { rejectWithValue }) => {
    try {
      const response = await futuresAPI.updateFuture(
        id,
        updateData,
        privateKey
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const fulfillFuture = createAsyncThunk(
  "futures/fulfill",
  async ({ id, privateKey }, { rejectWithValue }) => {
    try {
      const response = await futuresAPI.fulfillFuture(id, privateKey);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

const initialState = {
  futures: [],
  currentFuture: null,
  loading: false,
  error: null,
  success: false,
};

const futuresSlice = createSlice({
  name: "futures",
  initialState,
  reducers: {
    clearCurrentFuture: (state) => {
      state.currentFuture = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all futures cases
      .addCase(fetchAllFutures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFutures.fulfilled, (state, action) => {
        state.loading = false;
        state.futures = action.payload;
      })
      .addCase(fetchAllFutures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch futures";
      })

      // Fetch future by ID cases
      .addCase(fetchFutureById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFutureById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFuture = action.payload;
      })
      .addCase(fetchFutureById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch future";
      })

      // Create future cases
      .addCase(createFuture.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createFuture.fulfilled, (state, action) => {
        state.loading = false;
        state.futures.push(action.payload);
        state.currentFuture = action.payload;
        state.success = true;
      })
      .addCase(createFuture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create future";
        state.success = false;
      })

      // Update future cases
      .addCase(updateFuture.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateFuture.fulfilled, (state, action) => {
        state.loading = false;
        state.futures = state.futures.map((future) =>
          future.id === action.payload.id ? action.payload : future
        );
        state.currentFuture = action.payload;
        state.success = true;
      })
      .addCase(updateFuture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update future";
        state.success = false;
      })

      // Fulfill future cases
      .addCase(fulfillFuture.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fulfillFuture.fulfilled, (state, action) => {
        state.loading = false;
        state.futures = state.futures.map((future) =>
          future.id === action.payload.id ? action.payload : future
        );
        state.currentFuture = action.payload;
        state.success = true;
      })
      .addCase(fulfillFuture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fulfill future";
        state.success = false;
      });
  },
});

export const { clearCurrentFuture, clearSuccess, clearError } =
  futuresSlice.actions;
export default futuresSlice.reducer;
