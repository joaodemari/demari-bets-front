import axios from "axios";

export const api = axios.create({
  baseURL: "https://demari-bets-back.vercel.app/",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Allow-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});
