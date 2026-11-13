import express from "express";
import { ChatOpenRouter } from "@langchain/openrouter"
import ProductModel from "../model/model.product.js";
const order = express.Router();


order.post("/click", async (req, res) => {
    try {
        const { ask } = req.body;

        const link = "http://localhost:8000/api/order/getallp"
        const model = new ChatOpenRouter({
            model: "nvidia/nemotron-3-ultra-550b-a55b:free",
            temperature: 0.7,
            apiKey: process.env.Openkey
        })
        const res = await model.invoke([
            [
                "system",
                `You are a friendly order collection assistant.

                Your task is to reply politely to the client.

                Rules:
                - Start with a friendly greeting.
                - Include the provided order link.
                - Keep the message short and professional.
                - Never invent or modify the order link.
                - If no link is provided, ask the user to share it.`
            ],
            [
                "human",
                `Additional instructions: ${ask || "Share the order link with the client."}
                Order link: ${link || "Not provided"}`
            ]
        ]);
        console.log(res.content);
    } catch (error) {
        console.log("the error is ", error);
    }
})

order.post("/product", async (req, res) => {
    try {
        const { order } = req.body;
        if (!order) {
            return res.status(400).json({ "message": "no order found" });
        }
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: "products" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });
        const orderdata = new ProductModel({
            ProductName: order.ProductName,
            Productimg: order.Productimg,
            Cost: order.Cost,
        })
        await orderdata.save();
        return res.status(200).json({ "message": "order is saved" });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ "message": "Internal server error" });
    }
})


order.get("/getallp", async (req, res) => {
    try {
        const data = await ProductModel.find();

        if (data.length === 0) {
            return res.status(404).json({
                message: "No products found"
            });
        }

        return res.status(200).json({
            message: "Products fetched successfully",
            products: data
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Error getting the data",
            error: error.message
        });
    }
});


order.post("/byorder", async (req, res) => {
    try {
        const { orderId, userId } = req.body;

        // Check required fields
        if (!orderId || !userId) {
            return res.status(400).json({
                message: "orderId and userId are required"
            });
        }

        // Find and update order
        const findorder = await ProductModel.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    orderperson: userId
                }
            },
            { new: true }
        );

        // Check if order exists
        if (!findorder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({
            message: "Ordered successfully",
            order: findorder
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


order.post("/orderstatus/:orderId", async (req, res) => {
    try {
        const { status } = req.body;
        const { orderId } = req.params;

        if (!status) {
            return res.status(400).json({
                message: "Order status is required"
            });
        }

        const updatedOrder = await ProductModel.findByIdAndUpdate(
            orderId,
            {
                $set: { orderstatus: status }
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // AI agent generates customer message
        const aiResponse = await model.invoke([
            [
                "system",
                `You are a professional and friendly order update assistant.

                Generate a short, polite message for the customer based on the order status.

                Rules:
                - Start with a friendly greeting.
                - If status is Delivered, congratulate the customer and confirm successful delivery.
                - If status is Shipped, tell the customer their order is on the way.
                - If status is Pending, inform the customer that the order is being processed.
                - If status is Cancelled, politely inform the customer.
                - Never invent delivery dates or other order details.
                - Keep the message short and professional.
                - Return only the customer message.`
            ],
            [
                "human",
                `Current order status: ${status}`
            ]
        ]);

        return res.status(200).json({
            message: "Order status updated successfully",
            status: updatedOrder.orderstatus,
            customerMessage: aiResponse.content
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


export default order;
