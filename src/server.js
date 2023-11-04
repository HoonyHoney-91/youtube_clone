import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";

import globalRouter from "./routers/rootRouter"
import userRouter from "./routers/userRouters";
import videoRouter from "./routers/videoRouters";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev");
app.set("view engine", "pug");
app.set("views", process.cwd()+"/src/views")
app.set("x-powered-by", "false")
app.use(logger);
app.use(express.urlencoded({ extended:true }));
app.use(express.json());
app.use(
    session({
      secret: process.env.COOKIE_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({mongoUrl: process.env.DB_URL})
    })
  );
// middleware
app.use(flash());
app.use(localsMiddleware);

// static files
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));

app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);
// app.use is to make global middleware

export default app