import { Document, Font, Image, Page, StyleSheet, Text as ReactPdfText, View } from "@react-pdf/renderer";
import type { PropsWithChildren, ReactNode } from "react";
import type { TextProps } from "@react-pdf/renderer";
import { formatDate, formatNumber, getTheme } from "../data";
import { buildSpecialPages, getContainerVgmKg } from "../export-forms";
import { documentTitle } from "../i18n";
import type { ShippingParty, TradeDocument } from "../types";
import docLatinRegular from "@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff2?url";
import docLatinBold from "@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff2?url";
import docCjkRegular from "@fontpkg/noto-sans-cjk-sc/NotoSansCJKsc-Regular.otf?url";
import docCjkBold from "@fontpkg/noto-sans-cjk-sc/NotoSansCJKsc-Bold.otf?url";
import docArabicRegular from "@expo-google-fonts/noto-sans-arabic/400Regular/NotoSansArabic_400Regular.ttf?url";
import docArabicBold from "@expo-google-fonts/noto-sans-arabic/700Bold/NotoSansArabic_700Bold.ttf?url";

Font.register({ family: "DocLatin", fonts: [{ src: docLatinRegular }, { src: docLatinBold, fontWeight: 700 }] });
Font.register({ family: "DocCJK", fonts: [{ src: docCjkRegular }, { src: docCjkBold, fontWeight: 700 }] });
Font.register({ family: "DocArabic", fonts: [{ src: docArabicRegular }, { src: docArabicBold, fontWeight: 700 }] });
Font.registerHyphenationCallback((word) => [word]);

const cjkPattern = /[\u3000-\u303f\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]/;
const cjkSegments = /([\u3000-\u303f\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]+)/g;
function Text({ children, ...props }: PropsWithChildren<TextProps>) {
  if (typeof children !== "string") return <ReactPdfText {...props}>{children}</ReactPdfText>;
  return <ReactPdfText {...props}>{children.split(cjkSegments).map((part, index) => cjkPattern.test(part) ? <ReactPdfText key={index} style={{ fontFamily: "DocCJK" }}>{part}</ReactPdfText> : part)}</ReactPdfText>;
}

const styles = StyleSheet.create({
  page: { paddingTop: 28, paddingHorizontal: 32, paddingBottom: 34, fontSize: 6.5, color: "#172033", lineHeight: 1.35 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 10, borderBottomWidth: 1.3 },
  company: { flexDirection: "row", width: "60%", gap: 7 },
  logo: { width: 70, height: 24, objectFit: "contain" },
  logoPlaceholder: { width: 28, height: 28, color: "#fff", fontSize: 11, fontWeight: 700, alignItems: "center", justifyContent: "center" },
  companyName: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
  muted: { color: "#64748b", fontSize: 5.5 },
  title: { fontSize: 13, fontWeight: 700, textAlign: "right", maxWidth: "38%" },
  meta: { flexDirection: "row", gap: 20, paddingVertical: 8 },
  metaBlock: { minWidth: 90 },
  label: { fontSize: 5.3, fontWeight: 700, letterSpacing: 0.3, marginBottom: 2 },
  metaValue: { fontSize: 7, fontWeight: 700 },
  banner: { marginHorizontal: -32, marginBottom: 8, paddingVertical: 5, paddingHorizontal: 32, fontSize: 5.8, fontWeight: 700, textAlign: "center" },
  section: { marginBottom: 8 },
  blockTitle: { fontSize: 6.2, fontWeight: 700, letterSpacing: 0.3, marginBottom: 4 },
  partyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  party: { width: "32%", padding: 5, borderWidth: 0.5, borderColor: "#e2e8f0", minHeight: 45 },
  partyTitle: { fontSize: 4.9, fontWeight: 700, marginBottom: 2 },
  partyName: { fontSize: 6.5, fontWeight: 700 },
  partyText: { fontSize: 5.2, color: "#475569", marginTop: 1 },
  valueGrid: { flexDirection: "row", flexWrap: "wrap", borderTopWidth: 0.5, borderLeftWidth: 0.5, borderColor: "#dbe3ec" },
  value: { width: "25%", minHeight: 27, padding: 4, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: "#dbe3ec" },
  valueLabel: { fontSize: 4.6, color: "#64748b", fontWeight: 700 },
  valueText: { fontSize: 5.8, fontWeight: 700, marginTop: 2 },
  table: { borderWidth: 0.5, borderColor: "#cbd5e1" },
  row: { flexDirection: "row", minHeight: 23, borderBottomWidth: 0.4, borderColor: "#e2e8f0" },
  head: { minHeight: 20 },
  cell: { padding: 4, borderRightWidth: 0.4, borderColor: "#e2e8f0", fontSize: 5.5 },
  cellHead: { fontSize: 4.7, fontWeight: 700 },
  itemName: { fontSize: 5.8, fontWeight: 700 },
  itemSmall: { fontSize: 4.8, color: "#64748b", marginTop: 1 },
  instruction: { fontSize: 5.8, color: "#475569", marginTop: 3 },
  vgmRow: { borderWidth: 0.5, borderColor: "#cbd5e1", marginBottom: 6 },
  vgmHeading: { flexDirection: "row", justifyContent: "space-between", padding: 6 },
  vgmCalc: { flexDirection: "row", alignItems: "center", gap: 8, padding: 6 },
  vgmMethod: { width: 55, fontSize: 5.8, fontWeight: 700 },
  vgmFormula: { flex: 1, fontSize: 5.2, color: "#64748b" },
  vgmValue: { fontSize: 10, fontWeight: 700 },
  authorization: { flexDirection: "row", gap: 24, marginTop: 8 },
  authorizationBlock: { flex: 1, minHeight: 42 },
  signatureLine: { borderBottomWidth: 0.6, borderColor: "#64748b", marginTop: 12, marginBottom: 4 },
  stamp: { width: 56, height: 56, objectFit: "contain", position: "absolute", right: 0, bottom: 0 },
  pageNumber: { position: "absolute", bottom: 15, left: 32, right: 32, fontSize: 5.5, color: "#64748b", textAlign: "center" },
});

function Value({ label, value, color }: { label: string; value?: string | number; color: string }) {
  return <View style={styles.value}><Text style={[styles.valueLabel, { color }]}>{label}</Text><Text style={styles.valueText}>{value === "" || value === undefined ? "—" : String(value)}</Text></View>;
}

function Party({ title, party, color, pale }: { title: string; party: ShippingParty; color: string; pale: string }) {
  return (
    <View style={[styles.party, { backgroundColor: pale }]}>
      <Text style={[styles.partyTitle, { color }]}>{title}</Text>
      <Text style={styles.partyName}>{party.name || "—"}</Text>
      <Text style={styles.partyText}>{party.address || "—"}</Text>
      {(party.reference || party.contact) && <Text style={styles.partyText}>{[party.contact, party.reference].filter(Boolean).join(" · ")}</Text>}
    </View>
  );
}

function BlockTitle({ children, color }: { children: string; color: string }) {
  return <Text style={[styles.blockTitle, { color }]}>{children}</Text>;
}

function Cell({ children, width, head = false, color }: { children: ReactNode; width: string; head?: boolean; color?: string }) {
  return <View style={[styles.cell, { width }]}>{typeof children === "string" || typeof children === "number" ? <Text style={[...(head ? [styles.cellHead] : []), { color }]}>{String(children)}</Text> : children}</View>;
}

export function SpecialPdfDocument({ doc }: { doc: TradeDocument }) {
  const theme = getTheme(doc.themeId);
  const pages = buildSpecialPages(doc);
  const shipping = doc.shipping!;
  const parties = doc.shippingParties!;
  const fontFamily = doc.language === "ar" ? "DocArabic" : "DocCJK";
  const isPreparation = doc.type === "ams" || doc.type === "isf";

  return (
    <Document title={`${doc.number} ${documentTitle(doc.type, doc.language)}`} author={doc.companySnapshot.nameEn} language={doc.language}>
      {pages.map((page, pageIndex) => (
        <Page key={pageIndex} size="A4" style={[styles.page, { fontFamily }]}>
          <View style={[styles.header, { borderBottomColor: theme.color }]}>
            <View style={styles.company}>
              {doc.companySnapshot.logo ? <Image src={doc.companySnapshot.logo} style={styles.logo} /> : <View style={[styles.logoPlaceholder, { backgroundColor: theme.color }]}><Text>Q</Text></View>}
              <View style={{ flex: 1 }}>
                <Text style={styles.companyName}>{doc.language === "zh-CN" ? doc.companySnapshot.nameZh : doc.companySnapshot.nameEn}</Text>
                {doc.companySnapshot.address && <Text style={styles.muted}>{doc.companySnapshot.address}</Text>}
                {(doc.companySnapshot.phone || doc.companySnapshot.email) && <Text style={styles.muted}>{[doc.companySnapshot.phone, doc.companySnapshot.email].filter(Boolean).join(" · ")}</Text>}
              </View>
            </View>
            <Text style={[styles.title, { color: theme.color }]}>{documentTitle(doc.type, doc.language)}</Text>
          </View>

          <View style={styles.meta}>
            <View style={styles.metaBlock}><Text style={[styles.label, { color: theme.color }]}>DOCUMENT NO.</Text><Text style={styles.metaValue}>{doc.number}</Text></View>
            <View style={styles.metaBlock}><Text style={[styles.label, { color: theme.color }]}>ISSUE DATE</Text><Text style={styles.metaValue}>{formatDate(doc.issueDate, doc.language)}</Text></View>
            <View style={styles.metaBlock}><Text style={[styles.label, { color: theme.color }]}>BOOKING NO.</Text><Text style={styles.metaValue}>{shipping.bookingNumber || "—"}</Text></View>
            {pageIndex > 0 && <View style={styles.metaBlock}><Text style={[styles.label, { color: theme.color }]}>PAGE</Text><Text style={styles.metaValue}>CONTINUATION</Text></View>}
          </View>

          {isPreparation && pageIndex === 0 && <View style={[styles.banner, { backgroundColor: theme.pale }]}><Text style={{ color: theme.color, fontWeight: 700 }}>PREPARATION DOCUMENT · NOT PROOF OF CUSTOMS FILING / 申报资料准备稿，非申报回执</Text></View>}

          {page.overview && (
            <>
              <View style={styles.section}>
                <BlockTitle color={theme.color}>TRANSPORT PARTIES / 运输相关方</BlockTitle>
                <View style={styles.partyGrid}>
                  <Party title="SHIPPER / 托运人" party={parties.shipper} color={theme.color} pale={theme.pale} />
                  <Party title="CONSIGNEE / 收货人" party={parties.consignee} color={theme.color} pale={theme.pale} />
                  {doc.type !== "vgm" && <Party title="NOTIFY PARTY / 通知方" party={parties.notifyParty} color={theme.color} pale={theme.pale} />}
                  {doc.type === "isf" && doc.isf && (
                    <>
                      <Party title="SELLER / 卖方" party={doc.isf.seller} color={theme.color} pale={theme.pale} />
                      <Party title="BUYER / 买方" party={doc.isf.buyer} color={theme.color} pale={theme.pale} />
                      <Party title="MANUFACTURER / SUPPLIER" party={doc.isf.manufacturer} color={theme.color} pale={theme.pale} />
                      <Party title="SHIP TO PARTY" party={doc.isf.shipToParty} color={theme.color} pale={theme.pale} />
                      <Party title="CONTAINER STUFFING LOCATION" party={doc.isf.stuffingLocation} color={theme.color} pale={theme.pale} />
                      <Party title="CONSOLIDATOR / 拼箱方" party={doc.isf.consolidator} color={theme.color} pale={theme.pale} />
                    </>
                  )}
                </View>
              </View>
              <View style={styles.section}>
                <BlockTitle color={theme.color}>SHIPMENT & ROUTING / 船运与港口</BlockTitle>
                <View style={styles.valueGrid}>
                  <Value label="MASTER B/L" value={shipping.masterBillNumber} color={theme.color} />
                  <Value label="HOUSE B/L" value={shipping.houseBillNumber} color={theme.color} />
                  <Value label="CARRIER" value={shipping.carrierName} color={theme.color} />
                  {(doc.type === "ams" || doc.type === "isf") && <Value label="CARRIER SCAC" value={shipping.carrierScac} color={theme.color} />}
                  <Value label="VESSEL" value={shipping.vesselName} color={theme.color} />
                  <Value label="VOYAGE" value={shipping.voyageNumber} color={theme.color} />
                  <Value label="PLACE OF RECEIPT" value={shipping.placeOfReceipt} color={theme.color} />
                  <Value label="PORT OF LOADING" value={shipping.portOfLoading} color={theme.color} />
                  <Value label="PORT OF DISCHARGE" value={shipping.portOfDischarge} color={theme.color} />
                  <Value label="PLACE OF DELIVERY" value={shipping.placeOfDelivery} color={theme.color} />
                  {doc.type === "ams" && <Value label="LAST FOREIGN PORT" value={shipping.lastForeignPort} color={theme.color} />}
                  <Value label="ETD" value={shipping.etd} color={theme.color} />
                  <Value label="ETA" value={shipping.eta} color={theme.color} />
                  <Value label="FREIGHT TERMS" value={shipping.freightTerms} color={theme.color} />
                </View>
              </View>
            </>
          )}

          {page.cargo && doc.type !== "vgm" && (
            <View style={styles.section}>
              <BlockTitle color={theme.color}>CARGO DETAILS / 货物明细</BlockTitle>
              <View style={styles.table}>
                <View style={[styles.row, styles.head, { backgroundColor: theme.pale }]}>
                  <Cell width="6%" head color={theme.color}>NO.</Cell><Cell width="36%" head color={theme.color}>DESCRIPTION</Cell><Cell width="14%" head color={theme.color}>PACKAGES</Cell><Cell width="13%" head color={theme.color}>GROSS KG</Cell><Cell width="13%" head color={theme.color}>VOLUME M³</Cell><Cell width="18%" head color={theme.color}>HS / ORIGIN</Cell>
                </View>
                {page.items.length ? page.items.map((item, index) => (
                  <View style={styles.row} key={item.id}>
                    <Cell width="6%">{page.itemOffset + index + 1}</Cell>
                    <Cell width="36%"><View><Text style={styles.itemName}>{item.name || item.nameZh}</Text><Text style={styles.itemSmall}>{item.description || item.sku}</Text></View></Cell>
                    <Cell width="14%">{formatNumber(item.packageCount, doc.language, 0)}</Cell>
                    <Cell width="13%">{formatNumber(item.grossWeight, doc.language)}</Cell>
                    <Cell width="13%">{formatNumber(item.measurements, doc.language, 3)}</Cell>
                    <Cell width="18%"><View><Text>{item.hsCode || "—"}</Text><Text style={styles.itemSmall}>{item.originCountry || ""}</Text></View></Cell>
                  </View>
                )) : <View style={styles.row}><Cell width="100%">—</Cell></View>}
              </View>
            </View>
          )}

          {page.cargo && (doc.type === "vgm" || page.containers.length > 0 || !(doc.containers ?? []).length) && (
            <View style={styles.section}>
              <BlockTitle color={theme.color}>{doc.type === "vgm" ? "CONTAINER VERIFIED GROSS MASS / 集装箱核实总重" : "CONTAINERS / 集装箱资料"}</BlockTitle>
              {doc.type === "vgm" ? page.containers.map((container, index) => (
                <View style={styles.vgmRow} key={container.id}>
                  <View style={[styles.vgmHeading, { backgroundColor: theme.pale }]}><Text style={{ color: theme.color, fontSize: 7, fontWeight: 700 }}>{page.containerOffset + index + 1}. {container.containerNumber || "—"}</Text><Text style={{ fontSize: 5.5 }}>{container.sizeType} · SEAL: {container.sealNumber || "—"}</Text></View>
                  <View style={styles.vgmCalc}>
                    <Text style={styles.vgmMethod}>{container.vgmMethod === "method2" ? "METHOD 2" : "METHOD 1"}</Text>
                    <Text style={styles.vgmFormula}>{container.vgmMethod === "method2" ? `${container.cargoWeightKg ?? 0} cargo + ${container.packagingWeightKg ?? 0} packing + ${container.dunnageWeightKg ?? 0} dunnage + ${container.tareWeightKg ?? 0} tare` : "Weighed packed and sealed container"}</Text>
                    <Text style={[styles.vgmValue, { color: theme.color }]}>{getContainerVgmKg(container).toFixed(2)} kg</Text>
                  </View>
                </View>
              )) : (
                <View style={styles.table}>
                  <View style={[styles.row, styles.head, { backgroundColor: theme.pale }]}><Cell width="22%" head color={theme.color}>CONTAINER NO.</Cell><Cell width="18%" head color={theme.color}>SEAL NO.</Cell><Cell width="10%" head color={theme.color}>TYPE</Cell><Cell width="20%" head color={theme.color}>PACKAGES</Cell><Cell width="15%" head color={theme.color}>GROSS KG</Cell><Cell width="15%" head color={theme.color}>VOLUME M³</Cell></View>
                  {page.containers.length ? page.containers.map((container) => <View style={styles.row} key={container.id}><Cell width="22%">{container.containerNumber || "—"}</Cell><Cell width="18%">{container.sealNumber || "—"}</Cell><Cell width="10%">{container.sizeType}</Cell><Cell width="20%">{container.packageCount} {container.packageType}</Cell><Cell width="15%">{container.grossWeightKg}</Cell><Cell width="15%">{container.volumeCbm}</Cell></View>) : <View style={styles.row}><Cell width="100%">—</Cell></View>}
                </View>
              )}
            </View>
          )}

          {page.tail && (
            <View style={{ position: "relative" }}>
              {doc.type === "ams" && doc.ams && (
                <View style={styles.section}><BlockTitle color={theme.color}>AMS REFERENCE DATA / 申报参考要素</BlockTitle><View style={styles.valueGrid}><Value label="SHIPMENT TYPE" value={doc.ams.shipmentType} color={theme.color} /><Value label="CARGO CONTROL NO." value={doc.ams.cargoControlNumber} color={theme.color} /><Value label="IN-BOND NO." value={doc.ams.inBondNumber} color={theme.color} /><Value label="ENTRY NO." value={doc.ams.entryNumber} color={theme.color} /></View></View>
              )}
              {doc.type === "isf" && doc.isf && (
                <View style={styles.section}><BlockTitle color={theme.color}>ISF IMPORTER DATA / 进口方申报要素</BlockTitle><View style={styles.valueGrid}><Value label="IMPORTER OF RECORD NO." value={doc.isf.importerOfRecordNumber} color={theme.color} /><Value label="CONSIGNEE NO." value={doc.isf.consigneeNumber} color={theme.color} /><Value label="HTSUS NO." value={doc.isf.htsusNumber} color={theme.color} /><Value label="COUNTRY OF ORIGIN" value={doc.isf.countryOfOrigin} color={theme.color} /></View></View>
              )}
              {doc.type === "si" && doc.si && (
                <View style={styles.section}>
                  <BlockTitle color={theme.color}>B/L & RELEASE INSTRUCTIONS / 提单与放单要求</BlockTitle>
                  <View style={styles.valueGrid}><Value label="RELEASE TYPE" value={doc.si.releaseType} color={theme.color} /><Value label="ORIGINAL B/L COUNT" value={doc.si.originalBillCount} color={theme.color} /><Value label="FREIGHT PAYABLE AT" value={doc.si.freightPayableAt} color={theme.color} /></View>
                  {doc.si.alsoNotifyParty.name && <View style={{ marginTop: 5 }}><Party title="ALSO NOTIFY PARTY" party={doc.si.alsoNotifyParty} color={theme.color} pale={theme.pale} /></View>}
                  {doc.si.documentInstructions && <Text style={styles.instruction}>{doc.si.documentInstructions}</Text>}
                  {doc.si.specialInstructions && <Text style={styles.instruction}>{doc.si.specialInstructions}</Text>}
                </View>
              )}
              {doc.shippingMarks && <View style={styles.section}><BlockTitle color={theme.color}>MARKS & NUMBERS / 唛头</BlockTitle><Text style={styles.instruction}>{doc.shippingMarks}</Text></View>}
              {doc.notes && <View style={styles.section}><BlockTitle color={theme.color}>REMARKS / 备注</BlockTitle><Text style={styles.instruction}>{doc.notes}</Text></View>}
              {doc.type === "vgm" && doc.vgm && (
                <View style={styles.section}>
                  <BlockTitle color={theme.color}>WEIGHING & AUTHORIZATION / 称重与授权</BlockTitle>
                  <View style={styles.valueGrid}><Value label="WEIGHING DATE" value={doc.vgm.weighingDate} color={theme.color} /><Value label="WEIGHING LOCATION" value={doc.vgm.weighingLocation} color={theme.color} /><Value label="EQUIPMENT ID" value={doc.vgm.weighingEquipmentId} color={theme.color} /><Value label="CERTIFICATE NO." value={doc.vgm.weighingCertificateNumber} color={theme.color} /></View>
                  <View style={styles.authorization}>
                    <View style={styles.authorizationBlock}><Text style={styles.valueLabel}>AUTHORIZED PERSON (CAPITAL LETTERS)</Text><Text style={[styles.metaValue, { marginTop: 7 }]}>{doc.vgm.authorizedPerson || "—"}</Text><Text style={styles.muted}>{doc.vgm.authorizedPersonTitle}</Text></View>
                    <View style={styles.authorizationBlock}><Text style={styles.valueLabel}>SIGNATURE / DATE</Text><View style={styles.signatureLine} /><Text style={styles.metaValue}>{doc.vgm.signatureDate || "—"}</Text></View>
                  </View>
                </View>
              )}
              {doc.showStamp && doc.companySnapshot.stamp && <Image src={doc.companySnapshot.stamp} style={styles.stamp} />}
            </View>
          )}
          <Text style={styles.pageNumber}>{doc.number} · {pageIndex + 1} / {pages.length}</Text>
        </Page>
      ))}
    </Document>
  );
}
