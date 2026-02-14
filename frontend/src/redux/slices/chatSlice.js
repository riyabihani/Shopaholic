import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchRecommendations = createAsyncThunk("chat/fetchRecommendations", async ({ message }, { rejectWithValue }) => {
  try{
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat/recommend`, {message}, {headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const chatSlice = createSlice({
  name: "chat",
  initialState: {messages: [{id:crypto.randomUUID(), role: 'assistant', text: "Tell me what you're looking for (budget, size, color, vibe) and I will recommend products", products: []}]},
  reducers: {
    addUserMessage: {
      reducer(state, action) {
        state.messages.push(action.payload);
      },
      prepare(text) {
        return {
          payload: {id: crypto.randomUUID(), role: "user", text, products: []}
        };
      }
    },
    clearChat(state) {
      state.messages = initialState.messages;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => { 
    builder
    .addCase(fetchRecommendations.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchRecommendations.fulfilled, (state, action) => {
      state.loading = false;
      const { filteredApplied, results } = action.payload || {};
      const text = results?.length ? 'Here are a few picks based on your need' : 'No perfcet match found. WOuld you like to change the budget, size or color?';
      
      state.messages.push({id: crypto.randomUUID(), role: "assistant", text, products: results || [], filteredApplied: filteredApplied || {}});
    })
    .addCase(fetchRecommendations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch recommendations";
      state.messages.push({id: crypto.randomUUID(), role: "assistant", text: "Something broke on my end. Please try again!", products: []});
    });
  }
});

export const { addUserMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;