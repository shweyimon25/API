export const generateAuthToken = () => {
    const smsApiKey = process.env.SMS_API_KEY;
    const smsApiSecret = process.env.SMS_API_SECRET;

    // Encode api auth token
    const credentials = `${smsApiKey}:${smsApiSecret}`;
    return Buffer.from(credentials).toString('base64');
}

export const sendSms = async (phone: string, message: string) => {
    const authToken = generateAuthToken();
    const url = process.env.SMS_BASE_URL as string;

    const headers = {
        'Authorization': `Bearer ${authToken}`
    }

    const body = {
        "to": phone,
        "message": message,
        "from": process.env.SMS_FROM,
        "clientReference": Math.random().toString(36).substring(2, 15)
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    })

    const data = await response.json();
    console.log(data);
}