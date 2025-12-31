// apps/api/scripts/import-employee-list.js
// Usage: node import-employee-list.js /full/path/to/employees.xlsx
// or from apps/api: node scripts/import-employee-list.js ../../data/employees.xlsx

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const xlsx = require('xlsx');

require('dotenv').config({ path: path.join(__dirname, '../.env') }); // adjust if your .env location differs

const connectDB = require('../config/db');
const EmployeeList = require('../models/EmployeeList');

async function run() {
  const argv = process.argv.slice(2);
  if (!argv[0]) {
    console.error('Usage: node import-employee-list.js /path/to/file.xlsx');
    process.exit(1);
  }
  const filePath = path.resolve(argv[0]);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  console.log('Connecting to DB...');
  await connectDB();

  console.log('Reading workbook:', filePath);
  const wb = xlsx.readFile(filePath, { cellDates: true });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  // read sheet as arrays (rows as arrays)
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });

  // rows[0] is the header row (A1...). Data starts at A2 per your description.
  console.log(`Total rows in sheet: ${rows.length} (including header)`);

  // Build list of employeeIds from column A starting at row index 1
  const employeeIds = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // column A is row[0]
    const raw = (row && row[0]) ?? '';
    const id = String(raw).trim();
    if (!id) continue;
    employeeIds.push({ employeeId: id, rowIndex: i + 1 }); // store rowIndex for debugging
  }

  console.log('Employee IDs to import:', employeeIds.length);

  if (employeeIds.length === 0) {
    console.log('No IDs found. Exiting.');
    await mongoose.disconnect();
    return;
  }

  // Bulk upsert in batches
  const BATCH = 1000; // safe batch size for 11k rows
  let processed = 0;
  for (let i = 0; i < employeeIds.length; i += BATCH) {
    const chunk = employeeIds.slice(i, i + BATCH);
    const ops = chunk.map((it) => ({
      updateOne: {
        filter: { employeeId: it.employeeId },
        update: {
          $set: {
            employeeId: it.employeeId,
            // meta: { importedRow: it.rowIndex } // optional meta
          },
        },
        upsert: true,
      },
    }));

    try {
      const result = await EmployeeList.bulkWrite(ops, { ordered: false });
      processed += chunk.length;
      console.log(
        `Batch ${Math.floor(i / BATCH) + 1}: upserted=${result.upsertedCount}, modified=${result.modifiedCount}, matched=${result.matchedCount}. Processed ${processed}/${employeeIds.length}`
      );
    } catch (err) {
      // bulkWrite may throw on unexpected errors; log and continue
      console.error('Bulk write error on batch', Math.floor(i / BATCH) + 1, err);
      // optional: inspect individual ids of the failed chunk
    }
  }

  console.log('Done. Total processed:', processed);

  // final count in DB (optional)
  try {
    const total = await EmployeeList.countDocuments();
    console.log('Total EmployeeList documents in DB:', total);
  } catch (err) {
    console.warn('Error fetching final count:', err.message || err);
  }

  await mongoose.disconnect();
  console.log('Disconnected. Import finished.');
}

run().catch((err) => {
  console.error('Import script failed:', err);
  process.exit(1);
});
