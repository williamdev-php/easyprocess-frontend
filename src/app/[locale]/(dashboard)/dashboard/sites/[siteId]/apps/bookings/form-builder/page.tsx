"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { GET_BOOKING_SERVICES, GET_BOOKING_FORM_FIELDS } from "@/graphql/queries";
import {
  CREATE_BOOKING_SERVICE,
  UPDATE_BOOKING_SERVICE,
  DELETE_BOOKING_SERVICE,
  CREATE_BOOKING_FORM_FIELD,
  UPDATE_BOOKING_FORM_FIELD,
  DELETE_BOOKING_FORM_FIELD,
} from "@/graphql/mutations";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip } from "@/components/ui/tooltip";

interface Service {
  id: string;
  siteId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
  sortOrder: number;
}

interface FormField {
  id: string;
  siteId: string;
  label: string;
  fieldType: string;
  placeholder: string | null;
  isRequired: boolean;
  options: string[] | null;
  sortOrder: number;
  isActive: boolean;
}

const FIELD_TYPES = ["text", "email", "phone", "textarea", "select", "number", "date"] as const;

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

export default function FormBuilderPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const t = useTranslations("bookings");

  // ---- Services ----
  const { data: servicesData, loading: servicesLoading, refetch: refetchServices } = useQuery<{
    bookingServices: Service[];
  }>(GET_BOOKING_SERVICES, { variables: { siteId }, fetchPolicy: "cache-and-network" });

  const [createService] = useMutation(CREATE_BOOKING_SERVICE);
  const [updateService] = useMutation(UPDATE_BOOKING_SERVICE);
  const [deleteService] = useMutation(DELETE_BOOKING_SERVICE);

  const services = servicesData?.bookingServices ?? [];

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    durationMinutes: 60,
    price: 0,
    currency: "SEK",
  });

  function resetServiceForm() {
    setServiceForm({ name: "", description: "", durationMinutes: 60, price: 0, currency: "SEK" });
    setEditingServiceId(null);
    setShowServiceForm(false);
  }

  function startEditService(service: Service) {
    setServiceForm({
      name: service.name,
      description: service.description ?? "",
      durationMinutes: service.durationMinutes,
      price: service.price,
      currency: service.currency,
    });
    setEditingServiceId(service.id);
    setShowServiceForm(true);
  }

  async function handleSaveService() {
    if (!serviceForm.name.trim()) return;
    if (editingServiceId) {
      await updateService({
        variables: {
          input: { siteId, serviceId: editingServiceId, ...serviceForm },
        },
      });
    } else {
      await createService({
        variables: {
          input: { siteId, ...serviceForm },
        },
      });
    }
    resetServiceForm();
    refetchServices();
  }

  async function handleDeleteService(serviceId: string) {
    if (!window.confirm(t("deleteServiceConfirm"))) return;
    await deleteService({ variables: { siteId, serviceId } });
    refetchServices();
  }

  // ---- Form Fields ----
  const { data: fieldsData, loading: fieldsLoading, refetch: refetchFields } = useQuery<{
    bookingFormFields: FormField[];
  }>(GET_BOOKING_FORM_FIELDS, { variables: { siteId }, fetchPolicy: "cache-and-network" });

  const [createField] = useMutation(CREATE_BOOKING_FORM_FIELD);
  const [updateField] = useMutation(UPDATE_BOOKING_FORM_FIELD);
  const [deleteField] = useMutation(DELETE_BOOKING_FORM_FIELD);

  const fields = fieldsData?.bookingFormFields ?? [];

  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldForm, setFieldForm] = useState({
    label: "",
    fieldType: "text",
    placeholder: "",
    isRequired: false,
    options: "",
    sortOrder: 0,
  });

  function resetFieldForm() {
    setFieldForm({ label: "", fieldType: "text", placeholder: "", isRequired: false, options: "", sortOrder: 0 });
    setEditingFieldId(null);
    setShowFieldForm(false);
  }

  function startEditField(field: FormField) {
    setFieldForm({
      label: field.label,
      fieldType: field.fieldType,
      placeholder: field.placeholder ?? "",
      isRequired: field.isRequired,
      options: field.options?.join(", ") ?? "",
      sortOrder: field.sortOrder,
    });
    setEditingFieldId(field.id);
    setShowFieldForm(true);
  }

  async function handleSaveField() {
    if (!fieldForm.label.trim()) return;
    const input: Record<string, unknown> = {
      siteId,
      label: fieldForm.label,
      fieldType: fieldForm.fieldType,
      placeholder: fieldForm.placeholder || null,
      isRequired: fieldForm.isRequired,
      options: fieldForm.fieldType === "select" ? fieldForm.options.split(",").map((o) => o.trim()).filter(Boolean) : null,
      sortOrder: fieldForm.sortOrder,
    };
    if (editingFieldId) {
      await updateField({ variables: { input: { ...input, fieldId: editingFieldId } } });
    } else {
      await createField({ variables: { input } });
    }
    resetFieldForm();
    refetchFields();
  }

  async function handleDeleteField(fieldId: string) {
    if (!window.confirm(t("deleteFieldConfirm"))) return;
    await deleteField({ variables: { siteId, fieldId } });
    refetchFields();
  }

  // Default built-in fields display
  const builtInFields = [
    { label: t("customerName"), type: "text", required: true, builtIn: true },
    { label: t("customerEmail"), type: "email", required: true, builtIn: true },
    { label: t("customerPhone"), type: "phone", required: false, builtIn: true },
  ];

  const loading = servicesLoading || fieldsLoading;

  return (
    <div className="space-y-8 animate-page-enter">
      {/* Section 1: Services */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary">{t("services")}</h2>
            <Tooltip text={t("servicesTooltip")} />
          </div>
          <button
            onClick={() => { resetServiceForm(); setShowServiceForm(true); }}
            className="rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90"
          >
            + {t("addService")}
          </button>
        </div>

        {/* Service form */}
        {showServiceForm && (
          <div className="mb-4 rounded-xl border border-border-light bg-white/80 p-4 shadow-sm space-y-3 animate-collapsible-open">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">{t("serviceName")}</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">{t("duration")}</label>
                <input
                  type="number"
                  value={serviceForm.durationMinutes}
                  onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep focus:ring-2 focus:ring-primary/10 transition-all"
                  min={5}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">{t("price")}</label>
                <input
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep focus:ring-2 focus:ring-primary/10 transition-all"
                  min={0}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">{t("description")}</label>
                <input
                  type="text"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveService}
                className="rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90"
              >
                {editingServiceId ? t("save") : t("addService")}
              </button>
              <button
                onClick={resetServiceForm}
                className="rounded-lg border border-border-light px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50 transition"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        )}

        {/* Services list */}
        {loading && services.length === 0 ? (
          <div className="space-y-3 animate-stagger">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-xl border border-border-light bg-white/80 p-8 text-center shadow-sm">
            <p className="text-text-muted">{t("noServices")}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border-light bg-white/80 shadow-sm">
            <div className="divide-y divide-border-light">
              {services.map((service) => (
                <div key={service.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary">{service.name}</p>
                    <p className="text-xs text-text-muted">
                      {service.durationMinutes} min &middot; {service.price} {service.currency}
                      {service.description && ` \u00b7 ${service.description}`}
                    </p>
                  </div>
                  {!service.isActive && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {t("inactive")}
                    </span>
                  )}
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEditService(service)}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-primary-deep/5 hover:text-primary-deep transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Form Fields */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary">{t("formFields")}</h2>
            <Tooltip text={t("formFieldsTooltip")} />
          </div>
          <button
            onClick={() => { resetFieldForm(); setShowFieldForm(true); }}
            className="rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90"
          >
            + {t("addField")}
          </button>
        </div>

        {/* Built-in fields */}
        <div className="mb-4 rounded-xl border border-border-light bg-white/80 shadow-sm">
          <div className="divide-y divide-border-light">
            {builtInFields.map((field) => (
              <div key={field.label} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary">{field.label}</p>
                  <p className="text-xs text-text-muted">
                    {field.type} &middot; {field.required ? t("required") : t("optional")} &middot; {t("builtIn")}
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                  {t("builtIn")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Field form */}
        {showFieldForm && (
          <div className="mb-4 rounded-xl border border-border-light bg-white/80 p-4 shadow-sm space-y-3 animate-collapsible-open">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">{t("fieldLabel")}</label>
                <input
                  type="text"
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                  className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">{t("fieldType")}</label>
                <select
                  value={fieldForm.fieldType}
                  onChange={(e) => setFieldForm({ ...fieldForm, fieldType: e.target.value })}
                  className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:border-primary-deep focus:ring-2 focus:ring-primary/10 transition-all"
                >
                  {FIELD_TYPES.map((ft) => (
                    <option key={ft} value={ft}>{t(`fieldType_${ft}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">{t("placeholder")}</label>
                <input
                  type="text"
                  value={fieldForm.placeholder}
                  onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                  className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">{t("sortOrder")}</label>
                <input
                  type="number"
                  value={fieldForm.sortOrder}
                  onChange={(e) => setFieldForm({ ...fieldForm, sortOrder: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep focus:ring-2 focus:ring-primary/10 transition-all"
                  min={0}
                />
              </div>
            </div>
            {fieldForm.fieldType === "select" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">{t("optionsComma")}</label>
                <input
                  type="text"
                  value={fieldForm.options}
                  onChange={(e) => setFieldForm({ ...fieldForm, options: e.target.value })}
                  placeholder={t("optionsPlaceholder")}
                  className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={fieldForm.isRequired}
                  onChange={(e) => setFieldForm({ ...fieldForm, isRequired: e.target.checked })}
                />
                {t("required")}
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveField}
                className="rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90"
              >
                {editingFieldId ? t("save") : t("addField")}
              </button>
              <button
                onClick={resetFieldForm}
                className="rounded-lg border border-border-light px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50 transition"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        )}

        {/* Custom fields list */}
        {loading && fields.length === 0 ? (
          <div className="space-y-3 animate-stagger">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : fields.length > 0 ? (
          <div className="rounded-xl border border-border-light bg-white/80 shadow-sm">
            <div className="divide-y divide-border-light">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary">{field.label}</p>
                    <p className="text-xs text-text-muted">
                      {field.fieldType} &middot; {field.isRequired ? t("required") : t("optional")}
                      {field.options && field.options.length > 0 && ` \u00b7 ${field.options.join(", ")}`}
                    </p>
                  </div>
                  {!field.isActive && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {t("inactive")}
                    </span>
                  )}
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEditField(field)}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-primary-deep/5 hover:text-primary-deep transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
