import axios from "axios";

const API_BASE_URL = "http://localhost:9090/api/indicators";

const indicatorService = {

    fetchHistoricalData: async () => {
        const response = await axios.post(
            `${API_BASE_URL}/fetch-historical`
        );
        return response.data;
    },

    recalculateIndicators: async () => {
        const response = await axios.post(
            `${API_BASE_URL}/recalculate`
        );
        return response.data;
    }

};

export default indicatorService;