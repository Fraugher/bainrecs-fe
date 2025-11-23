// import { handleError } from './errorHandler.js';
import axios from 'axios';

export async function getPythonAnywhereAPI (route, id) {
    const useRoute = route.replace("{id}", id);
    const API_URL =  encodeURI(process.env.PYTHONANYWHERE_API_BASE_URL + useRoute);
    const API_KEY =  process.env.PYTHONANYWHERE_API_KEY;
//    'kZy0KjMTT5nsZunDxXbqHiSE6FWUvt4gD7OWJMobS58h9kEZVRR8rPoPePyR87yo'
  
  try {
    const response = await axios.get(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': API_KEY, 
          }
      });

    // Return data from the external PythonAnywhere API
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow CORS for your frontend
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: response.data }),
    }
  } 
  catch (error) {
    if (error.response) {
        return {
          statusCode: error.response.status,
          headers: {
            "Access-Control-Allow-Origin": "*", // Allow CORS for your frontend
            "Access-Control-Allow-Methods": "GET",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(error.response.data),
        }
    }
    console.error(`Error calling external API (${API_URL}):`, error);
    return {
      statusCode: 500,
      headers: {
          "Access-Control-Allow-Origin": "*", // Allow CORS for your frontend
          "Access-Control-Allow-Methods": "GET",
          "Content-Type": "application/json",
        },
      body: JSON.stringify( {error: `Failed to fetch data from external API (${API_URL})` }),
    };
  }
};