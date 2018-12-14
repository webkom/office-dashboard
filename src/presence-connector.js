import { connect } from 'react-refetch'

export const presenceConnector = connect.defaults({
    handleResponse: function (response) {
        console.log("RESPONSE!")
        console.log(response)
        /*if (response.status === 204) {
            return
        }*/
        return response.text()
    }
})
