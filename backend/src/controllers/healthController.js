import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/*
const healthCheck = (req, res) => {
    try {
        res.status(200).json(new apiResponse(200, { message: "Server is running" }));
    } catch (error) {
        res.status(500).json(new apiResponse(500, { message: "Internal Server Error" }));
    }
}
*/

const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(new apiResponse(200, { message: "Server is running" }));
});

export { healthCheck };