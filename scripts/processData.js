import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Coordinates mapping for Tamil Nadu districts (approximate centroid lat/lng)
const DISTRICT_COORDINATES = {
  "Ariyalur": { lat: 11.1401, lng: 79.0786 },
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  "Cuddalore": { lat: 11.7480, lng: 79.7714 },
  "Dharmapuri": { lat: 12.1211, lng: 78.1582 },
  "Dindigul": { lat: 10.3673, lng: 77.9803 },
  "Erode": { lat: 11.3410, lng: 77.7172 },
  "Kancheepuram": { lat: 12.8342, lng: 79.7036 },
  "Kanyakumari": { lat: 8.0883, lng: 77.5385 },
  "Karur": { lat: 10.9601, lng: 78.0766 },
  "Krishnagiri": { lat: 12.5186, lng: 78.2137 },
  "Madurai": { lat: 9.9252, lng: 78.1198 },
  "Nagapattinam": { lat: 10.7656, lng: 79.8424 },
  "Namakkal": { lat: 11.2189, lng: 78.1674 },
  "Perambalur": { lat: 11.2333, lng: 78.8833 },
  "Pudukkottai": { lat: 10.3797, lng: 78.8202 },
  "Ramanadhapuram": { lat: 9.3639, lng: 78.8395 },
  "Salem": { lat: 11.6643, lng: 78.1460 },
  "Sivagangai": { lat: 9.8433, lng: 78.4809 },
  "Thanjavur": { lat: 10.7870, lng: 79.1378 },
  "Theni": { lat: 10.0104, lng: 77.4768 },
  "The Nilgiris": { lat: 11.4916, lng: 76.7337 },
  "Tiruvallur": { lat: 13.1432, lng: 79.9044 },
  "Tiruvannamalai": { lat: 12.2253, lng: 79.0747 },
  "Thiruvarur": { lat: 10.7725, lng: 79.6365 },
  "Thoothukudi": { lat: 8.7642, lng: 78.1348 },
  "Tirupur": { lat: 11.1085, lng: 77.3411 },
  "Trichy": { lat: 10.7905, lng: 78.7047 },
  "Thirunelvei": { lat: 8.7139, lng: 77.7567 },
  "Vellore": { lat: 12.9165, lng: 79.1325 },
  "Villupuram": { lat: 11.9401, lng: 79.4861 },
  "Virudhunagar": { lat: 9.5680, lng: 77.9624 }
};

function processOverproductionData() {
  // Resolve paths candidate locations
  const possibleCsvPaths = [
    path.resolve(__dirname, '../artifacts/vegetables_abstract_2016_17.csv'),
    path.resolve(__dirname, '../vegetables_abstract_2016_17.csv'),
    path.resolve(process.cwd(), 'artifacts/vegetables_abstract_2016_17.csv'),
    path.resolve(process.cwd(), 'vegetables_abstract_2016_17.csv')
  ];

  let csvPath = possibleCsvPaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    console.error('Error: CSV file vegetables_abstract_2016_17.csv not found in expected locations.');
    process.exit(1);
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Split lines and parse CSV
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) {
    console.error('Error: CSV file appears empty or missing rows.');
    process.exit(1);
  }

  const rawDistricts = [];
  let totalArea = 0;
  let totalProduction = 0;

  // Header line: S.No,State,District,Area (Ha),production (Tonnes),productivity (Tonnes/Ha)
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < 6) continue;

    const sNo = cols[0];
    const state = cols[1];
    const district = cols[2];
    const area = parseFloat(cols[3]);
    const production = parseFloat(cols[4]);
    const productivity = parseFloat(cols[5]);

    // Skip state total or invalid entries
    if (district.toLowerCase().includes('total') || isNaN(productivity)) {
      continue;
    }

    rawDistricts.push({
      sNo: parseInt(sNo, 10) || rawDistricts.length + 1,
      state,
      district,
      areaHa: area,
      productionTonnes: production,
      productivity
    });

    totalArea += area;
    totalProduction += production;
  }

  // Calculate Average Productivity across districts
  // Method 1: Mean of district productivities
  const sumProductivity = rawDistricts.reduce((acc, d) => acc + d.productivity, 0);
  const meanProductivity = sumProductivity / rawDistricts.length;

  // Method 2: Total Production / Total Area
  const weightedAvgProductivity = totalProduction / totalArea;

  // Use meanProductivity (or weightedAvgProductivity - both ~21.44 - 22.25 Tonnes/Ha)
  // Standard overall average productivity reference
  const overallAvgProductivity = Number(weightedAvgProductivity.toFixed(2));
  const overproductionThreshold = Number((overallAvgProductivity * 1.20).toFixed(2));

  console.log(`Total Districts Parsed: ${rawDistricts.length}`);
  console.log(`Overall Average Productivity: ${overallAvgProductivity} Tonnes/Ha`);
  console.log(`Overproduction Threshold (+20%): ${overproductionThreshold} Tonnes/Ha`);

  // Flag districts and add coordinates
  const processedDistricts = rawDistricts.map(d => {
    const isOverproducing = d.productivity >= overproductionThreshold;
    const pctAboveAverage = Number((((d.productivity - overallAvgProductivity) / overallAvgProductivity) * 100).toFixed(1));
    const coords = DISTRICT_COORDINATES[d.district] || { lat: 10.8, lng: 78.5 };

    return {
      sNo: d.sNo,
      state: d.state,
      district: d.district,
      areaHa: d.areaHa,
      productionTonnes: d.productionTonnes,
      productivity: d.productivity,
      isOverproducing,
      pctAboveAverage,
      lat: coords.lat,
      lng: coords.lng
    };
  });

  const overproducingCount = processedDistricts.filter(d => d.isOverproducing).length;
  console.log(`Overproducing Districts Flagged: ${overproducingCount} / ${processedDistricts.length}`);

  const outputData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      dataset: "vegetables_abstract_2016_17.csv",
      cropCategory: "Vegetables",
      totalDistricts: processedDistricts.length,
      overproducingDistrictsCount: overproducingCount,
      overallAvgProductivityTonnesPerHa: overallAvgProductivity,
      thresholdProductivityTonnesPerHa: overproductionThreshold,
      thresholdPct: 20
    },
    districts: processedDistricts
  };

  // Determine output path in public directory
  const possiblePublicDirs = [
    path.resolve(__dirname, '../artifacts/ayutrace/public'),
    path.resolve(__dirname, '../public'),
    path.resolve(process.cwd(), 'artifacts/ayutrace/public'),
    path.resolve(process.cwd(), 'public')
  ];

  let targetPublicDir = possiblePublicDirs.find(d => fs.existsSync(d)) || possiblePublicDirs[0];

  if (!fs.existsSync(targetPublicDir)) {
    fs.mkdirSync(targetPublicDir, { recursive: true });
  }

  const outputPath = path.join(targetPublicDir, 'geotagged_overproduction.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

  console.log(`\nSuccessfully exported geotagged overproduction data to:\n${outputPath}\n`);
}

processOverproductionData();
