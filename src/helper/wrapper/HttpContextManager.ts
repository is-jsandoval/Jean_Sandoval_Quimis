class HttpContextManager {

    static async createContext(request: any, accessToken = null, extraHeaders = {}, overrideBaseURL = null) {
        const headers: Record<string, string> = {
            ...extraHeaders
        };

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
            
        return await request.newContext({
            timeout: 60000,
            baseURL: overrideBaseURL || process.env.BASEURL,
            extraHTTPHeaders: headers
        });
    }

}
module.exports = HttpContextManager;


