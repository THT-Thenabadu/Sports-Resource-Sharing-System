const express = require('express');
const router = express.Router();
const {
    getAllFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility
} = require('../controllers/facilityController');

// GET    /api/facilities          — List all facilities
// GET    /api/facilities/:id      — Get single facility
// POST   /api/facilities          — Create facility
// PUT    /api/facilities/:id      — Update facility
// DELETE /api/facilities/:id      — Delete facility

router.get('/', getAllFacilities);
router.get('/:id', getFacilityById);
router.post('/', createFacility);
router.put('/:id', updateFacility);
router.delete('/:id', deleteFacility);

module.exports = router;

