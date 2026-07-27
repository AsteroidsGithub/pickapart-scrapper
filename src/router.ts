import { createCheerioRouter, Dataset, log } from 'crawlee';

export const router = createCheerioRouter();

// Helper to remove leading colons, spaces, and clean text
const cleanText = (text: string): string | null => {
    const cleaned = text.replace(/^[:\s]+/, '').trim();

    if (
        cleaned === '' ||
        cleaned.toLowerCase() === 'na' ||
        cleaned.toLowerCase() === 'n/a' ||
        cleaned.toLowerCase() === 'unknown'
    ) {
        return null;
    }
    return cleaned || null;
};

// Helper to parse DD/MM/YYYY into an ISO Date string or null
const parseDate = (text: string): Date | null => {
    const cleaned = cleanText(text);
    if (!cleaned) return null;
    const [day, month, year] = cleaned.split('/').map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
};

// Helper to safely parse numeric fields
const parseNumber = (text: string): number | null => {
    const cleaned = cleanText(text);
    if (!cleaned) return null;
    const num = Number(cleaned);
    return isNaN(num) || cleaned === '' ? null : num;
};

interface VehicleDetails {
    lotNumber: number | null;
    vehicleRef: number | null;
    make: string | null;
    model: string | null;
    engine: string | null;
    transmission: string | null;
    year: number | null;
    drivetrain: string | null;
    odometer: number | null;
    dateInStock: Date | null;
    vinNumber: string | null;
    engineNumber: string | null;
    fuelType: string | null;
    engineCapacity: number | null;
    keysAvailable: boolean;
}

router.addDefaultHandler(async ({ request, $ }) => {
    log.info(`Default handler for: ${request.url}`);

    // Extract raw text blocks by selecting the last child node text of parent containers
    const getFieldText = (selector: string): string => {
        return $(selector).parent().contents().last().text();
    };

    const rawLotNumber = $('#lblEngine')
        .eq(0)
        .parent()
        .contents()
        .last()
        .text();
    const rawVehicleRef = $('strong')
        .filter((_, el) => $(el).text().trim() === 'Vehicle Ref')
        .parent()
        .contents()
        .last()
        .text();
    const rawKeys = $('span[style*="color:red"]').text();

    const vehicleDetails: VehicleDetails = {
        lotNumber: parseNumber(rawLotNumber),
        vehicleRef: parseNumber(rawVehicleRef),
        make: cleanText(getFieldText('#lblMake')),
        model: cleanText(getFieldText('#lblModel')),
        engine: cleanText(
            $('#lblEngine').eq(1).parent().contents().last().text(),
        ),
        transmission: cleanText(getFieldText('#lblTransmission')),
        year: parseNumber(getFieldText('#lblYear')),
        drivetrain: cleanText(getFieldText('#lblDriveTrain')),
        odometer: parseNumber(getFieldText('#lblOdometer')),
        dateInStock: parseDate(getFieldText('#lblStockinDate')),
        vinNumber: cleanText(getFieldText('#lblVinNumber')),
        engineNumber: cleanText(getFieldText('#lblEngineNumber')),
        fuelType: cleanText(getFieldText('#lblFuelType')),
        engineCapacity: parseNumber(getFieldText('#lblEngineCapacity')),
        keysAvailable: cleanText(rawKeys)?.toLowerCase() === 'yes',
    };

    await Dataset.pushData(vehicleDetails);
    log.info('Vehicle details pushed to dataset');
});
