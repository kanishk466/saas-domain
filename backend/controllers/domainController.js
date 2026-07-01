const Domain = require("../models/Domain");
const User = require("../models/User");

exports.createDomain = async (req, res) => {
    try {

        const { domainName } = req.body;

        const domain = await Domain.create({
            domainName,
            userId: req.user.id
        });

        res.status(201).json(domain);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


exports.getMyDomains = async (req, res) => {

    try {

        const domains = await Domain.find({
            userId: req.user.id
        });

        res.json(domains);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


exports.assignDomain = async (req, res) => {

    try {

        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const domain = await Domain.findByIdAndUpdate(
            req.params.id,
            {
                userId
            },
            {
                new: true
            }
        );

        res.json(domain);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


exports.getAllDomains = async (req, res) => {

    try {

        const domains = await Domain.find().populate(
            "userId",
            "name email"
        );

        res.json(domains);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.updateDomain = async (req, res) => {
    try {
        const domain = await Domain.findById(req.params.id);

        if (!domain) {
            return res.status(404).json({ message: "Domain not found" });
        }

        if (domain.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only edit your own domains" });
        }

        const updatedDomain = await Domain.findByIdAndUpdate(
            req.params.id,
            { domainName: req.body.domainName },
            { new: true }
        );

        res.json(updatedDomain);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteDomain = async (req, res) => {
    try {
        const domain = await Domain.findById(req.params.id);

        if (!domain) {
            return res.status(404).json({ message: "Domain not found" });
        }

        if (domain.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own domains" });
        }

        await Domain.findByIdAndDelete(req.params.id);
        res.json({ message: "Domain deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};