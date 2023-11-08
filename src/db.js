import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true, // Enabling TLS
    tlsAllowInvalidHostnames: false, // Set to true if you're using a self-signed certificate
    tlsAllowInvalidCertificates: false,
});

const db= mongoose.connection;

const handleOpen = ()=> console.log("✅connected to DB");
const handleError = (error)=> console.log("❌DB error:", error);

db.on("error", handleError);
db.once("open", handleOpen)
