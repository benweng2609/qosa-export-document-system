import { Info, PackagePlus, Plus, Scale, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Field, IconButton, Input, Select, Textarea } from "../components/ui";
import { createEmptyContainer, getContainerVgmKg, partyFromCompany, partyFromCustomer } from "../export-forms";
import { useStore } from "../store";
import type { ShippingContainer, ShippingParty, TradeDocument } from "../types";

export type ChangeDocument = (recipe: (previous: TradeDocument) => TradeDocument) => void;

function Heading({ title, description }: { title: string; description: string }) {
  return (
    <div className="editor-section-heading">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function PreparationNote({ children }: { children: string }) {
  return (
    <div className="form-note">
      <Info size={16} />
      <p>{children}</p>
    </div>
  );
}

function PartyFields({ party, onChange, required = false }: { party: ShippingParty; onChange: (party: ShippingParty) => void; required?: boolean }) {
  const update = (key: keyof ShippingParty, value: string) => onChange({ ...party, [key]: value });
  return (
    <div className="party-fields">
      <Field label="名称" required={required}>
        <Input value={party.name} onChange={(event) => update("name", event.target.value)} />
      </Field>
      <Field label="地址">
        <Textarea rows={2} value={party.address} onChange={(event) => update("address", event.target.value)} />
      </Field>
      <div className="form-grid two">
        <Field label="联系人">
          <Input value={party.contact} onChange={(event) => update("contact", event.target.value)} />
        </Field>
        <Field label="识别号 / 税号">
          <Input value={party.reference} onChange={(event) => update("reference", event.target.value)} />
        </Field>
        <Field label="电话">
          <Input value={party.phone} onChange={(event) => update("phone", event.target.value)} />
        </Field>
        <Field label="邮箱">
          <Input value={party.email} onChange={(event) => update("email", event.target.value)} />
        </Field>
      </div>
    </div>
  );
}

export function SpecialPartiesSection({ draft, change }: { draft: TradeDocument; change: ChangeDocument }) {
  const { data } = useStore();
  const parties = draft.shippingParties!;
  const updateParty = (key: "shipper" | "consignee" | "notifyParty", party: ShippingParty) =>
    change((previous) => ({ ...previous, shippingParties: { ...previous.shippingParties!, [key]: party } }));
  const updateIsfParty = (key: "seller" | "buyer" | "manufacturer" | "shipToParty" | "stuffingLocation" | "consolidator", party: ShippingParty) =>
    change((previous) => ({ ...previous, isf: { ...previous.isf!, [key]: party } }));

  return (
    <section className="editor-section">
      <Heading title="申报与运输相关方" description="资料仅保存在当前单证；从资料库带入后仍可逐字段调整。" />
      <div className="subsection-heading">
        <h3>托运人 / Shipper</h3>
        <Button size="sm" variant="ghost" onClick={() => updateParty("shipper", partyFromCompany(data.company))}>使用公司库资料</Button>
      </div>
      <PartyFields party={parties.shipper} onChange={(party) => updateParty("shipper", party)} required />
      <div className="section-divider" />
      <div className="subsection-heading">
        <h3>收货人 / Consignee</h3>
        <Select
          value=""
          onChange={(event) => {
            const customer = data.customers.find((item) => item.id === event.target.value);
            if (customer) updateParty("consignee", partyFromCustomer(customer));
          }}
          aria-label="从客户库带入收货人"
        >
          <option value="">从客户库带入…</option>
          {data.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
        </Select>
      </div>
      <PartyFields party={parties.consignee} onChange={(party) => updateParty("consignee", party)} required={draft.type !== "vgm"} />
      {draft.type !== "vgm" && (
        <>
          <div className="section-divider" />
          <h3 className="party-subheading">通知方 / Notify Party</h3>
          <PartyFields party={parties.notifyParty} onChange={(party) => updateParty("notifyParty", party)} />
        </>
      )}
      {draft.type === "isf" && draft.isf && (
        <>
          <div className="section-divider" />
          <PreparationNote>以下对应 ISF 进口方资料要素；请按实际交易关系填写，不要用客户库资料替代所有角色。</PreparationNote>
          {([
            ["seller", "卖方 / Seller"],
            ["buyer", "买方 / Buyer"],
            ["manufacturer", "制造商或供应商 / Manufacturer"],
            ["shipToParty", "实际收货方 / Ship To Party"],
            ["stuffingLocation", "装箱地点 / Stuffing Location"],
            ["consolidator", "拼箱方 / Consolidator"],
          ] as const).map(([key, label]) => (
            <div className="isf-party-block" key={key}>
              <h3 className="party-subheading">{label}</h3>
              <PartyFields party={draft.isf![key]} onChange={(party) => updateIsfParty(key, party)} />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export function ShipmentSection({ draft, change }: { draft: TradeDocument; change: ChangeDocument }) {
  const shipping = draft.shipping!;
  const update = (key: keyof typeof shipping, value: string) => change((previous) => ({ ...previous, shipping: { ...previous.shipping!, [key]: value } }));
  return (
    <section className="editor-section">
      <Heading title="船运与港口" description="提单、船名航次和港口资料在 AMS、ISF、VGM、SI 中保持同一结构。" />
      <div className="form-grid two">
        <Field label="订舱号 / Booking No."><Input value={shipping.bookingNumber} onChange={(event) => update("bookingNumber", event.target.value)} /></Field>
        <Field label="主提单号 / Master B/L"><Input value={shipping.masterBillNumber} onChange={(event) => update("masterBillNumber", event.target.value)} /></Field>
        <Field label="分提单号 / House B/L"><Input value={shipping.houseBillNumber} onChange={(event) => update("houseBillNumber", event.target.value)} /></Field>
        <Field label="承运人 / Carrier"><Input value={shipping.carrierName} onChange={(event) => update("carrierName", event.target.value)} /></Field>
        <Field label="承运人 SCAC"><Input value={shipping.carrierScac} onChange={(event) => update("carrierScac", event.target.value.toUpperCase())} /></Field>
        <Field label="船名 / Vessel" required><Input value={shipping.vesselName} onChange={(event) => update("vesselName", event.target.value)} /></Field>
        <Field label="航次 / Voyage" required><Input value={shipping.voyageNumber} onChange={(event) => update("voyageNumber", event.target.value)} /></Field>
        <Field label="收货地 / Place of Receipt"><Input value={shipping.placeOfReceipt} onChange={(event) => update("placeOfReceipt", event.target.value)} /></Field>
        <Field label="装货港 / Port of Loading" required><Input value={shipping.portOfLoading} onChange={(event) => update("portOfLoading", event.target.value)} /></Field>
        <Field label="卸货港 / Port of Discharge" required><Input value={shipping.portOfDischarge} onChange={(event) => update("portOfDischarge", event.target.value)} /></Field>
        <Field label="交货地 / Place of Delivery"><Input value={shipping.placeOfDelivery} onChange={(event) => update("placeOfDelivery", event.target.value)} /></Field>
        {draft.type === "ams" && <Field label="最后外国港 / Last Foreign Port"><Input value={shipping.lastForeignPort} onChange={(event) => update("lastForeignPort", event.target.value)} /></Field>}
        <Field label="预计开航日 / ETD"><Input type="date" value={shipping.etd} onChange={(event) => update("etd", event.target.value)} /></Field>
        <Field label="预计到达日 / ETA"><Input type="date" value={shipping.eta} onChange={(event) => update("eta", event.target.value)} /></Field>
        <Field label="运费条款"><Select value={shipping.freightTerms} onChange={(event) => update("freightTerms", event.target.value)}><option value="">请选择</option><option>PREPAID</option><option>COLLECT</option></Select></Field>
        {(draft.type === "ams" || draft.type === "si") && <Field label="服务合同号"><Input value={shipping.serviceContractNumber} onChange={(event) => update("serviceContractNumber", event.target.value)} /></Field>}
      </div>
    </section>
  );
}

export function DeclarationSection({ draft, change }: { draft: TradeDocument; change: ChangeDocument }) {
  if (draft.type === "ams" && draft.ams) {
    const ams = draft.ams;
    const update = (key: keyof typeof ams, value: string) => change((previous) => ({ ...previous, ams: { ...previous.ams!, [key]: value } }));
    return (
      <section className="editor-section">
        <Heading title="AMS 申报要素" description="整理舱单资料，便于交给承运人或申报服务方核对。" />
        <PreparationNote>本页只生成申报资料单，不连接海关系统，也不表示已经提交或接受申报。</PreparationNote>
        <div className="form-grid two">
          <Field label="运输 / 装载类型"><Select value={ams.shipmentType} onChange={(event) => update("shipmentType", event.target.value)}><option>FCL</option><option>LCL</option><option>BREAK BULK</option><option>BULK</option></Select></Field>
          <Field label="货物控制号"><Input value={ams.cargoControlNumber} onChange={(event) => update("cargoControlNumber", event.target.value)} /></Field>
          <Field label="In-bond 编号（如适用）"><Input value={ams.inBondNumber} onChange={(event) => update("inBondNumber", event.target.value)} /></Field>
          <Field label="Entry 编号（如适用）"><Input value={ams.entryNumber} onChange={(event) => update("entryNumber", event.target.value)} /></Field>
        </div>
        <Field label="唛头与标记"><Textarea rows={4} value={draft.shippingMarks} onChange={(event) => change((previous) => ({ ...previous, shippingMarks: event.target.value }))} /></Field>
        <Field label="内部备注"><Textarea rows={3} value={draft.notes} onChange={(event) => change((previous) => ({ ...previous, notes: event.target.value }))} /></Field>
      </section>
    );
  }

  if (draft.type === "isf" && draft.isf) {
    const isf = draft.isf;
    const update = (key: "importerOfRecordNumber" | "consigneeNumber" | "htsusNumber" | "countryOfOrigin", value: string) =>
      change((previous) => ({ ...previous, isf: { ...previous.isf!, [key]: value } }));
    return (
      <section className="editor-section">
        <Heading title="ISF 10+2 申报要素" description="进口方识别号、税则号和原产国与相关方资料共同组成准备稿。" />
        <PreparationNote>这里只制作资料准备稿，不执行电子申报。提交时限与适用规则请由进口方或其申报代理核对。</PreparationNote>
        <div className="form-grid two">
          <Field label="Importer of Record No." required><Input value={isf.importerOfRecordNumber} onChange={(event) => update("importerOfRecordNumber", event.target.value)} /></Field>
          <Field label="Consignee No." required><Input value={isf.consigneeNumber} onChange={(event) => update("consigneeNumber", event.target.value)} /></Field>
          <Field label="HTSUS No.（汇总）"><Input value={isf.htsusNumber} onChange={(event) => update("htsusNumber", event.target.value)} placeholder="货物行也可分别填写" /></Field>
          <Field label="原产国 / Country of Origin"><Input value={isf.countryOfOrigin} onChange={(event) => update("countryOfOrigin", event.target.value)} placeholder="例如：CN" /></Field>
        </div>
        <Field label="唛头与标记"><Textarea rows={4} value={draft.shippingMarks} onChange={(event) => change((previous) => ({ ...previous, shippingMarks: event.target.value }))} /></Field>
        <Field label="内部备注"><Textarea rows={3} value={draft.notes} onChange={(event) => change((previous) => ({ ...previous, notes: event.target.value }))} /></Field>
      </section>
    );
  }

  if (draft.type === "si" && draft.si) {
    const si = draft.si;
    const update = <K extends keyof typeof si>(key: K, value: (typeof si)[K]) => change((previous) => ({ ...previous, si: { ...previous.si!, [key]: value } }));
    return (
      <section className="editor-section">
        <Heading title="提单与放单要求" description="将补料和放单要求写在同一份准备稿中，交给承运人或货代核对。" />
        <div className="form-grid two">
          <Field label="放单方式"><Select value={si.releaseType} onChange={(event) => update("releaseType", event.target.value)}><option>ORIGINAL B/L</option><option>TELEX RELEASE</option><option>SEAWAY BILL</option></Select></Field>
          <Field label="正本提单份数"><Input type="number" min="0" step="1" value={si.originalBillCount} onChange={(event) => update("originalBillCount", Math.max(0, Number(event.target.value)))} /></Field>
          <Field label="运费支付地"><Input value={si.freightPayableAt} onChange={(event) => update("freightPayableAt", event.target.value)} /></Field>
        </div>
        <h3 className="party-subheading">另通知方 / Also Notify Party</h3>
        <PartyFields party={si.alsoNotifyParty} onChange={(party) => update("alsoNotifyParty", party)} />
        <Field label="提单内容与单证要求"><Textarea rows={4} value={si.documentInstructions} onChange={(event) => update("documentInstructions", event.target.value)} placeholder="例如：提单需显示 HS Code、签发份数等" /></Field>
        <Field label="特殊操作指示"><Textarea rows={4} value={si.specialInstructions} onChange={(event) => update("specialInstructions", event.target.value)} placeholder="温控、危险品、目的港要求等；无则留空" /></Field>
        <Field label="唛头与标记"><Textarea rows={4} value={draft.shippingMarks} onChange={(event) => change((previous) => ({ ...previous, shippingMarks: event.target.value }))} /></Field>
        <Field label="内部备注"><Textarea rows={3} value={draft.notes} onChange={(event) => change((previous) => ({ ...previous, notes: event.target.value }))} /></Field>
      </section>
    );
  }
  return null;
}

export function ContainersSection({ draft, change }: { draft: TradeDocument; change: ChangeDocument }) {
  const containers = draft.containers ?? [];
  const isVgm = draft.type === "vgm";
  const updateContainer = (id: string, key: keyof ShippingContainer, value: string | number) =>
    change((previous) => ({
      ...previous,
      containers: (previous.containers ?? []).map((container) => {
        if (container.id !== id) return container;
        const numericKeys = ["packageCount", "grossWeightKg", "volumeCbm", "weighedGrossMassKg", "tareWeightKg", "cargoWeightKg", "packagingWeightKg", "dunnageWeightKg"];
        return { ...container, [key]: numericKeys.includes(key) ? Math.max(0, Number(value)) : value };
      }),
    }));
  const add = () => {
    change((previous) => ({ ...previous, containers: [...(previous.containers ?? []), createEmptyContainer(isVgm)] }));
    toast.success("已添加集装箱");
  };
  const remove = (id: string) => change((previous) => ({ ...previous, containers: (previous.containers ?? []).filter((container) => container.id !== id) }));

  return (
    <section className="editor-section">
      <Heading title={isVgm ? "集装箱与核实总重" : "集装箱资料"} description={isVgm ? "每个集装箱独立选择称重方法；总重由对应字段自动计算。" : "记录箱号、铅封号、箱型以及箱内货物汇总。"} />
      {isVgm && <PreparationNote>方法一称量装箱并铅封后的整个重箱；方法二将货物、包装、托盘、垫料和加固材料重量与集装箱皮重相加。</PreparationNote>}
      <Button variant="ghost" className="temporary-product" onClick={add}><Plus size={15} />添加集装箱</Button>
      <div className="container-editor-list">
        {containers.map((container, index) => (
          <article className="container-editor" key={container.id}>
            <div className="subsection-heading">
              <h3>集装箱 {String(index + 1).padStart(2, "0")}</h3>
              <IconButton label={`删除集装箱 ${index + 1}`} onClick={() => remove(container.id)}><Trash2 size={15} /></IconButton>
            </div>
            <div className="form-grid three">
              <Field label="箱号" required><Input value={container.containerNumber} onChange={(event) => updateContainer(container.id, "containerNumber", event.target.value.toUpperCase())} placeholder="ABCD1234567" /></Field>
              <Field label="铅封号"><Input value={container.sealNumber} onChange={(event) => updateContainer(container.id, "sealNumber", event.target.value)} /></Field>
              <Field label="箱型"><Select value={container.sizeType} onChange={(event) => updateContainer(container.id, "sizeType", event.target.value)}><option>20GP</option><option>40GP</option><option>40HQ</option><option>45HQ</option><option>20RF</option><option>40RF</option><option>OTHER</option></Select></Field>
              {!isVgm && (
                <>
                  <Field label="件数"><Input type="number" min="0" value={container.packageCount} onChange={(event) => updateContainer(container.id, "packageCount", event.target.value)} /></Field>
                  <Field label="包装种类"><Input value={container.packageType} onChange={(event) => updateContainer(container.id, "packageType", event.target.value)} /></Field>
                  <Field label="毛重（kg）"><Input type="number" min="0" step="0.01" value={container.grossWeightKg} onChange={(event) => updateContainer(container.id, "grossWeightKg", event.target.value)} /></Field>
                  <Field label="体积（m³）"><Input type="number" min="0" step="0.001" value={container.volumeCbm} onChange={(event) => updateContainer(container.id, "volumeCbm", event.target.value)} /></Field>
                </>
              )}
            </div>
            {isVgm && (
              <div className="vgm-method-block">
                <Field label="核实方法" required>
                  <Select value={container.vgmMethod ?? "method1"} onChange={(event) => updateContainer(container.id, "vgmMethod", event.target.value)}>
                    <option value="method1">方法一：称量整个重箱</option>
                    <option value="method2">方法二：货物与材料合计＋皮重</option>
                  </Select>
                </Field>
                {container.vgmMethod === "method2" ? (
                  <div className="form-grid two">
                    <Field label="货物重量（kg）" required><Input type="number" min="0" step="0.01" value={container.cargoWeightKg ?? 0} onChange={(event) => updateContainer(container.id, "cargoWeightKg", event.target.value)} /></Field>
                    <Field label="包装 / 托盘（kg）"><Input type="number" min="0" step="0.01" value={container.packagingWeightKg ?? 0} onChange={(event) => updateContainer(container.id, "packagingWeightKg", event.target.value)} /></Field>
                    <Field label="垫料 / 加固材料（kg）"><Input type="number" min="0" step="0.01" value={container.dunnageWeightKg ?? 0} onChange={(event) => updateContainer(container.id, "dunnageWeightKg", event.target.value)} /></Field>
                    <Field label="集装箱皮重（kg）" required><Input type="number" min="0" step="0.01" value={container.tareWeightKg ?? 0} onChange={(event) => updateContainer(container.id, "tareWeightKg", event.target.value)} /></Field>
                  </div>
                ) : (
                  <Field label="整个重箱称量结果（kg）" required><Input type="number" min="0" step="0.01" value={container.weighedGrossMassKg ?? 0} onChange={(event) => updateContainer(container.id, "weighedGrossMassKg", event.target.value)} /></Field>
                )}
                <div className="vgm-calculated"><Scale size={18} /><span>VERIFIED GROSS MASS</span><strong>{getContainerVgmKg(container).toFixed(2)} kg</strong></div>
              </div>
            )}
          </article>
        ))}
      </div>
      {!containers.length && <div className="inline-empty"><PackagePlus size={24} /><p>尚未添加集装箱。{isVgm ? "VGM 至少需要一个集装箱。" : "可在取得箱号后再补充。"}</p></div>}
    </section>
  );
}

export function VgmSignatureSection({ draft, change }: { draft: TradeDocument; change: ChangeDocument }) {
  const vgm = draft.vgm!;
  const update = (key: keyof typeof vgm, value: string) => change((previous) => ({ ...previous, vgm: { ...previous.vgm!, [key]: value } }));
  return (
    <section className="editor-section">
      <Heading title="称重与授权签署" description="记录实际称重信息和托运人授权人员；本系统不生成称重凭证或官方认证。" />
      <div className="form-grid two">
        <Field label="称重日期" required><Input type="date" value={vgm.weighingDate} onChange={(event) => update("weighingDate", event.target.value)} /></Field>
        <Field label="称重地点"><Input value={vgm.weighingLocation} onChange={(event) => update("weighingLocation", event.target.value)} /></Field>
        <Field label="称重设备编号"><Input value={vgm.weighingEquipmentId} onChange={(event) => update("weighingEquipmentId", event.target.value)} /></Field>
        <Field label="称重凭证编号（如有）"><Input value={vgm.weighingCertificateNumber} onChange={(event) => update("weighingCertificateNumber", event.target.value)} /></Field>
        <Field label="授权人员姓名（大写）" required><Input value={vgm.authorizedPerson} onChange={(event) => update("authorizedPerson", event.target.value.toUpperCase())} placeholder="AUTHORIZED PERSON" /></Field>
        <Field label="职务"><Input value={vgm.authorizedPersonTitle} onChange={(event) => update("authorizedPersonTitle", event.target.value)} /></Field>
        <Field label="签署日期" required><Input type="date" value={vgm.signatureDate} onChange={(event) => update("signatureDate", event.target.value)} /></Field>
      </div>
      <Field label="备注"><Textarea rows={4} value={draft.notes} onChange={(event) => change((previous) => ({ ...previous, notes: event.target.value }))} /></Field>
    </section>
  );
}
