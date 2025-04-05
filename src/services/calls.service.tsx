import { get, put } from "./api.service"

const getCallsInProgress = () => {
    return get('calls/v2/in-progress')
}

const getCallsHangup = (page = null) => {
    if(Number.isInteger(page)){
        return get(`calls/v2/hangup?page=${page}`)
    }
    return get(`calls/v2/hangup`)
}

const getCallsMissed = (page = null) => {
    if(Number.isInteger(page)){
        return get(`calls/v2/missed?page=${page}`)
    }
    return get(`calls/v2/missed`)
}

const getLastSalesAndProducts = (clientId: any) => {
    return get(`calls/v2/orders/${clientId}`)
}

const terminateCall = ({ callId }: any) => {
    return put(`calls/v2/closeGhostCall/${callId}`)
}

export {
    getCallsInProgress,
    getCallsHangup,
    getCallsMissed,
    getLastSalesAndProducts,
    terminateCall
}
