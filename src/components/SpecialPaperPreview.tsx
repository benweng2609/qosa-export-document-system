import { forwardRef } from "react";
import { formatDate, formatNumber, getTheme } from "../data";
import { buildSpecialPages, getContainerVgmKg } from "../export-forms";
import { documentTitle } from "../i18n";
import type { EditorSection, ShippingParty, TradeDocument } from "../types";

interface Props {
  doc: TradeDocument;
  zoom?: number;
  onSection?: (section: EditorSection) => void;
  fullScreen?: boolean;
}

function Value({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="special-value">
      <span>{label}</span>
      <strong>{value === "" || value === undefined ? "—" : value}</strong>
    </div>
  );
}

function Party({ title, party }: { title: string; party: ShippingParty }) {
  return (
    <div className="special-party">
      <span>{title}</span>
      <strong>{party.name || "—"}</strong>
      <p>{party.address || "—"}</p>
      {(party.reference || party.contact) && <small>{[party.contact, party.reference].filter(Boolean).join(" · ")}</small>}
    </div>
  );
}

function BlockTitle({ children }: { children: string }) {
  return <h3 className="special-block-title">{children}</h3>;
}

export const SpecialPaperPreview = forwardRef<HTMLDivElement, Props>(function SpecialPaperPreview({ doc, zoom = 1, onSection, fullScreen = false }, ref) {
  const theme = getTheme(doc.themeId);
  const pages = buildSpecialPages(doc);
  const shipping = doc.shipping!;
  const parties = doc.shippingParties!;
  const isPreparation = doc.type === "ams" || doc.type === "isf";
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
      {pages.map((page, pageIndex) => (
        <div className="paper-transform" key={pageIndex} style={{ width: 794 * zoom, minHeight: 1123 * zoom }}>
          <article
            className="a4-paper special-paper"
            style={{ transform: `scale(${zoom})`, "--doc-color": theme.color, "--doc-pale": theme.pale } as React.CSSProperties}
            aria-label={`${doc.number} 第 ${pageIndex + 1} 页预览`}
          >
            <header className="paper-header" {...clickable("parties")}>
              <div className="paper-company">
                {doc.companySnapshot.logo ? <img className="paper-logo" src={doc.companySnapshot.logo} alt="公司 LOGO" /> : <div className="paper-logo-placeholder">Q</div>}
                <div>
                  <h2>{doc.language === "zh-CN" ? doc.companySnapshot.nameZh : doc.companySnapshot.nameEn}</h2>
                  {doc.companySnapshot.address && <p>{doc.companySnapshot.address}</p>}
                  {(doc.companySnapshot.phone || doc.companySnapshot.email) && <p>{[doc.companySnapshot.phone, doc.companySnapshot.email].filter(Boolean).join(" · ")}</p>}
                </div>
              </div>
              <h1>{documentTitle(doc.type, doc.language)}</h1>
            </header>

            <section className="paper-meta special-meta" {...clickable("basic")}>
              <div><span>DOCUMENT NO.</span><strong>{doc.number}</strong></div>
              <div><span>ISSUE DATE</span><strong>{formatDate(doc.issueDate, doc.language)}</strong></div>
              <div><span>BOOKING NO.</span><strong>{shipping.bookingNumber || "—"}</strong></div>
              {pageIndex > 0 && <div><span>PAGE</span><strong>CONTINUATION</strong></div>}
            </section>

            {isPreparation && pageIndex === 0 && (
              <div className="special-preparation-banner">PREPARATION DOCUMENT · NOT PROOF OF CUSTOMS FILING / 申报资料准备稿，非申报回执</div>
            )}

            {page.overview && (
              <>
                <section className="special-section" {...clickable("parties")}>
                  <BlockTitle>TRANSPORT PARTIES / 运输相关方</BlockTitle>
                  <div className="special-party-grid">
                    <Party title="SHIPPER / 托运人" party={parties.shipper} />
                    <Party title="CONSIGNEE / 收货人" party={parties.consignee} />
                    {doc.type !== "vgm" && <Party title="NOTIFY PARTY / 通知方" party={parties.notifyParty} />}
                  </div>
                  {doc.type === "isf" && doc.isf && (
                    <div className="special-party-grid isf-party-grid">
                      <Party title="SELLER / 卖方" party={doc.isf.seller} />
                      <Party title="BUYER / 买方" party={doc.isf.buyer} />
                      <Party title="MANUFACTURER / SUPPLIER" party={doc.isf.manufacturer} />
                      <Party title="SHIP TO PARTY" party={doc.isf.shipToParty} />
                      <Party title="CONTAINER STUFFING LOCATION" party={doc.isf.stuffingLocation} />
                      <Party title="CONSOLIDATOR / 拼箱方" party={doc.isf.consolidator} />
                    </div>
                  )}
                </section>
                <section className="special-section" {...clickable("shipping")}>
                  <BlockTitle>SHIPMENT & ROUTING / 船运与港口</BlockTitle>
                  <div className="special-value-grid">
                    <Value label="MASTER B/L" value={shipping.masterBillNumber} />
                    <Value label="HOUSE B/L" value={shipping.houseBillNumber} />
                    <Value label="CARRIER" value={shipping.carrierName} />
                    {(doc.type === "ams" || doc.type === "isf") && <Value label="CARRIER SCAC" value={shipping.carrierScac} />}
                    <Value label="VESSEL" value={shipping.vesselName} />
                    <Value label="VOYAGE" value={shipping.voyageNumber} />
                    <Value label="PLACE OF RECEIPT" value={shipping.placeOfReceipt} />
                    <Value label="PORT OF LOADING" value={shipping.portOfLoading} />
                    <Value label="PORT OF DISCHARGE" value={shipping.portOfDischarge} />
                    <Value label="PLACE OF DELIVERY" value={shipping.placeOfDelivery} />
                    {doc.type === "ams" && <Value label="LAST FOREIGN PORT" value={shipping.lastForeignPort} />}
                    <Value label="ETD" value={shipping.etd} />
                    <Value label="ETA" value={shipping.eta} />
                    <Value label="FREIGHT TERMS" value={shipping.freightTerms} />
                  </div>
                </section>
              </>
            )}

            {page.cargo && doc.type !== "vgm" && (
              <section className="special-section special-cargo" {...clickable("items")}>
                <BlockTitle>CARGO DETAILS / 货物明细</BlockTitle>
                <table className="special-table">
                  <thead><tr><th>NO.</th><th>DESCRIPTION</th><th>PACKAGES</th><th>GROSS KG</th><th>VOLUME M³</th><th>HS / ORIGIN</th></tr></thead>
                  <tbody>
                    {page.items.length ? page.items.map((item, index) => (
                      <tr key={item.id}>
                        <td>{page.itemOffset + index + 1}</td>
                        <td><strong>{item.name || item.nameZh}</strong><small>{item.description || item.sku}</small></td>
                        <td>{formatNumber(item.packageCount, doc.language, 0)}</td>
                        <td>{formatNumber(item.grossWeight, doc.language)}</td>
                        <td>{formatNumber(item.measurements, doc.language, 3)}</td>
                        <td>{item.hsCode || "—"}<small>{item.originCountry || ""}</small></td>
                      </tr>
                    )) : <tr><td colSpan={6} className="special-empty">—</td></tr>}
                  </tbody>
                </table>
              </section>
            )}

            {page.cargo && (doc.type === "vgm" || page.containers.length > 0 || !(doc.containers ?? []).length) && (
              <section className="special-section" {...clickable("containers")}>
                <BlockTitle>{doc.type === "vgm" ? "CONTAINER VERIFIED GROSS MASS / 集装箱核实总重" : "CONTAINERS / 集装箱资料"}</BlockTitle>
                {doc.type === "vgm" ? (
                  <div className="vgm-paper-list">
                    {page.containers.map((container, index) => (
                      <div className="vgm-paper-row" key={container.id}>
                        <div className="vgm-paper-heading"><strong>{page.containerOffset + index + 1}. {container.containerNumber || "—"}</strong><span>{container.sizeType} · SEAL: {container.sealNumber || "—"}</span></div>
                        <div className="vgm-paper-calculation">
                          <span>{container.vgmMethod === "method2" ? "METHOD 2" : "METHOD 1"}</span>
                          <p>{container.vgmMethod === "method2"
                            ? `${container.cargoWeightKg ?? 0} cargo + ${container.packagingWeightKg ?? 0} packing + ${container.dunnageWeightKg ?? 0} dunnage + ${container.tareWeightKg ?? 0} tare`
                            : "Weighed packed and sealed container"}</p>
                          <strong>{getContainerVgmKg(container).toFixed(2)} kg</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="special-table container-table">
                    <thead><tr><th>CONTAINER NO.</th><th>SEAL NO.</th><th>TYPE</th><th>PACKAGES</th><th>GROSS KG</th><th>VOLUME M³</th></tr></thead>
                    <tbody>{page.containers.length ? page.containers.map((container) => (
                      <tr key={container.id}><td>{container.containerNumber || "—"}</td><td>{container.sealNumber || "—"}</td><td>{container.sizeType}</td><td>{container.packageCount} {container.packageType}</td><td>{container.grossWeightKg}</td><td>{container.volumeCbm}</td></tr>
                    )) : <tr><td colSpan={6} className="special-empty">—</td></tr>}</tbody>
                  </table>
                )}
              </section>
            )}

            {page.tail && (
              <div className="special-tail">
                {doc.type === "ams" && doc.ams && (
                  <section className="special-section" {...clickable("declaration")}>
                    <BlockTitle>AMS REFERENCE DATA / 申报参考要素</BlockTitle>
                    <div className="special-value-grid"><Value label="SHIPMENT TYPE" value={doc.ams.shipmentType} /><Value label="CARGO CONTROL NO." value={doc.ams.cargoControlNumber} /><Value label="IN-BOND NO." value={doc.ams.inBondNumber} /><Value label="ENTRY NO." value={doc.ams.entryNumber} /></div>
                  </section>
                )}
                {doc.type === "isf" && doc.isf && (
                  <section className="special-section" {...clickable("declaration")}>
                    <BlockTitle>ISF IMPORTER DATA / 进口方申报要素</BlockTitle>
                    <div className="special-value-grid"><Value label="IMPORTER OF RECORD NO." value={doc.isf.importerOfRecordNumber} /><Value label="CONSIGNEE NO." value={doc.isf.consigneeNumber} /><Value label="HTSUS NO." value={doc.isf.htsusNumber} /><Value label="COUNTRY OF ORIGIN" value={doc.isf.countryOfOrigin} /></div>
                  </section>
                )}
                {doc.type === "si" && doc.si && (
                  <section className="special-section" {...clickable("declaration")}>
                    <BlockTitle>B/L & RELEASE INSTRUCTIONS / 提单与放单要求</BlockTitle>
                    <div className="special-value-grid"><Value label="RELEASE TYPE" value={doc.si.releaseType} /><Value label="ORIGINAL B/L COUNT" value={doc.si.originalBillCount} /><Value label="FREIGHT PAYABLE AT" value={doc.si.freightPayableAt} /></div>
                    {doc.si.alsoNotifyParty.name && <Party title="ALSO NOTIFY PARTY" party={doc.si.alsoNotifyParty} />}
                    {doc.si.documentInstructions && <p className="special-instruction">{doc.si.documentInstructions}</p>}
                    {doc.si.specialInstructions && <p className="special-instruction">{doc.si.specialInstructions}</p>}
                  </section>
                )}
                {doc.shippingMarks && <section className="special-section" {...clickable(doc.type === "vgm" ? "shipping" : "declaration")}><BlockTitle>MARKS & NUMBERS / 唛头</BlockTitle><p className="special-instruction">{doc.shippingMarks}</p></section>}
                {doc.notes && <section className="special-section"><BlockTitle>REMARKS / 备注</BlockTitle><p className="special-instruction">{doc.notes}</p></section>}
                {doc.type === "vgm" && doc.vgm && (
                  <section className="special-section vgm-signature-section" {...clickable("signature")}>
                    <BlockTitle>WEIGHING & AUTHORIZATION / 称重与授权</BlockTitle>
                    <div className="special-value-grid"><Value label="WEIGHING DATE" value={doc.vgm.weighingDate} /><Value label="WEIGHING LOCATION" value={doc.vgm.weighingLocation} /><Value label="EQUIPMENT ID" value={doc.vgm.weighingEquipmentId} /><Value label="CERTIFICATE NO." value={doc.vgm.weighingCertificateNumber} /></div>
                    <div className="vgm-authorization"><div><span>AUTHORIZED PERSON (CAPITAL LETTERS)</span><strong>{doc.vgm.authorizedPerson || "—"}</strong><small>{doc.vgm.authorizedPersonTitle}</small></div><div><span>SIGNATURE / DATE</span><i /><strong>{doc.vgm.signatureDate || "—"}</strong></div></div>
                  </section>
                )}
                {doc.showStamp && doc.companySnapshot.stamp && <img className="special-stamp" src={doc.companySnapshot.stamp} alt="电子印章图像" />}
              </div>
            )}
            <div className="paper-page-number">{doc.number} · {pageIndex + 1} / {pages.length}</div>
          </article>
        </div>
      ))}
    </div>
  );
});
