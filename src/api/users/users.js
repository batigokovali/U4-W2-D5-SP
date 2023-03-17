import express from "express"
import createHttpError from "http-errors"
import UsersModel from "./model.js"
import q2m from "query-to-mongo"

const usersRouter = express.Router()

usersRouter.post("/", async (req, res, next) => {
    try {
        const newUser = new UsersModel(req.body)
        const { _id } = await newUser.save()
        res.status(201).send({ _id })
    } catch (error) {
        next(error)
    }
})

usersRouter.get("/", async (req, res, next) => {
    try {
        console.log("req.query:", req.query)
        console.log("q2m:", q2m(req.query))
        const mongoQuery = q2m(req.query)
        const users = await UsersModel.find(mongoQuery.criteria, mongoQuery.options.fields)
            .limit(mongoQuery.options.limit)
            .skip(mongoQuery.options.skip)
            .sort(mongoQuery.options.sort)
        const total = await UsersModel.countDocuments(mongoQuery.criteria)
        console.log(req.url)
        res.send({
            links: mongoQuery.links("http://localhost:3001/users", total),
            total,
            numberOfPages: Math.ceil(total / mongoQuery.options.limit),
            users
        })
    } catch (error) {
        next(error)
    }
})

usersRouter.get("/:userID", async (req, res, next) => {
    try {
        const user = await UsersModel.findById(req.params.userID)
        if (user) {
            res.send(user)
        } else {
            next(createHttpError(404, `User with id ${req.params.userID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

usersRouter.put("/:userID", async (req, res, next) => {
    try {
        const updatedUser = await UsersModel.findByIdAndUpdate(
            req.params.userID,
            req.body,
            { new: true, runValidators: true }
        )
        if (updatedUser) {
            res.send(updatedUser)
        } else {
            next(createHttpError(404, `user with id ${req.params.userID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

usersRouter.delete("/:userID", async (req, res, next) => {
    try {
        const deletedUser = await UsersModel.findByIdAndDelete(req.params.userID)
        if (deletedUser) {
            res.status(204).semd()
        } else {
            next(createHttpError(404, `User with id ${req.params.userID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

export default usersRouter