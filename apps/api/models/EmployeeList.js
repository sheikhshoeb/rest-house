// api/models/EmployeeList.js
const mongoose = require('mongoose');

const EmployeeListSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, trim: true },
  meta: { type: Object } // optional extra info from Excel
});

module.exports = mongoose.model('EmployeeList', EmployeeListSchema);
