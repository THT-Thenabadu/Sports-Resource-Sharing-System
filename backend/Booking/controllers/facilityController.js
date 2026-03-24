const Facility = require('../models/Facility');

// GET /api/facilities — list all facilities (with optional filters)
const getAllFacilities = async (req, res) => {
    try {
        const filter = {};

        // Optional query filters: ?type=pool&institution=Royal%20College&status=available
        if (req.query.type) filter.type = req.query.type;
        if (req.query.institution) filter.institution = req.query.institution;
        if (req.query.status) filter.status = req.query.status;

        const facilities = await Facility.find(filter).sort({ institution: 1, name: 1 });
        res.json(facilities);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/facilities/:id — get a single facility
const getFacilityById = async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }
        res.json(facility);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/facilities — create a new facility (used by admin / Asset Registry)
const createFacility = async (req, res) => {
    try {
        const facility = new Facility(req.body);
        const saved = await facility.save();
        res.status(201).json(saved);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Facility with this name already exists at this institution' });
        }
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
};

// PUT /api/facilities/:id — update facility details
const updateFacility = async (req, res) => {
    try {
        const facility = await Facility.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }
        res.json(facility);
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
};

// DELETE /api/facilities/:id — remove a facility
const deleteFacility = async (req, res) => {
    try {
        const facility = await Facility.findByIdAndDelete(req.params.id);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }
        res.json({ message: 'Facility deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility
};

