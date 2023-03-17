import mongoose from "mongoose"

const { Schema, model } = mongoose

const reviewsSchema = new Schema(
    {
        comment: { type: String, required: true },
        rate: { type: Number, required: true, min: [0], max: [5] },
        user: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true
    }
)

export default model("Review", reviewsSchema)