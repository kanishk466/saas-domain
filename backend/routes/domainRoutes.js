const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
    createDomain,
    getMyDomains,
    assignDomain,
    getAllDomains,
    updateDomain,
    deleteDomain
} = require("../controllers/domainController");

router.post("/", auth, createDomain);

router.get("/", auth, role("admin"), getAllDomains);

router.get("/my", auth, getMyDomains);

router.put('/:id', auth, updateDomain);
router.delete('/:id', auth, deleteDomain);

router.put("/assign/:id", auth, role("admin"), assignDomain);

module.exports = router;