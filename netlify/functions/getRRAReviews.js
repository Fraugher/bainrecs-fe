import { ApifyClient } from 'apify-client';

const APIFY_API_KEY =  process.env.APIFY_API_KEY; // we also have APIFY_API_KEY_ALT

const client = new ApifyClient({
    token: APIFY_API_KEY,
});
const apiURI ="tri_angle/restaurant-review-aggregator";
const apiURL = "https://api.apify.com/v2/acts/tri_angle~restaurant-review-aggregator/runs";
// for posts https://api.apify.com/v2/acts/tri_angle~restaurant-review-aggregator/runs?token=<YOUR_API_TOKEN>
// for get  https://api.apify.com/v2/acts/tri_angle~restaurant-review-aggregator?token=<YOUR_API_TOKEN>

const input = {
    "maxPlaces": 2
};

export async function getRRAReviews (route, id, requestBody) {
    try {
            const run = await client.actor(apiURI).call(input);

            // Fetch and print Actor results from the run's dataset (if any)
            console.log('Results from dataset');
            console.log(`💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            items.forEach((item) => {
                console.dir(item);
            });
    } 
    catch (error) {
        console.log("HAS SERVER ERROR");
        console.error("Error in serverless putChronosAPI:", error);
        code = 400;
        jsonBody = { error: error.message || "An unexpected error occurred." };
    }
    finally {
        return {
            statusCode: code, 
            headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "PUT, GET, POST",
            "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonBody),
        };
    }
}



