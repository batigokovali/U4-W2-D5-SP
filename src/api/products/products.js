import express from "express"
import createHttpError from "http-errors"
import ProductsModel from "./model.js"
import q2m from "query-to-mongo"

const productsRouter = express.Router()

//POST a product
productsRouter.post("/", async (req, res, next) => {
    try {
        const newProduct = new ProductsModel(req.body)
        const { _id } = await newProduct.save()
        res.status(201).send({ _id })
    } catch (error) {
        next(error)
    }
})

//GET all products
productsRouter.get("/", async (req, res, next) => {
    try {
        const mongoQuery = q2m(req.query)
        const { products, total } = await ProductsModel.findProductsWithReviews(mongoQuery)
        res.send({
            links: mongoQuery.links("http://localhost:3001/products", total),
            total,
            numberOfPages: Math.ceil(total / mongoQuery.options.limit),
            products
        })
    } catch (error) {
        next(error)
    }
})

//GET a single product
productsRouter.get("/:productID", async (req, res, next) => {
    try {
        const mongoQuery = q2m(req.query)
        const product = await ProductsModel.findProductWithReviews(req.params.productID)
        if (product) {
            res.send(product)
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//PUT a product
productsRouter.put("/:productID", async (req, res, next) => {
    try {
        const updatedProduct = await ProductsModel.findByIdAndUpdate(
            req.params.productID,
            req.body,
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

//DELETE a product
productsRouter.delete("/:productID", async (req, res, next) => {
    try {
        const deletedProduct = await ProductsModel.findByIdAndDelete(req.params.productID)
        if (deletedProduct) {
            res.status(204).send()
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//POST a review for a product, with user ID

export default productsRouter