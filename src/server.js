import Express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import mongoose from "mongoose"
import { badRequestHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js"
import productsRouter from "./api/products/products.js"
import usersRouter from "./api/users/users.js"
import reviewsRouter from "./api/reviews/reviews.js"

const server = Express()
const port = process.env.PORT

//Middlewares

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]
server.use(cors(
    {
        origin: (currentOrigin, corsNext) => {
            if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
                corsNext(null, true)
            } else {
                corsNext(createHttpError(400, `Origin ${currentOrigin} is not in the whitelist!`))
            }
        }
    }
))
server.use(Express.json())

//Endpoints

server.use("/products", productsRouter)
server.use("/products", reviewsRouter)
server.use("/users", usersRouter)

//Error Handlers
server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

mongoose.connect(process.env.MONGO_URL)

mongoose.connection.on("connected", () => {
    console.log("Connection established to Mongo!")
    server.listen(port, () => {
        console.table(listEndpoints(server))
        console.log(`Server is running on port ${port}`)
    })
})