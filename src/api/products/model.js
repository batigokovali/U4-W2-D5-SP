import mongoose from "mongoose"

const { Schema, model } = mongoose

const productsSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        brand: { type: String, required: true },
        imageURL: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        reviews: [{
            user: { type: Schema.Types.ObjectId, ref: "User" },
            comment: { type: String, required: true },
            rate: { type: String, required: true },
            createdAt: { type: Date, required: true },
            updatedAt: { type: Date, required: true }
        }]
    },
    {
        timestamps: true
    }
)

productsSchema.static("findProductsWithReviews", async function (query) {
    console.log("THIS:", this)
    const products = await this.find(query.criteria, query.options.fields)
        .limit(query.options.limit)
        .skip(query.options.skip)
        .sort(query.options.sort)
        .populate({ path: "reviews.user", select: "firstName lastName" })
    const total = await this.countDocuments(query.criteria)
    return { products, total }
})

productsSchema.static("findProductWithReviews", async function (id) {
    const product = await this.findById(id).populate({
        path: "reviews", select: "comment rate"
    })
    return product
})

export default model("Product", productsSchema)