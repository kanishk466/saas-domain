const User = require('../models/User');


const Domain = require("../models/Domain");

exports.getAllUsers = async (req, res) => {

    try {

        const users = await User.find().select("-password");

        const result = await Promise.all(

            users.map(async (user) => {

                const domains = await Domain.find({
                    userId: user._id
                });

                return {
                    ...user.toObject(),
                    domains
                };

            })

        );

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.updateUser = async (req, res) => {
    try {
        const allowedUpdates = {};

        if (req.body.name) allowedUpdates.name = req.body.name;
        if (req.body.email) allowedUpdates.email = req.body.email;
        if (req.body.role) allowedUpdates.role = req.body.role;

        const user = await User.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }       
};  

