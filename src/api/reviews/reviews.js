import express from "express"
import createHttpError from "http-errors"
import ReviewsModel from "./model.js"
import ProductsModel from "../products/model.js"
import q2m from "query-to-mongo"

const reviewsRouter = express.Router()

//POST a review
reviewsRouter.post("/:productID/reviews", async (req, res, next) => {
    try {
        const newReview = { ...req.body, createdAt: new Date(), updatedAt: new Date() }
        const updatedProduct = await ProductsModel.findByIdAndUpdate(
            req.params.productID,
            { $push: { reviews: newReview } },
            { new: true, runValidators: true })
        if (updatedProduct) {
            res.send(updatedProduct)
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//GET all the comments from a product
reviewsRouter.get("/:productID/reviews", async (req, res, next) => {
    try {
        const product = await ProductsModel.findById(req.params.productID)
        if (product) {
            res.send(product.comments)
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//GET a single comment from a product
reviewsRouter.get("/:productID/reviews/:reviewID", async (req, res, next) => {
    try {
        const product = await ProductsModel.findById(req.params.productID)
        if (product) {
            const review = product.reviews.find(review => review._id.toString() === req.params.reviewID)
            if (review) {
                res.send(review)
            } else {
                next(createHttpError(404, `Review with ID ${req.params.reviewID} not found!`))
            }
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//PUT a comment from a product
reviewsRouter.put("/:productID/reviews/:reviewID", async (req, res, next) => {
    try {
        const product = await ProductsModel.findById(req.params.productID)
        if (product) {
            const index = product.reviews.findIndex(review => review._id.toString() === req.params.reviewID)
            if (index !== -1) {
                product.reviews[index] = { ...product.reviews[index].toObject(), ...req.body }
                await product.save()
                res.send(product)
            } else {
                next(createHttpError(404, `Review with ID ${req.params.reviewID} not found!`))
            }
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//DELETE a comment from a product
reviewsRouter.delete("/:productID/reviews/:reviewID", async (req, res, next) => {
    try {
        const updatedProduct = await ProductsModel.findByIdAndUpdate(
            req.params.productID,
            { $pull: { reviews: { _id: req.params.reviewID } } },
            { new: true, runValidators: true }
        )
        if (updatedProduct) {
            res.send(updatedProduct)
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

export default reviewsRouter