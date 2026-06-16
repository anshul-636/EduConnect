const schoolService = require('../services/school.service');
const { validationResult } = require('express-validator');

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  try {
    const school = await schoolService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: school });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const getAll = async (req, res) => {
  try {
    const schools = await schoolService.getAll();
    res.json({ success: true, data: schools });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getById = async (req, res) => {
  try {
    const school = await schoolService.getById(req.params.id);
    res.json({ success: true, data: school });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  try {
    const school = await schoolService.update(req.params.id, req.body, req.user.id);
    res.json({ success: true, data: school });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const getMySchool = async (req, res) => {
  try {
    const school = await schoolService.getMySchool(req.user.id);
    res.json({ success: true, data: school });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const remove = async (req, res) => {
  try {
    const school = await schoolService.delete(req.params.id, req.user.id);
    res.json({ success: true, data: school });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const adminCreate = async (req, res) => {
  try {
    const { name, location, affiliation, adminName, adminEmail, adminPassword } = req.body;
    const prisma = require('../utils/prisma');
    
    // 1. Create a new user with role SCHOOL
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminUser = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'SCHOOL',
        isActive: true,
        isVerified: true, // Admin-provisioned accounts skip email verification
      }
    });

    // 2. Create the school profile
    const school = await prisma.school.create({
      data: {
        name,
        location,
        affiliation,
        adminId: adminUser.id,
      }
    });

    // 3. Link the user to the school
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { schoolId: school.id }
    });

    res.status(201).json({ success: true, data: { school, adminUser } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { create, getAll, getById, update, getMySchool, remove, adminCreate };