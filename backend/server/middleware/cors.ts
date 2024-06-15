import {isMethod, setResponseStatus} from "h3";

export default defineEventHandler((event) => {
    setResponseHeaders(event, {
        "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Credentials': 'true',
        "Access-Control-Allow-Headers": '*',
        "Access-Control-Expose-Headers": '*'
    })
    if(isMethod(event, 'OPTIONS')) {
        setResponseStatus(event, 204, 'No Content')
        return 'OK'
    }
})
