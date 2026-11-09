import { Document, Font, Image, Page, StyleSheet, Text as PdfText, View, pdf } from "@react-pdf/renderer";
import type { PropsWithChildren } from "react";
import type { TextProps } from "@react-pdf/renderer";
import { documentTotal, formatDate, formatMoney, formatNumber, getTheme } from "../data";
import { documentTitle, paperText } from "../i18n";
import { paginateItems } from "../document-utils";
import type { TradeDocument } from "../types";
import { isSpecialDocumentType } from "../export-forms";
import { SpecialPdfDocument } from "./SpecialPdf";
import docLatinRegular from "@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff2?url";
import docLatinBold from "@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff2?url";
import docCjkRegular from "@fontpkg/noto-sans-cjk-sc/NotoSansCJKsc-Regular.otf?url";
import docCjkBold from "@fontpkg/noto-sans-cjk-sc/NotoSansCJKsc-Bold.otf?url";
import docArabicRegular from "@expo-google-fonts/noto-sans-arabic/400Regular/NotoSansArabic_400Regular.ttf?url";
import docArabicBold from "@expo-google-fonts/noto-sans-arabic/700Bold/NotoSansArabic_700Bold.ttf?url";

Font.register({
  family: "DocLatin",
  fonts: [{ src: docLatinRegular }, { src: docLatinBold, fontWeight: 700 }],
});
Font.register({
  family: "DocCJK",
  fonts: [{ src: docCjkRegular }, { src: docCjkBold, fontWeight: 700 }],
});
Font.register({
  family: "DocArabic",
  fonts: [{ src: docArabicRegular }, { src: docArabicBold, fontWeight: 700 }],
});
Font.registerHyphenationCallback((word) => [word]);

const cjkPattern = /[\u3000-\u303f\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]/;
const cjkSegments = /([\u3000-\u303f\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]+)/g;

function Text({ children, ...props }: PropsWithChildren<TextProps>) {
  if (typeof children !== "string") return <PdfText {...props}>{children}</PdfText>;
  return (
    <PdfText {...props}>
      {children.split(cjkSegments).map((part, index) =>
        cjkPattern.test(part) ? (
          <PdfText key={index} style={{ fontFamily: "DocCJK" }}>
            {part}
          </PdfText>
        ) : (
          part
        ),
      )}
    </PdfText>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingHorizontal: 36,
    paddingBottom: 38,
    fontSize: 8,
    color: "#172033",
    lineHeight: 1.45,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 14,
    borderBottomWidth: 1.5,
  },
  company: { flexDirection: "row", width: "58%", gap: 9 },
  logo: { width: 82, height: 28, objectFit: "contain" },
  logoPlaceholder: {
    width: 34,
    height: 34,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 700,
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: { fontSize: 11, fontWeight: 700, marginBottom: 4 },
  muted: { color: "#64748B", fontSize: 7 },
  title: { fontSize: 17, fontWeight: 700, textAlign: "right", maxWidth: "40%" },
  meta: { flexDirection: "row", gap: 24, paddingVertical: 12 },
  metaBlock: { minWidth: 105 },
  label: {
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 0.45,
    marginBottom: 3,
  },
  metaValue: { fontSize: 9, fontWeight: 700 },
  customer: { padding: 11, marginBottom: 14, borderRadius: 3 },
  customerName: { fontSize: 10, fontWeight: 700, marginBottom: 3 },
  table: { borderWidth: 0.7, borderColor: "#CBD5E1" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#E2E8F0",
    minHeight: 36,
    alignItems: "stretch",
  },
  tableHead: { minHeight: 28 },
  cell: {
    paddingHorizontal: 5,
    paddingVertical: 6,
    borderRightWidth: 0.5,
    borderColor: "#E2E8F0",
    fontSize: 7,
  },
  cellLast: { borderRightWidth: 0 },
  cellHead: { fontSize: 6, fontWeight: 700 },
  itemName: { fontSize: 7.5, fontWeight: 700, marginBottom: 2 },
  itemDesc: { fontSize: 6.3, color: "#64748B" },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: "auto",
    width: 215,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  totalLabel: { fontSize: 8, fontWeight: 700 },
  totalValue: { fontSize: 13, fontWeight: 700 },
  terms: { marginTop: 14, gap: 10 },
  termBlock: { marginBottom: 4 },
  termTitle: { fontSize: 7, fontWeight: 700, marginBottom: 3 },
  termText: { fontSize: 7, color: "#475569" },
  signature: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    minHeight: 55,
  },
  signatureInner: { width: 160, gap: 18 },
  signatureLine: { borderBottomWidth: 0.7, borderColor: "#64748B" },
  stamp: { width: 68, height: 68, objectFit: "contain", marginLeft: 20 },
  pageNumber: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    fontSize: 6.5,
    color: "#64748B",
    textAlign: "center",
  },
});

function TradePdfDocument({ doc }: { doc: TradeDocument }) {
  if (isSpecialDocumentType(doc.type)) return <SpecialPdfDocument doc={doc} />;
  const theme = getTheme(doc.themeId);
  const t = paperText(doc.language);
  const pages = paginateItems(doc);
  const rtl = doc.language === "ar";
  const fontFamily = doc.language === "ar" ? "DocArabic" : "DocCJK";
  const align = rtl ? ("right" as const) : ("left" as const);
  const companyName = doc.language === "zh-CN" ? doc.companySnapshot.nameZh : doc.companySnapshot.nameEn;
  const customer = doc.customerSnapshot;
  const priceColumns = doc.type !== "packing" || doc.showPrices;

  return (
    <Document title={`${doc.number} ${documentTitle(doc.type, doc.language)}`} author={doc.companySnapshot.nameEn} language={doc.language}>
      {pages.map((items, pageIndex) => (
        <Page key={pageIndex} size="A4" style={[styles.page, { fontFamily }]}>
          <View
            style={[
              styles.header,
              {
                borderBottomColor: theme.color,
                flexDirection: rtl ? "row-reverse" : "row",
              },
            ]}
          >
            <View style={[styles.company, { flexDirection: rtl ? "row-reverse" : "row" }]}>
              {doc.companySnapshot.logo ? (
                <Image src={doc.companySnapshot.logo} style={styles.logo} />
              ) : (
                <View style={[styles.logoPlaceholder, { backgroundColor: theme.color }]}>
                  <Text>Q</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.companyName, { textAlign: align }]}>{companyName}</Text>
                {doc.companySnapshot.address && <Text style={[styles.muted, { textAlign: align }]}>{doc.companySnapshot.address}</Text>}
                {(doc.companySnapshot.phone || doc.companySnapshot.email) && <Text style={[styles.muted, { textAlign: align }]}>{[doc.companySnapshot.phone, doc.companySnapshot.email].filter(Boolean).join(" · ")}</Text>}
              </View>
            </View>
            <Text style={[styles.title, { color: theme.color, textAlign: rtl ? "left" : "right" }]}>{documentTitle(doc.type, doc.language)}</Text>
          </View>

          <View style={[styles.meta, { flexDirection: rtl ? "row-reverse" : "row" }]}>
            <View style={styles.metaBlock}>
              <Text style={[styles.label, { color: theme.color, textAlign: align }]}>{t.number}</Text>
              <Text style={[styles.metaValue, { textAlign: align }]}>{doc.number}</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={[styles.label, { color: theme.color, textAlign: align }]}>{t.date}</Text>
              <Text style={[styles.metaValue, { textAlign: align }]}>{formatDate(doc.issueDate, doc.language)}</Text>
            </View>
            {doc.type === "quotation" && (
              <View style={styles.metaBlock}>
                <Text style={[styles.label, { color: theme.color, textAlign: align }]}>{t.validUntil}</Text>
                <Text style={[styles.metaValue, { textAlign: align }]}>{formatDate(doc.validUntil, doc.language)}</Text>
              </View>
            )}
          </View>

          <View style={[styles.customer, { backgroundColor: theme.pale }]}>
            <Text style={[styles.label, { color: theme.color, textAlign: align }]}>{t.billTo}</Text>
            {customer ? (
              <>
                <Text style={[styles.customerName, { textAlign: align }]}>{customer.name}</Text>
                <Text style={[styles.muted, { textAlign: align }]}>
                  {customer.contact} · {customer.email}
                </Text>
                <Text style={[styles.muted, { textAlign: align }]}>{customer.billingAddress}</Text>
                <Text style={[styles.muted, { textAlign: align }]}>{customer.registration}</Text>
              </>
            ) : (
              <Text>—</Text>
            )}
          </View>

          <View style={styles.table}>
            <View
              style={[
                styles.tableRow,
                styles.tableHead,
                {
                  backgroundColor: theme.pale,
                  flexDirection: rtl ? "row-reverse" : "row",
                },
              ]}
            >
              <PdfCell text={t.item} width="7%" head color={theme.color} align={align} />
              <PdfCell text={t.description} width={priceColumns ? "39%" : "37%"} head color={theme.color} align={align} />
              <PdfCell text={t.quantity} width="14%" head color={theme.color} align={align} />
              {priceColumns ? (
                <>
                  <PdfCell text={t.unitPrice} width="19%" head color={theme.color} align={align} />
                  <PdfCell text={t.amount} width="21%" head color={theme.color} align={align} last />
                </>
              ) : (
                <>
                  <PdfCell text={t.packages} width="10%" head color={theme.color} align={align} />
                  <PdfCell text={t.netWeight} width="12%" head color={theme.color} align={align} />
                  <PdfCell text={t.grossWeight} width="12%" head color={theme.color} align={align} />
                  <PdfCell text={t.measurement} width="12%" head color={theme.color} align={align} last />
                </>
              )}
            </View>
            {items.map((item, index) => (
              <View key={item.id} style={[styles.tableRow, { flexDirection: rtl ? "row-reverse" : "row" }]}>
                <PdfCell text={String(pageIndex * (doc.type === "packing" ? 6 : 5) + index + 1)} width="7%" align={align} />
                <View
                  style={[
                    styles.cell,
                    {
                      width: priceColumns ? "39%" : "37%",
                      flexDirection: "row",
                      gap: 4,
                    },
                  ]}
                >
                  {doc.showImages && item.image && <Image src={item.image} style={{ width: 25, height: 25, objectFit: "cover" }} />}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, { textAlign: align }]}>{doc.language === "zh-CN" ? item.nameZh || item.name : item.name}</Text>
                    <Text style={[styles.itemDesc, { textAlign: align }]}>
                      {item.sku} · {item.description}
                    </Text>
                  </View>
                </View>
                <PdfCell text={`${formatNumber(item.quantity, doc.language)} ${item.unit}`} width="14%" align={align} />
                {priceColumns ? (
                  <>
                    <PdfCell text={formatMoney(item.unitPrice, doc.currency, doc.language)} width="19%" align={align} />
                    <PdfCell text={formatMoney(item.quantity * item.unitPrice, doc.currency, doc.language)} width="21%" align={align} last />
                  </>
                ) : (
                  <>
                    <PdfCell text={formatNumber(item.packageCount, doc.language, 0)} width="10%" align={align} />
                    <PdfCell text={formatNumber(item.netWeight, doc.language)} width="12%" align={align} />
                    <PdfCell text={formatNumber(item.grossWeight, doc.language)} width="12%" align={align} />
                    <PdfCell text={formatNumber(item.measurements, doc.language, 3)} width="12%" align={align} last />
                  </>
                )}
              </View>
            ))}
          </View>

          {pageIndex === pages.length - 1 && (
            <View>
              <View
                style={[
                  styles.total,
                  {
                    width: priceColumns ? 215 : 340,
                    gap: 12,
                    borderBottomColor: theme.color,
                    flexDirection: rtl ? "row-reverse" : "row",
                  },
                ]}
              >
                <Text style={[styles.totalLabel, { color: theme.color, flexShrink: 0 }]}>{t.total}</Text>
                <Text
                  style={[
                    styles.totalValue,
                    {
                      color: theme.color,
                      fontSize: priceColumns ? 13 : 11,
                      textAlign: rtl ? "left" : "right",
                    },
                  ]}
                >
                  {priceColumns
                    ? formatMoney(documentTotal(doc), doc.currency, doc.language)
                    : `${formatNumber(
                        doc.items.reduce((s, i) => s + i.packageCount, 0),
                        doc.language,
                        0,
                      )} ${t.packages} · ${formatNumber(
                        doc.items.reduce((s, i) => s + i.grossWeight, 0),
                        doc.language,
                      )} KG`}
                </Text>
              </View>
              <View style={styles.terms}>
                {doc.incoterm && (
                  <View style={styles.termBlock}>
                    <Text style={[styles.termTitle, { color: theme.color, textAlign: align }]}>{t.trade}</Text>
                    <Text style={[styles.termText, { textAlign: align }]}>{doc.incoterm}</Text>
                    <Text style={[styles.termText, { textAlign: align }]}>
                      {t.origin}: {doc.origin || "—"} · {t.destination}: {doc.destination || "—"}
                    </Text>
                  </View>
                )}
                {(doc.type === "proforma" || doc.type === "contract" || doc.type === "quotation") && (
                  <View style={styles.termBlock}>
                    <Text style={[styles.termTitle, { color: theme.color, textAlign: align }]}>{t.payment}</Text>
                    <Text style={[styles.termText, { textAlign: align }]}>{doc.paymentTerms || "—"}</Text>
                  </View>
                )}
                {doc.type === "contract" && (
                  <View style={styles.termBlock}>
                    <Text style={[styles.termTitle, { color: theme.color, textAlign: align }]}>{t.terms}</Text>
                    <Text style={[styles.termText, { textAlign: align }]}>{doc.contractTerms}</Text>
                  </View>
                )}
                {doc.type === "packing" && doc.shippingMarks && (
                  <View style={styles.termBlock}>
                    <Text style={[styles.termTitle, { color: theme.color, textAlign: align }]}>{t.marks}</Text>
                    <Text style={[styles.termText, { textAlign: align }]}>{doc.shippingMarks}</Text>
                  </View>
                )}
                {doc.showBankInfo && (
                  <View style={styles.termBlock}>
                    <Text style={[styles.termTitle, { color: theme.color, textAlign: align }]}>{t.bank}</Text>
                    <Text style={[styles.termText, { textAlign: align }]}>{doc.companySnapshot.bankName}</Text>
                    <Text style={[styles.termText, { textAlign: align }]}>
                      A/C: {doc.companySnapshot.bankAccount} · SWIFT: {doc.companySnapshot.swift}
                    </Text>
                  </View>
                )}
                {doc.notes && (
                  <View style={styles.termBlock}>
                    <Text style={[styles.termTitle, { color: theme.color, textAlign: align }]}>{t.notes}</Text>
                    <Text style={[styles.termText, { textAlign: align }]}>{doc.notes}</Text>
                  </View>
                )}
              </View>
              <View style={styles.signature}>
                <View style={styles.signatureInner}>
                  <Text style={[styles.label, { color: theme.color }]}>{t.signature}</Text>
                  <View style={styles.signatureLine} />
                </View>
                {doc.showStamp && doc.companySnapshot.stamp && <Image src={doc.companySnapshot.stamp} style={styles.stamp} />}
              </View>
            </View>
          )}
          <Text style={styles.pageNumber}>
            {doc.number} · {pageIndex + 1} / {pages.length}
          </Text>
        </Page>
      ))}
    </Document>
  );
}

function PdfCell({ text, width, head = false, color, align, last = false }: { text: string; width: string; head?: boolean; color?: string; align: "left" | "right"; last?: boolean }) {
  return (
    <View style={[styles.cell, { width }, ...(last ? [styles.cellLast] : [])]}>
      <Text style={[...(head ? [styles.cellHead] : []), { color, textAlign: align }]}>{text}</Text>
    </View>
  );
}

export async function downloadDocumentPdf(doc: TradeDocument) {
  const blob = await pdf(<TradePdfDocument doc={doc} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const typeName = documentTitle(doc.type, doc.language).replace(/\s+/g, "-");
  const customer = (doc.customerSnapshot?.name ?? "No-Customer").replace(/[^a-zA-Z0-9\u4e00-\u9fff-]/g, "-").slice(0, 40);
  link.href = url;
  link.download = `${typeName}_${doc.number}_${customer}_${doc.language}.pdf`.replace(/[\\/:*?"<>|]/g, "-");
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
