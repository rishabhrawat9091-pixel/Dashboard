import mongoose from "mongoose"


const ProductSchem = new mongoose.Schema({
    ProductName: {
        type: String,
        require: true,
    },
    Cost: {
        type: Number,
        require: true
    },
    orderperson: {
        type: String,
        require: true
    }, orderstatus: {
        default: "Pending",
        type: String,
        require: true
    }

})

const ProductModel = new mongoose.model("Product", ProductSchem);

export default ProductModel;