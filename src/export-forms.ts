import type {
  Company,
  Customer,
  DocumentItem,
  DocumentType,
  ShippingContainer,
  ShippingParty,
  TradeDocument,
} from "./types";

export const SPECIAL_DOCUMENT_TYPES: DocumentType[] = ["ams", "isf", "vgm", "si"];

export function isSpecialDocumentType(type: DocumentType) {
  return SPECIAL_DOCUMENT_TYPES.includes(type);
}

export function emptyParty(): ShippingParty {
  return { name: "", address: "", contact: "", phone: "", email: "", reference: "" };
}

export function partyFromCompany(company: Company): ShippingParty {
  return {
    ...emptyParty(),
    name: company.nameEn || company.nameZh,
    address: company.address,
    phone: company.phone,
    email: company.email,
    reference: company.registration,
  };
}

export function partyFromCustomer(customer: Customer | null): ShippingParty {
  if (!customer) return emptyParty();
  return {
    ...emptyParty(),
    name: customer.name,
    address: customer.shippingAddress || customer.billingAddress,
    contact: customer.contact,
    phone: customer.phone,
    email: customer.email,
    reference: customer.registration,
  };
}

export function createEmptyContainer(vgm = false): ShippingContainer {
  return {
    id: `container-${crypto.randomUUID()}`,
    containerNumber: "",
    sealNumber: "",
    sizeType: "40HQ",
    packageCount: 0,
    packageType: "CARTONS",
    grossWeightKg: 0,
    volumeCbm: 0,
    ...(vgm
      ? {
          vgmMethod: "method1" as const,
          weighedGrossMassKg: 0,
          tareWeightKg: 0,
          cargoWeightKg: 0,
          packagingWeightKg: 0,
          dunnageWeightKg: 0,
        }
      : {}),
  };
}

function sampleParty(name: string, address: string, reference = ""): ShippingParty {
  return {
    ...emptyParty(),
    name,
    address,
    contact: "Sample Contact",
    phone: "+1 555 0100",
    email: "sample@example.com",
    reference,
  };
}

export function createSpecialDocumentData(
  type: DocumentType,
  company: Company,
  customer: Customer | null,
  demonstration = false,
): Partial<TradeDocument> {
  if (!isSpecialDocumentType(type)) return {};

  const shipper = demonstration
    ? sampleParty(company.nameEn || company.nameZh, company.address, company.registration)
    : partyFromCompany(company);
  const consignee = demonstration && !customer
    ? sampleParty("Sample Consignee LLC", "1200 Example Avenue, Los Angeles, CA, USA", "SAMPLE CONSIGNEE")
    : partyFromCustomer(customer);
  const shipping = {
    bookingNumber: demonstration ? "SAMPLE-BKG-001" : "",
    masterBillNumber: demonstration ? "SAMPLE-MBL-001" : "",
    houseBillNumber: demonstration ? "SAMPLE-HBL-001" : "",
    carrierName: demonstration ? "Sample Ocean Carrier" : "",
    carrierScac: "",
    vesselName: demonstration ? "SAMPLE VESSEL" : "",
    voyageNumber: demonstration ? "V.001E" : "",
    placeOfReceipt: demonstration ? "Shanghai, China" : "",
    portOfLoading: demonstration ? "Shanghai, China" : "",
    portOfDischarge: demonstration ? "Los Angeles, USA" : "",
    placeOfDelivery: demonstration ? "Los Angeles, USA" : "",
    lastForeignPort: "",
    etd: demonstration ? "2026-11-20" : "",
    eta: demonstration ? "2026-12-08" : "",
    freightTerms: demonstration ? "PREPAID" : "",
    serviceContractNumber: "",
  };
  const base: Partial<TradeDocument> = {
    shipping,
    shippingParties: { shipper, consignee, notifyParty: emptyParty() },
    containers: [],
  };

  if (type === "ams") {
    base.ams = { shipmentType: "FCL", inBondNumber: "", entryNumber: "", cargoControlNumber: "" };
    base.containers = demonstration
      ? [{ ...createEmptyContainer(), id: "sample-ams-container", containerNumber: "SMPU0000001", sealNumber: "SAMPLE-SEAL", packageCount: 15, grossWeightKg: 134.4 }]
      : [];
  }
  if (type === "isf") {
    base.isf = {
      seller: { ...shipper },
      buyer: demonstration ? sampleParty("Sample Buyer LLC", "500 Sample Street, Seattle, WA, USA", "SAMPLE BUYER") : emptyParty(),
      manufacturer: { ...shipper },
      shipToParty: { ...consignee },
      stuffingLocation: demonstration ? sampleParty("Sample CFS Warehouse", "88 Example Port Road, Shanghai, China") : emptyParty(),
      consolidator: emptyParty(),
      importerOfRecordNumber: "",
      consigneeNumber: "",
      htsusNumber: demonstration ? "6912.00.0000" : "",
      countryOfOrigin: demonstration ? "CN" : "",
    };
    base.containers = demonstration
      ? [{ ...createEmptyContainer(), id: "sample-isf-container", containerNumber: "SMPU0000002", sealNumber: "SAMPLE-SEAL", packageCount: 15, grossWeightKg: 134.4 }]
      : [];
  }
  if (type === "si") {
    base.si = {
      releaseType: "ORIGINAL B/L",
      originalBillCount: 3,
      freightPayableAt: "",
      alsoNotifyParty: emptyParty(),
      documentInstructions: "",
      specialInstructions: "",
    };
    base.containers = demonstration
      ? [{ ...createEmptyContainer(), id: "sample-si-container", containerNumber: "SMPU0000003", sealNumber: "SAMPLE-SEAL", packageCount: 15, grossWeightKg: 134.4 }]
      : [];
  }
  if (type === "vgm") {
    base.vgm = {
      weighingDate: demonstration ? "2026-11-18" : "",
      weighingLocation: demonstration ? "Sample Container Terminal, Shanghai" : "",
      weighingEquipmentId: "",
      weighingCertificateNumber: "",
      authorizedPerson: "",
      authorizedPersonTitle: "",
      signatureDate: demonstration ? "2026-11-18" : "",
    };
    base.containers = [
      {
        ...createEmptyContainer(true),
        id: demonstration ? "sample-vgm-container" : `container-${crypto.randomUUID()}`,
        containerNumber: demonstration ? "SMPU0000004" : "",
        sealNumber: demonstration ? "SAMPLE-SEAL" : "",
        packageCount: demonstration ? 15 : 0,
        weighedGrossMassKg: demonstration ? 4210 : 0,
        grossWeightKg: demonstration ? 4210 : 0,
      },
    ];
  }
  return base;
}

export function ensureSpecialDocumentData(doc: TradeDocument, targetType: DocumentType = doc.type): Partial<TradeDocument> {
  if (!isSpecialDocumentType(targetType)) return {};
  const defaults = createSpecialDocumentData(targetType, doc.companySnapshot, doc.customerSnapshot);
  const result: Partial<TradeDocument> = {
    shipping: { ...defaults.shipping!, ...doc.shipping },
    containers: Array.isArray(doc.containers) ? doc.containers : defaults.containers,
  };
  if (doc.shippingParties || defaults.shippingParties) {
    result.shippingParties = {
      shipper: { ...defaults.shippingParties!.shipper, ...doc.shippingParties?.shipper },
      consignee: { ...defaults.shippingParties!.consignee, ...doc.shippingParties?.consignee },
      notifyParty: { ...defaults.shippingParties!.notifyParty, ...doc.shippingParties?.notifyParty },
    };
  }
  if (targetType === "ams") result.ams = { ...defaults.ams!, ...doc.ams };
  if (targetType === "isf") {
    result.isf = {
      ...defaults.isf!,
      ...doc.isf,
      seller: { ...defaults.isf!.seller, ...doc.isf?.seller },
      buyer: { ...defaults.isf!.buyer, ...doc.isf?.buyer },
      manufacturer: { ...defaults.isf!.manufacturer, ...doc.isf?.manufacturer },
      shipToParty: { ...defaults.isf!.shipToParty, ...doc.isf?.shipToParty },
      stuffingLocation: { ...defaults.isf!.stuffingLocation, ...doc.isf?.stuffingLocation },
      consolidator: { ...defaults.isf!.consolidator, ...doc.isf?.consolidator },
    };
  }
  if (targetType === "vgm") result.vgm = { ...defaults.vgm!, ...doc.vgm };
  if (targetType === "si") {
    result.si = {
      ...defaults.si!,
      ...doc.si,
      alsoNotifyParty: { ...defaults.si!.alsoNotifyParty, ...doc.si?.alsoNotifyParty },
    };
  }
  return result;
}

export function getContainerVgmKg(container: ShippingContainer) {
  if (container.vgmMethod === "method2") {
    return (container.cargoWeightKg ?? 0) + (container.packagingWeightKg ?? 0) + (container.dunnageWeightKg ?? 0) + (container.tareWeightKg ?? 0);
  }
  return container.weighedGrossMassKg ?? 0;
}

export interface SpecialPageModel {
  items: DocumentItem[];
  containers: ShippingContainer[];
  itemOffset: number;
  containerOffset: number;
  overview: boolean;
  cargo: boolean;
  tail: boolean;
}

function chunks<T>(values: T[], size: number): T[][] {
  if (!values.length) return [[]];
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, index * size + size));
}

export function buildSpecialPages(doc: TradeDocument): SpecialPageModel[] {
  const itemChunks = chunks(doc.items, doc.type === "isf" ? 6 : 5);
  const containerChunks = chunks(doc.containers ?? [], doc.type === "vgm" ? 4 : 5);
  const contentPages = Math.max(itemChunks.length, containerChunks.length);
  const overviewOnly = doc.type === "isf" ? 1 : 0;
  const total = contentPages + overviewOnly;
  return Array.from({ length: total }, (_, pageIndex) => {
    const contentIndex = pageIndex - overviewOnly;
    return {
      items: contentIndex >= 0 ? itemChunks[contentIndex] ?? [] : [],
      containers: contentIndex >= 0 ? containerChunks[contentIndex] ?? [] : [],
      itemOffset: contentIndex >= 0 ? contentIndex * (doc.type === "isf" ? 6 : 5) : 0,
      containerOffset: contentIndex >= 0 ? contentIndex * (doc.type === "vgm" ? 4 : 5) : 0,
      overview: pageIndex === 0,
      cargo: contentIndex >= 0,
      tail: pageIndex === total - 1,
    };
  });
}
