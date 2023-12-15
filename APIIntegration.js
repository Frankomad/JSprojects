const functions = require("firebase-functions");
const axios = require('axios');

const apiHostname = "https://api-b2b.gerosense.ai";

exports.authenticateGeroSense = functions
    .region("europe-west1")
    .runWith({ timeoutSeconds: 180 })
    .https.onCall(async (data, context) => {
        try {
            const payload = {
                username: "user",
                password: "pass"
            }

            const tokenResponse = await axios.post(`${apiHostname}/api/v1.0/login/access-token`, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const accessToken = tokenResponse.data.access_token;

            console.log('Access Token:', accessToken);

            return { success: true, accessToken };
        } catch (error) {
            console.error('Authentication failed:', error.message);
            return { success: false, message: 'Authentication failed' };
        }
    });


exports.authenticateGeroSense = functions
    .region("europe-west1")
    .runWith({ timeoutSeconds: 180 })
    .https.onCall(async (data) => {
        try {
            const userData = {
                id: data.id,
                biological_sex: data.biological_sex,
                year_of_birth: data.year_of_birth,
            };

            //determine how to store access token
            const registerUserResponse = await axios.post(`${apiHostname}/api/v2.2/user`, userData, {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${data.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('User Registration Response:', registerUserResponse.data);

            return { success: true, message: 'User registration successful' };
        } catch (error) {
            console.error('User registration failed:', error.message);
            return { success: false, message: 'User registration failed' };
        }
    });

exports.sentSamplesGero = functions
    .region("europe-west1")
    .runWith({ timeoutSeconds: 180 })
    .https.onCall(async (data) => {
        try {
            const maxBatchSize = 1000;
            const batches = [];

            for (let i = 0; i < data.samples.length; i += maxBatchSize) {
                const batch = data.samples.slice(i, i + maxBatchSize);
                batches.push(batch);
            }

            for (const batch of batches) {
                const payload = {
                    user_id: data.id,
                    data_type: data.modelType,
                    data: batch
                };

                await axios.post(`${apiHostname}/api/v2.2/samples`, payload, {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`Batch sent successfully: ${batch.length} samples`);
            }
            console.log('All batches sent successfully');
        } catch (error) {
            console.error('Error sending samples:', error.message);
        }
    });

exports.triggerBiologicalAgeCalculation = functions
    .region("europe-west1")
    .runWith({ timeoutSeconds: 180 })
    .https.onCall(async (data) => {
        try {
            const bioAgePayload = {
                user_id: data.id,
                model_type: data.modelType,
            };

            await axios.post(`${apiHostname}/api/v2.2/bioage/calculate`, bioAgePayload, {
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Biological age acceleration calculations triggered successfully');
        } catch (error) {
            console.error('Error triggering biological age acceleration calculations:', error.message);
        }
    });

exports.getUserResiliance = functions
    .region("europe-west1")
    .runWith({ timeoutSeconds: 180 })
    .https.onCall(async (data) => {
        try {
            const payload =  {
                user_id: data.id,
                model_type: data.modelType,
                device_name: data.deviceName,
            }

            const response = await axios.get(`${apiHostname}/api/v2.2/resilience`, payload, {
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const resilience = response.data.resilience;
            console.log(`User's Resilience: ${resilience}`);
            return resilience;
        } catch (error) {
            console.error('Error fetching user resilience:', error.message);
        }
    });

exports.biologicalAgeCalculationWebhook = functions
    .runWith({ memory: "512MB", timeoutSeconds: 540 })
    .region("europe-west1")
    .https.onRequest(biologicalAgeCalculationHook);

async function biologicalAgeCalculationHook(req, resp) {
    try {
        let data = req.body;
        console.log(`Data received ${JSON.stringify(data)}`);
        resp.sendStatus(200);
    } catch (error) {
        console.error(error);
        resp.sendStatus(500);
    }
}


