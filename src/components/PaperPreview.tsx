import { forwardRef } from "react";
import { documentTotal, formatDate, formatMoney, formatNumber, getTheme } from "../data";
import { documentTitle, paperText } from "../i18n";
import { paginateItems } from "../document-utils";
import type { EditorSection, TradeDocument } from "../types";

interface PaperPreviewProps {
  doc: TradeDocument;
  zoom?: number;
  onSection?: (section: EditorSection) => void;
  fullScreen?: boolean;
}

export const PaperPreview = forwardRef<HTMLDivElement, PaperPreviewProps>(function PaperPreview({ doc, zoom = 1, onSection, fullScreen = false }, ref) {
  const theme = getTheme(doc.themeId);
  const t = paperText(doc.language);
  const pages = paginateItems(doc);
  const isRtl = doc.language === "ar";
  const companyName = doc.language === "zh-CN" ? doc.companySnapshot.nameZh : doc.companySnapshot.nameEn;
  const customer = doc.customerSnapshot;
  const priceColumns = doc.type !== "packing" || doc.showPrices;
  const clickable = (section: EditorSection) =>
    onSection
      ? {
          role: "button" as const,
          tabIndex: 0,
          onClick: () => onSection(section),
          onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") onSection(section);
          },
        }
      : {};

  return (
    <div ref={ref} className={`paper-pages ${fullScreen ? "paper-pages-full" : ""}`} style={{ "--paper-scale": zoom } as React.CSSProperties}>
      {pages.map((items, pageIndex) => (
        <div className="paper-transform" key={pageIndex} style={{ width: 794 * zoom, minHeight: 1123 * zoom }}>
          <article
            className="a4-paper"
            dir={isRtl ? "rtl" : "ltr"}
            style={
              {
                transform: `scale(${zoom})`,
                "--doc-color": theme.color,
                "--doc-pale": theme.pale,
              } as React.CSSProperties
            }
            aria-label={`${doc.number} 第 ${pageIndex + 1} 页预览`}
          >
            <header className="paper-header" {...clickable("parties")}>
              <div className="paper-company">
                {doc.companySnapshot.logo ? <img className="paper-logo" src={doc.companySnapshot.logo} alt="公司 LOGO" /> : <div className="paper-logo-placeholder">Q</div>}
                <div>
                  <h2>{companyName}</h2>
                  {doc.companySnapshot.address && <p>{doc.companySnapshot.address}</p>}
                  {(doc.companySnapshot.phone || doc.companySnapshot.email) && <p>{[doc.companySnapshot.phone, doc.companySnapshot.email].filter(Boolean).join(" · ")}</p>}
                </div>
              </div>
              <h1>{documentTitle(doc.type, doc.language)}</h1>
            </header>

            <section className="paper-meta" {...clickable("basic")}>
              <div>
                <span>{t.number}</span>
                <strong>{doc.number}</strong>
              </div>
              <div>
                <span>{t.date}</span>
                <strong>{formatDate(doc.issueDate, doc.language)}</strong>
              </div>
              {doc.type === "quotation" && (
                <div>
                  <span>{t.validUntil}</span>
                  <strong>{formatDate(doc.validUntil, doc.language)}</strong>
                </div>
              )}
            </section>

            <section className="paper-customer" {...clickable("parties")}>
              <span>{t.billTo}</span>
              {customer ? (
                <>
                  <strong>{customer.name}</strong>
                  <p>
                    {customer.contact} · {customer.email}
                  </p>
                  <p>{customer.billingAddress}</p>
                  <p>{customer.registration}</p>
                </>
              ) : (
                <p className="paper-missing">—</p>
              )}
            </section>

            <section className="paper-items" {...clickable("items")}>
              <table>
                <thead>
                  <tr>
                    <th>{t.item}</th>
                    <th>{t.description}</th>
                    <th>{t.quantity}</th>
                    {!priceColumns ? (
                      <>
                        <th>{t.packages}</th>
                        <th>{t.netWeight}</th>
                        <th>{t.grossWeight}</th>
                        <th>{t.measurement}</th>
                      </>
                    ) : (
                      <>
                        <th>{t.unitPrice}</th>
                        <th>{t.amount}</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.length ? (
                    items.map((item, index) => (
                      <tr key={item.id}>
                        <td>{pageIndex * (doc.type === "packing" ? 6 : 5) + index + 1}</td>
                        <td>
                          <div className="paper-product-cell">
                            {doc.showImages && item.image && <img src={item.image} alt="" />}
                            <div>
                              <strong>{doc.language === "zh-CN" ? item.nameZh || item.name : item.name}</strong>
                              <small>
                                {item.sku} · {item.description}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          {formatNumber(item.quantity, doc.language)} {item.unit}
                        </td>
                        {!priceColumns ? (
                          <>
                            <td>{formatNumber(item.packageCount, doc.language, 0)}</td>
                            <td>{formatNumber(item.netWeight, doc.language)}</td>
                            <td>{formatNumber(item.grossWeight, doc.language)}</td>
                            <td>{formatNumber(item.measurements, doc.language, 3)}</td>
                          </>
                        ) : (
                          <>
                            <td>{formatMoney(item.unitPrice, doc.currency, doc.language)}</td>
                            <td>{formatMoney(item.quantity * item.unitPrice, doc.currency, doc.language)}</td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={!priceColumns ? 7 : 5} className="paper-empty-row">
                        —
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {pageIndex === pages.length - 1 && (
              <div className="paper-tail">
                {priceColumns && (
                  <section className="paper-total" {...clickable("items")}>
                    <span>{t.total}</span>
                    <strong>{formatMoney(documentTotal(doc), doc.currency, doc.language)}</strong>
                  </section>
                )}
                {!priceColumns && (
                  <section className="paper-total" {...clickable("items")}>
                    <span>{t.total}</span>
                    <strong>
                      {formatNumber(
                        doc.items.reduce((s, i) => s + i.packageCount, 0),
                        doc.language,
                        0,
                      )}{" "}
                      {t.packages} ·{" "}
                      {formatNumber(
                        doc.items.reduce((s, i) => s + i.grossWeight, 0),
                        doc.language,
                      )}{" "}
                      KG
                    </strong>
                  </section>
                )}
                <section className="paper-terms" {...clickable("terms")}>
                  {doc.incoterm && (
                    <div>
                      <h3>{t.trade}</h3>
                      <p>{doc.incoterm}</p>
                      <p>
                        {t.origin}: {doc.origin || "—"} &nbsp; · &nbsp; {t.destination}: {doc.destination || "—"}
                      </p>
                    </div>
                  )}
                  {(doc.type === "proforma" || doc.type === "contract" || (doc.type === "quotation" && doc.paymentTerms)) && (
                    <div>
                      <h3>{t.payment}</h3>
                      <p>{doc.paymentTerms || "—"}</p>
                    </div>
                  )}
                  {doc.type === "contract" && (
                    <div>
                      <h3>{t.terms}</h3>
                      <p>{doc.contractTerms}</p>
                    </div>
                  )}
                  {doc.type === "packing" && doc.shippingMarks && (
                    <div>
                      <h3>{t.marks}</h3>
                      <p>{doc.shippingMarks}</p>
                    </div>
                  )}
                  {doc.showBankInfo && (
                    <div>
                      <h3>{t.bank}</h3>
                      <p>{doc.companySnapshot.bankName}</p>
                      <p>
                        A/C: {doc.companySnapshot.bankAccount} · SWIFT: {doc.companySnapshot.swift}
                      </p>
                    </div>
                  )}
                  {doc.notes && (
                    <div>
                      <h3>{t.notes}</h3>
                      <p>{doc.notes}</p>
                    </div>
                  )}
                </section>
                <footer className="paper-signature" {...clickable("layout")}>
                  <div>
                    <span>{t.signature}</span>
                    <i />
                  </div>
                  {doc.showStamp && doc.companySnapshot.stamp && <img src={doc.companySnapshot.stamp} alt="电子印章" />}
                </footer>
              </div>
            )}
            <div className="paper-page-number">
              {doc.number} · {pageIndex + 1} / {pages.length}
            </div>
          </article>
        </div>
      ))}
    </div>
  );
});
