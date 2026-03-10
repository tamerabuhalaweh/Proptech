import type {
  PropertySummary,
  PropertyDetail,
  Building,
  Unit,
  BuildingGrid,
  UnitStatus,
  UnitType,
} from "./types";

// Mock properties list
export const mockProperties: PropertySummary[] = [
  {
    id: "prop_1",
    name: "Al Noor Residential Tower",
    nameAr: "برج النور السكني",
    slug: "al-noor-tower",
    type: "residential",
    status: "active",
    address: {
      street: "King Fahd Road",
      streetAr: "طريق الملك فهد",
      city: "Riyadh",
      cityAr: "الرياض",
      district: "Al Olaya",
      districtAr: "العليا",
      coordinates: { lat: 24.7136, lng: 46.6753 },
    },
    coverImage: {
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
    },
    stats: { totalUnits: 120, occupiedUnits: 110, occupancyRate: 92, revenueMTD: 890000 },
    createdAt: "2025-01-15T08:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "prop_2",
    name: "Riyadh Heights",
    nameAr: "مرتفعات الرياض",
    slug: "riyadh-heights",
    type: "mixed",
    status: "active",
    address: {
      street: "Olaya Street",
      streetAr: "شارع العليا",
      city: "Riyadh",
      cityAr: "الرياض",
      district: "Al Malqa",
      districtAr: "الملقا",
      coordinates: { lat: 24.7743, lng: 46.6380 },
    },
    coverImage: {
      url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
    },
    stats: { totalUnits: 85, occupiedUnits: 75, occupancyRate: 88, revenueMTD: 650000 },
    createdAt: "2025-02-20T08:00:00Z",
    updatedAt: "2026-02-28T14:00:00Z",
  },
  {
    id: "prop_3",
    name: "Jeddah Plaza",
    nameAr: "جدة بلازا",
    slug: "jeddah-plaza",
    type: "commercial",
    status: "active",
    address: {
      street: "Prince Sultan Road",
      streetAr: "طريق الأمير سلطان",
      city: "Jeddah",
      cityAr: "جدة",
      district: "Al Rawdah",
      districtAr: "الروضة",
      coordinates: { lat: 21.5169, lng: 39.2192 },
    },
    coverImage: {
      url: "https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=800&h=500&fit=crop",
    },
    stats: { totalUnits: 64, occupiedUnits: 50, occupancyRate: 78, revenueMTD: 420000 },
    createdAt: "2025-03-10T08:00:00Z",
    updatedAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "prop_4",
    name: "Dammam Heights",
    nameAr: "مرتفعات الدمام",
    slug: "dammam-heights",
    type: "residential",
    status: "completed",
    address: {
      street: "King Saud Road",
      streetAr: "طريق الملك سعود",
      city: "Dammam",
      cityAr: "الدمام",
      district: "Al Faisaliyah",
      districtAr: "الفيصلية",
    },
    coverImage: {
      url: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=500&fit=crop",
    },
    stats: { totalUnits: 48, occupiedUnits: 46, occupancyRate: 95, revenueMTD: 380000 },
    createdAt: "2025-04-05T08:00:00Z",
    updatedAt: "2026-03-05T11:00:00Z",
  },
  {
    id: "prop_5",
    name: "Khobar Gardens",
    nameAr: "حدائق الخبر",
    slug: "khobar-gardens",
    type: "residential",
    status: "active",
    address: {
      street: "Corniche Road",
      streetAr: "طريق الكورنيش",
      city: "Khobar",
      cityAr: "الخبر",
      district: "Al Corniche",
      districtAr: "الكورنيش",
    },
    coverImage: {
      url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop",
    },
    stats: { totalUnits: 36, occupiedUnits: 30, occupancyRate: 83, revenueMTD: 280000 },
    createdAt: "2025-05-12T08:00:00Z",
    updatedAt: "2026-03-08T16:00:00Z",
  },
  {
    id: "prop_6",
    name: "Al Madinah Business Center",
    nameAr: "مركز المدينة للأعمال",
    slug: "madinah-business",
    type: "commercial",
    status: "under_construction",
    address: {
      street: "Prince Abdulaziz Road",
      streetAr: "طريق الأمير عبدالعزيز",
      city: "Madinah",
      cityAr: "المدينة المنورة",
      district: "Al Uyun",
      districtAr: "العيون",
    },
    stats: { totalUnits: 40, occupiedUnits: 0, occupancyRate: 0, revenueMTD: 0 },
    createdAt: "2025-06-01T08:00:00Z",
    updatedAt: "2026-03-09T12:00:00Z",
  },
  {
    id: "prop_7",
    name: "Tabuk Oasis Villas",
    nameAr: "فلل واحة تبوك",
    slug: "tabuk-oasis",
    type: "residential",
    status: "active",
    address: {
      street: "Al Amir Fahd Road",
      streetAr: "طريق الأمير فهد",
      city: "Tabuk",
      cityAr: "تبوك",
      district: "Al Faisaliyah",
      districtAr: "الفيصلية",
    },
    coverImage: {
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop",
    },
    stats: { totalUnits: 24, occupiedUnits: 18, occupancyRate: 75, revenueMTD: 180000 },
    createdAt: "2025-07-20T08:00:00Z",
    updatedAt: "2026-02-10T08:00:00Z",
  },
  {
    id: "prop_8",
    name: "Abha Mountain Retreat",
    nameAr: "منتجع جبل أبها",
    slug: "abha-mountain",
    type: "mixed",
    status: "active",
    address: {
      street: "Al Sarawat Highway",
      streetAr: "طريق السروات السريع",
      city: "Abha",
      cityAr: "أبها",
      district: "Al Manhal",
      districtAr: "المنهل",
    },
    coverImage: {
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
    },
    stats: { totalUnits: 52, occupiedUnits: 42, occupancyRate: 81, revenueMTD: 320000 },
    createdAt: "2025-08-15T08:00:00Z",
    updatedAt: "2026-03-07T13:00:00Z",
  },
];

// Helper to generate units for a building
function generateUnits(
  buildingId: string,
  buildingName: string,
  buildingNameAr: string,
  floors: number,
  unitsPerFloor: number,
  startNum: number
): Unit[] {
  const statuses: UnitStatus[] = ["available", "reserved", "occupied", "blocked", "maintenance"];
  const types: UnitType[] = ["studio", "1br", "2br", "3br"];
  const units: Unit[] = [];

  for (let f = 1; f <= floors; f++) {
    for (let u = 0; u < unitsPerFloor; u++) {
      const unitNum = startNum + f * 100 + (u + 1);
      const statusRandom = Math.random();
      let status: UnitStatus;
      if (statusRandom < 0.15) status = "available";
      else if (statusRandom < 0.22) status = "reserved";
      else if (statusRandom < 0.90) status = "occupied";
      else if (statusRandom < 0.96) status = "blocked";
      else status = "maintenance";

      const type = types[u % types.length];
      const area = type === "studio" ? 45 : type === "1br" ? 65 : type === "2br" ? 95 : 130;
      const price = area * (800 + f * 50);

      units.push({
        id: `unit_${buildingId}_${unitNum}`,
        number: String(unitNum),
        floor: f,
        buildingId,
        buildingName,
        buildingNameAr,
        type,
        status,
        area,
        bedrooms: type === "studio" ? 0 : type === "1br" ? 1 : type === "2br" ? 2 : 3,
        bathrooms: type === "studio" ? 1 : type === "1br" ? 1 : type === "2br" ? 2 : 3,
        features: {
          balcony: Math.random() > 0.3,
          view: f > floors / 2 ? "city" : "garden",
          viewAr: f > floors / 2 ? "مدينة" : "حديقة",
          furnished: Math.random() > 0.7,
        },
        pricing: {
          annualRent: price,
          pricePerSqm: Math.round(price / area),
          lastUpdated: "2026-01-15T08:00:00Z",
        },
        tenant: status === "occupied" ? {
          id: `tenant_${unitNum}`,
          name: "Mohammed Al-" + ["Qahtani", "Harbi", "Rashidi", "Otaibi", "Shehri"][u % 5],
          nameAr: "محمد ال" + ["قحطاني", "حربي", "رشيدي", "عتيبي", "شهري"][u % 5],
          leaseStart: "2025-01-01",
          leaseEnd: "2026-12-31",
          leaseStatus: "active",
        } : undefined,
      });
    }
  }

  return units;
}

// Mock buildings for Al Noor Tower
const buildingAUnits = generateUnits("bld_1a", "Building A", "المبنى أ", 12, 6, 0);
const buildingBUnits = generateUnits("bld_1b", "Building B", "المبنى ب", 8, 5, 0);

export const mockBuildings: Building[] = [
  {
    id: "bld_1a",
    name: "Building A",
    nameAr: "المبنى أ",
    floors: 12,
    unitsCount: buildingAUnits.length,
    units: buildingAUnits,
  },
  {
    id: "bld_1b",
    name: "Building B",
    nameAr: "المبنى ب",
    floors: 8,
    unitsCount: buildingBUnits.length,
    units: buildingBUnits,
  },
];

// Property detail for Al Noor Tower
export const mockPropertyDetail: PropertyDetail = {
  ...mockProperties[0],
  description:
    "Premium residential tower in the heart of Al Olaya district, featuring modern amenities and stunning city views.",
  descriptionAr:
    "برج سكني فاخر في قلب حي العليا، يتميز بمرافق حديثة وإطلالات خلابة على المدينة.",
  details: {
    yearBuilt: "1445",
    yearBuiltGregorian: 2023,
    totalArea: 15000,
    builtUpArea: 12000,
    numberOfFloors: 12,
    numberOfBuildings: 2,
    parkingSpots: 200,
    developer: "Al Noor Development Group",
    developerAr: "مجموعة النور للتطوير",
  },
  amenities: [
    { id: "am1", icon: "Waves", name: "Swimming Pool", nameAr: "مسبح" },
    { id: "am2", icon: "Dumbbell", name: "Fitness Center", nameAr: "مركز لياقة" },
    { id: "am3", icon: "Car", name: "Parking", nameAr: "مواقف سيارات" },
    { id: "am4", icon: "Shield", name: "24/7 Security", nameAr: "أمن على مدار الساعة" },
    { id: "am5", icon: "TreePine", name: "Garden", nameAr: "حديقة" },
    { id: "am6", icon: "Wifi", name: "High-Speed Internet", nameAr: "إنترنت عالي السرعة" },
  ],
  manager: {
    id: "mgr_1",
    name: "Ahmed Hassan",
    email: "ahmed.h@alnoor.sa",
    phone: "+966 50 123 4567",
  },
  stats: {
    totalUnits: buildingAUnits.length + buildingBUnits.length,
    availableUnits: [...buildingAUnits, ...buildingBUnits].filter(
      (u) => u.status === "available"
    ).length,
    reservedUnits: [...buildingAUnits, ...buildingBUnits].filter(
      (u) => u.status === "reserved"
    ).length,
    occupiedUnits: [...buildingAUnits, ...buildingBUnits].filter(
      (u) => u.status === "occupied"
    ).length,
    blockedUnits: [...buildingAUnits, ...buildingBUnits].filter(
      (u) => u.status === "blocked"
    ).length,
    occupancyRate: 92,
    revenueMTD: 890000,
    revenueYTD: 5340000,
    avgRentPerSqm: 778,
  },
  buildings: mockBuildings,
  images: [
    {
      id: "img_1",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
      category: "exterior",
      title: "Building Exterior",
      titleAr: "واجهة المبنى",
      order: 1,
    },
    {
      id: "img_2",
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      category: "interior",
      title: "Living Room",
      titleAr: "غرفة المعيشة",
      order: 2,
    },
    {
      id: "img_3",
      url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      category: "exterior",
      title: "Pool Area",
      titleAr: "منطقة المسبح",
      order: 3,
    },
    {
      id: "img_4",
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      category: "interior",
      title: "Modern Kitchen",
      titleAr: "مطبخ حديث",
      order: 4,
    },
    {
      id: "img_5",
      url: "https://images.unsplash.com/photo-1616137466211-f736a5f14e8c?w=800&h=600&fit=crop",
      category: "interior",
      title: "Master Bedroom",
      titleAr: "غرفة النوم الرئيسية",
      order: 5,
    },
    {
      id: "img_6",
      url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop",
      category: "exterior",
      title: "Night View",
      titleAr: "إطلالة ليلية",
      order: 6,
    },
  ],
};

// Convert building units into grid data
export function buildingsToGrid(buildings: Building[]): BuildingGrid[] {
  return buildings.map((building) => {
    const units = building.units || [];
    const maxFloor = building.floors;
    const floorsMap = new Map<number, Unit[]>();

    for (const unit of units) {
      if (!floorsMap.has(unit.floor)) {
        floorsMap.set(unit.floor, []);
      }
      floorsMap.get(unit.floor)!.push(unit);
    }

    const maxUnitsPerFloor = Math.max(
      ...Array.from(floorsMap.values()).map((u) => u.length),
      1
    );

    const floors = [];
    for (let f = maxFloor; f >= 1; f--) {
      const floorUnits = floorsMap.get(f) || [];
      const gridUnits: Array<{
        id: string;
        number: string;
        column: number;
        type: string;
        status: UnitStatus;
        area: number;
        price: number;
      } | null> = [];

      for (let col = 0; col < maxUnitsPerFloor; col++) {
        const unit = floorUnits[col];
        if (unit) {
          gridUnits.push({
            id: unit.id,
            number: unit.number,
            column: col,
            type: unit.type,
            status: unit.status,
            area: unit.area,
            price: unit.pricing?.annualRent || 0,
          });
        } else {
          gridUnits.push(null);
        }
      }

      floors.push({ floor: f, units: gridUnits });
    }

    return {
      buildingId: building.id,
      name: building.name,
      nameAr: building.nameAr,
      maxFloor,
      maxUnitsPerFloor,
      floors,
    };
  });
}

// Get all units from all buildings flat
export function getAllUnits(): Unit[] {
  return mockBuildings.flatMap((b) => b.units || []);
}

// Count units by status
export function getUnitStatusCounts(units: Unit[]): Record<UnitStatus, number> {
  const counts: Record<UnitStatus, number> = {
    available: 0,
    reserved: 0,
    occupied: 0,
    blocked: 0,
    maintenance: 0,
  };
  for (const u of units) {
    counts[u.status]++;
  }
  return counts;
}
