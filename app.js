import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import morgan from 'morgan';
import errorMiddleware from "./middleware/error.middleware.js";
import userRoutes from "./routes/userRoutes.js";
import subscriptionRoutes from "./routes/subscription.routes.js"
import 'dotenv/config'

const app= express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin:'https://vercel-backend-2-six.vercel.app/', // frontend url accesing
    credentials:true
}));
app.use(morgan('dev'));
app.use(cookieParser());

//Routes
app.use('/user',userRoutes);
app.use('/subscriptions',subscriptionRoutes)
app.use(errorMiddleware);
app.get('/',(req,res)=>{
    res.send("API is working");
})


export default app;
