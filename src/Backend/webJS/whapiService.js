const axios = require('axios');
let authToken ='eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImExZDI2YWYyYmY4MjVmYjI5MzVjNWI3OTY3ZDA3YmYwZTMxZWIxYjcifQ.eyJwYXJ0bmVyIjp0cnVlLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vd2hhcGktYTcyMWYiLCJhdWQiOiJ3aGFwaS1hNzIxZiIsImF1dGhfdGltZSI6MTc0MjM4MzY5MiwidXNlcl9pZCI6IkNSdXZGNkhXeVRQQWxCMnhFSEg3ZUZuMHRoYzIiLCJzdWIiOiJDUnV2RjZIV3lUUEFsQjJ4RUhIN2VGbjB0aGMyIiwiaWF0IjoxNzQyMzgzNjkyLCJleHAiOjE4MDI4NjM2OTIsImVtYWlsIjoibXBzLmcwOUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJtcHMuZzA5QGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.D8J-7fMMxnFoIzdG5yM0XddlWR1MGDyJ6FwGPuPxZ2yAor4ze2m1kEFdsegUwCnfqxkdU99ryEN-3M6_MJW1vLb9gLsWOOnZb6QMfMAbQrynKPlorMOlwWVpBeIG0mQFJBi2idLYEuwmhffhWlzJDMJErcgBisQKATf6mvCyZjfR62l3sOcMMKcnXG4hdVURGtIhpv-0r2EiyUzZRWFfT090lFofO4AXt1TbgBqtQElawvPGC0tLPE1dcFUXO4Bhp7i2KcPZCE87_cDe-Mg3JlP29rRHJw3EB2_m6bJIV1KbHIUaMj2mysQ3c-pe66DXiDLMqXo6XIXdtIxSF49AwA'
const variables = require('../common/constant');
const { channel } = require('diagnostics_channel');

class whapiService {

    static async getProjectId() {
        try {
           // let authToken //todo need to make this dynamic
            const response = await axios.get('https://manager.whapi.cloud/projects', {
                headers: {
                    'accept': 'application/json',
                    'authorization': `Bearer ${authToken}`
                }
            });

            const projects = response.data?.projects;
            if (Array.isArray(projects) && projects.length > 0) {
                return projects[0].id; // Returning the first project's ID
            } else {
                console.warn("No projects found.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching project ID:", error.response?.data || error.message);
            throw new Error("Failed to retrieve project ID.");
        }
    }

    static async createChannel(name, projectId) {
        try {
            //let authToken //todo need to make this dynamic
            const response = await axios.put(
                'https://manager.whapi.cloud/channels',
                {
                    name,
                    projectId
                },
                {
                    headers: {
                        'accept': 'application/json',
                        'authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error updating channel:", error.response?.data || error.message);
            return { error: error.response?.data || "API request failed" };
        }
    }

    static async extendChannel(channelID, validity) {
        try {
          const response = await axios.post(
            `https://manager.whapi.cloud/channels/${channelID}/extend`,
            {
              days: validity?.days,
              comment: validity?.comment
            //   amount: validity?.amount,
            //   currency: validity?.currency,
            },
            {
              headers: {
                "accept": "application/json",
                "authorization": `Bearer ${authToken}`,
                "content-type": "application/json",
              },
            }
          );
    
          return response.data;
        } catch (error) {
          console.error("Error extending channel:", error.message);
          throw error;
        }
      }

    static async setupWebhook(token) {
        try {
            token = "I3yX5PYIVRJsLsdMlojaN4VxufeGJb5N" //todo need to check why only I am able to test for this id
            const response = await fetch("https://gate.whapi.cloud/settings", {
                method: "PATCH",
                headers: {
                    "accept": "application/json",
                    "authorization": `Bearer ${token}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    webhooks: [
                        {
                            events: [
                                { type: "users", method: "post" },
                                { type: "channel", method: "post" }
                            ],
                            mode: "body",
                            url: "https://call.stacknize.com/webhook" // static webhook that should be registered.
                        }
                    ],
                    callback_persist: true
                })
            });
    
            const responseText = await response.text();
            console.log("Response Status:", response.status);
            console.log("Response Body:", responseText);
    
            if (!response.ok) {
                console.error("Webhook setup failed.");
                return false;
            }
    
            console.log("Webhook setup successful.");
            return true;
        } catch (error) {
            console.error("Error setting up webhook:", error.message);
            return false;
        }
    }

    // static async getLoginQRCode(token) {
    //     try {
    //         token = "I3yX5PYIVRJsLsdMlojaN4VxufeGJb5N";
    //         const response = await axios.get("https://gate.whapi.cloud/users/login/rowdata?wakeup=true", {
    //             headers: {
    //                 "accept": "application/json",
    //                 "authorization": `Bearer ${token}`,
    //                 "content-type": "application/json"
    //             },
    //         });
    
    //         if (response.data.status === 'OK') {
    //             return {
    //                 value: response?.data?.rowdata,
    //                 rowdata: response?.data?.rowdata,
    //                 expire: response?.data?.expire,
    //                 channelToken: token,
    //             };
    //         } else {
    //             throw new Error('Failed to retrieve QR code');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching QR code:', error.message);
    //         throw error;
    //     }
    // }
    static async getLoginQRCode(token) {
        const MAX_RETRIES = 3;
        const BACKOFF_MS = 3000;
        const LOGIN_URL = "https://gate.whapi.cloud/users/login/rowdata?wakeup=true";
    
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await axios.get(LOGIN_URL, {
                    headers: {
                        accept: "application/json",
                        authorization: `Bearer ${token}`,
                        "content-type": "application/json",
                    },
                });
    
                if (response.data?.status === 'OK') {
                    return {
                        value: response.data.rowdata,
                        rowdata: response.data.rowdata,
                        expire: response.data.expire,
                        channelToken: token,
                    };
                }
    
                throw new Error(`Unexpected status: ${response.data?.status || 'unknown'}`);
            } catch (error) {
                console.error(`Attempt ${attempt} failed: ${error.message}`);
    
                if (attempt === MAX_RETRIES) {
                    console.error('All retry attempts exhausted. Aborting.');
                    throw error;
                }
    
                console.log(`Retrying in ${BACKOFF_MS / 1000} seconds...`);
                await delay(BACKOFF_MS);
            }
        }
    }

    static async startChannel(token, channelId) {
        try {
            const response = await axios.post(`https://manager.whapi.cloud/channels/${channelId}/start`, null, {
                headers: {
                    "accept": "application/json",
                    "authorization": `Bearer ${token}`
                }
            });
    
            console.log("Response Status:", response.status);
            console.log("Response Body:", response.data);
    
            if (response.status !== 200) {
                console.error("Failed to start the channel.");
                return false;
            }
    
            console.log("Channel started successfully.");
            return true;
        } catch (error) {
            console.error("Error starting channel:", error.response?.data || error.message);
            return false;
        }
    }

    static async SendMessage(apiUrl, token, dataToSend){
        const response = await axios.post(apiUrl, dataToSend, {
            headers: {
                'accept': 'application/json',
                'authorization': `Bearer ${token}`,   
                'content-type': 'application/json'
            }
        });
        return response.data; // Return response data
    }

    static async getSessionStatus(token) {
        try {
            const response = await axios.get('https://api.whapi.cloud/session/status', {
                headers: { "authorization": `Bearer ${token}` }
            });
    
            if (response.data.status !== 'connected') {
                console.log('WhatsApp is not ready yet.');
                return;
            }
            
            return response.data;
        } catch (error) {
            console.error("Error fetching session status:", error.message);
            return false;
        }
    }

    static async getChats(token) {
        try {
            const response = await axios.get('https://gate.whapi.cloud/chats?count=500', {
                headers: {
                    "accept": "application/json",
                    "authorization": `Bearer ${token}`
                },
                timeout: 5000 // Set timeout to prevent long waits
            });
    
            if (response.status === 200) {
                return response.data; // Return full response data
            } else {
                console.error("Unexpected response:", response.status, response.data);
                return false;
            }
        } catch (error) {
            console.error("Error fetching chats:", error.message);
    
            // Retry mechanism for temporary network failures
            if (error.code === 'ENOTFOUND' || error.code === 'ECONNABORTED') {
                console.log("Retrying after 5 seconds...");
                await new Promise(res => setTimeout(res, 5000));
                return this.getChats(token);
            }
    
            return false;
        }
    }

    static async getChat(token, chatId) {
        try {
            const response = await axios.get(`https://api.whapi.cloud/messages/chat/${chatId}?limit=30`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            return response.data;  // Axios automatically parses JSON
        } catch (error) {
            console.error("Error fetching chat:", error.response?.data || error.message);
            return false;
        }
    }
    static async getChatMessagesByChatId(token, chatId, count = 30, offset = 0) {
        try {
            const response = await axios.get(`https://gate.whapi.cloud/messages/list/${chatId}`, {
                params: {
                    count,
                    offset
                    // You can also include time_from, time_to, from_me, normal_types etc. if needed
                },
                headers: {
                    accept: 'application/json',
                    authorization: `Bearer ${token}`
                }
            });
    
            return response.data;
        } catch (error) {
            console.error("Error fetching chat messages:", error.response?.data || error.message);
            return false;
        }
    }
    
}

module.exports = { whapiService };