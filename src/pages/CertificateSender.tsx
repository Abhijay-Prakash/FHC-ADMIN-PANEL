import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import { Calendar3, CheckCircle, Envelope, Eye, Send, Trash } from 'react-bootstrap-icons';

type Attendee = {
  _id: string;
  name: string;
  email: string;
  class?: string;
  semester?: number;
};

type Event = {
  _id: string;
  title: string;
  date: string;
  category: string;
  registeredUsers: string[];
  description?: string;
};

type NamePlacement = { x: number; y: number; width: number; height: number };
type Delivery = {
  _id: string;
  user?: Attendee | null;
  recipientName: string;
  recipientEmail: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  attempts: number;
  lastAttemptAt?: string;
  sentAt?: string;
  lastError?: string;
};

type CertificateTemplate = {
  _id: string;
  name: string;
  contentType: string;
  recipients: Attendee[];
  createdAt: string;
  imageUrl?: string;
  namePlacement: NamePlacement;
  nameColor: 'white' | 'black';
  emailSubject: string;
  emailBody: string;
  deliveryCounts: Partial<Record<Delivery['status'], number>>;
  deliveries: Delivery[];
};

const defaultPlacement: NamePlacement = { x: 0.2, y: 0.42, width: 0.6, height: 0.12 };
const defaultSubject = 'Your certificate for {{eventName}}';
const defaultBody = 'Hi {{name}},\n\nThank you for taking part in {{eventName}}. We appreciate your contribution. Your certificate is attached.\n\nBest,\nFISAT HORIZON';

const NamePlacementEditor: React.FC<{
  imageUrl: string;
  placement: NamePlacement;
  color: 'white' | 'black';
  onChange: (placement: NamePlacement) => void;
}> = ({ imageUrl, placement, color, onChange }) => {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{ mode: 'move' | 'resize'; pointerX: number; pointerY: number; initial: NamePlacement } | null>(null);

  const startPointer = <T extends HTMLElement,>(event: React.PointerEvent<T>, mode: 'move' | 'resize') => {
    event.preventDefault();
    event.stopPropagation();
    frameRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = { mode, pointerX: event.clientX, pointerY: event.clientY, initial: placement };
  };

  const movePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const bounds = frameRef.current?.getBoundingClientRect();
    if (!drag || !bounds?.width || !bounds.height) return;
    const dx = (event.clientX - drag.pointerX) / bounds.width;
    const dy = (event.clientY - drag.pointerY) / bounds.height;
    if (drag.mode === 'move') {
      onChange({ ...drag.initial, x: Math.max(0, Math.min(1 - drag.initial.width, drag.initial.x + dx)), y: Math.max(0, Math.min(1 - drag.initial.height, drag.initial.y + dy)) });
    } else {
      const maxWidth = 1 - drag.initial.x;
      const maxHeight = 1 - drag.initial.y;
      onChange({ ...drag.initial, width: Math.max(Math.min(0.06, maxWidth), Math.min(maxWidth, drag.initial.width + dx)), height: Math.max(Math.min(0.035, maxHeight), Math.min(maxHeight, drag.initial.height + dy)) });
    }
  };

  return (
    <div>
      <div ref={frameRef} className="certificate-placement-frame" onPointerMove={movePointer} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }}>
        <img src={imageUrl} alt="Certificate template" draggable={false} />
        <div
          className="certificate-name-area"
          style={{ left: `${placement.x * 100}%`, top: `${placement.y * 100}%`, width: `${placement.width * 100}%`, height: `${placement.height * 100}%`, color: color === 'black' ? '#000' : '#fff', textShadow: color === 'black' ? '0 0 3px #fff' : '0 1px 3px #000' }}
          onPointerDown={(event) => startPointer(event, 'move')}
        >
          <span>NAME</span>
          <button type="button" className="certificate-resize-handle" aria-label="Resize name area" onPointerDown={(event) => startPointer(event, 'resize')} />
        </div>
      </div>
      <p className="small text-white-50 mt-2 mb-0">Drag the outlined area to position the name. Drag its bottom-right handle to resize.</p>
    </div>
  );
};

const CertificateSender: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<Attendee[]>([]);
  const [attendedUsers, setAttendedUsers] = useState<Attendee[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [recipientSource, setRecipientSource] = useState<'registered' | 'attended'>('registered');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [templateName, setTemplateName] = useState('Participant Certificate');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateImageUrl, setTemplateImageUrl] = useState<string | null>(null);
  const [draftPlacement, setDraftPlacement] = useState<NamePlacement>(defaultPlacement);
  const [draftNameColor, setDraftNameColor] = useState<'white' | 'black'>('white');
  const [draftSubject, setDraftSubject] = useState(defaultSubject);
  const [draftBody, setDraftBody] = useState(defaultBody);
  const [editingSettingsId, setEditingSettingsId] = useState<string | null>(null);
  const [historyOpenId, setHistoryOpenId] = useState<string | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<{ namePlacement: NamePlacement; nameColor: 'white' | 'black'; emailSubject: string; emailBody: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTemplateToSend, setPreviewTemplateToSend] = useState<CertificateTemplate | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
  const templateImageUrls = React.useRef(new Set<string>());

  const trackImageUrl = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    templateImageUrls.current.add(url);
    return url;
  };

  const availableRecipients = recipientSource === 'registered' ? registeredUsers : attendedUsers;
  useEffect(() => {
    axios.get('/events/getEvents')
      .then(({ data }) => setEvents(data.filter((event: Event) => event.registeredUsers?.length > 0)))
      .catch((error) => {
        console.error('Failed to load events:', error);
        setMessage({ text: 'Failed to load events.', type: 'danger' });
      });
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => () => {
    if (templateImageUrl) URL.revokeObjectURL(templateImageUrl);
  }, [templateImageUrl]);

  useEffect(() => () => {
    templateImageUrls.current.forEach((url) => URL.revokeObjectURL(url));
    templateImageUrls.current.clear();
  }, []);

  const openEvent = async (event: Event) => {
    if (selectedEvent?._id === event._id) {
      templateImageUrls.current.forEach((url) => URL.revokeObjectURL(url));
      templateImageUrls.current.clear();
      setSelectedEvent(null);
      setTemplates([]);
      setEditingSettingsId(null);
      return;
    }
    setSelectedEvent(event);
    setLoading(true);
    setMessage(null);
    setSelectedRecipients([]);
    templateImageUrls.current.forEach((url) => URL.revokeObjectURL(url));
    templateImageUrls.current.clear();
    try {
      const [registrationResponse, templateResponse] = await Promise.all([
        axios.post('/events/registrations', { eventId: event._id }),
        axios.get(`/certificate/templates/${event._id}`),
      ]);
      setRegisteredUsers(registrationResponse.data.registeredUsers || []);
      setAttendedUsers(registrationResponse.data.attendedUsers || []);
      const templatesWithImages = await Promise.all((templateResponse.data.templates || []).map(async (template: CertificateTemplate) => {
        const [imageResponse, deliveryResponse] = await Promise.all([
          axios.get(`/certificate/templates/${template._id}/image`, { responseType: 'blob' }),
          axios.get(`/certificate/templates/${template._id}/deliveries`),
        ]);
        return {
          ...template,
          imageUrl: trackImageUrl(imageResponse.data),
          namePlacement: template.namePlacement || defaultPlacement,
          nameColor: template.nameColor || 'white',
          emailSubject: template.emailSubject || defaultSubject,
          emailBody: template.emailBody || defaultBody,
          deliveryCounts: deliveryResponse.data.counts || {},
          deliveries: deliveryResponse.data.deliveries || [],
        };
      }));
      setTemplates(templatesWithImages);
    } catch (error: any) {
      console.error('Failed to load event certificate details:', error);
      setMessage({ text: error.response?.data?.message || 'Failed to load this event’s recipients and templates.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const toggleRecipient = (userId: string) => {
    setSelectedRecipients((current) => current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId]);
  };

  const uploadTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEvent || !templateFile) return;
    if (!['image/png', 'image/jpeg'].includes(templateFile.type)) {
      setMessage({ text: 'Choose a PNG or JPEG image.', type: 'danger' });
      return;
    }
    if (templateFile.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Certificate images must be 5 MB or smaller.', type: 'danger' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({ name: templateName.trim() });
      const { data } = await axios.post(
        `/certificate/templates/${selectedEvent._id}?${params.toString()}`,
        templateFile,
        { headers: { 'Content-Type': templateFile.type } }
      );
      const { data: savedData } = await axios.patch(`/certificate/templates/${data.template._id}/recipients`, {
        recipientIds: selectedRecipients,
      });
      const { data: settingsData } = await axios.patch(`/certificate/templates/${data.template._id}/settings`, {
        namePlacement: draftPlacement,
        nameColor: draftNameColor,
        emailSubject: draftSubject,
        emailBody: draftBody,
      });
      const recipientMap = new Map([...registeredUsers, ...attendedUsers].map((user) => [user._id, user]));
      const imageResponse = await axios.get(`/certificate/templates/${data.template._id}/image`, { responseType: 'blob' });
      const template: CertificateTemplate = {
        ...savedData.template,
        ...settingsData.settings,
        imageUrl: trackImageUrl(imageResponse.data),
        deliveryCounts: {},
        deliveries: [],
        recipients: savedData.template.recipients?.map((recipient: string | Attendee) => typeof recipient === 'string' ? recipientMap.get(recipient) : recipient).filter((user: Attendee | undefined): user is Attendee => Boolean(user)) || [],
      };
      setTemplates((current) => [template, ...current]);
      setTemplateFile(null);
      setTemplateImageUrl(null);
      setDraftPlacement(defaultPlacement);
      setDraftNameColor('white');
      setDraftSubject(defaultSubject);
      setDraftBody(defaultBody);
      setMessage({ text: `“${template.name}” saved for ${selectedRecipients.length} recipient${selectedRecipients.length === 1 ? '' : 's'}.`, type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Failed to upload certificate template.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const startEditingSettings = (template: CertificateTemplate) => {
    setEditingSettingsId((current) => current === template._id ? null : template._id);
    setSettingsDraft({
      namePlacement: template.namePlacement || defaultPlacement,
      nameColor: template.nameColor || 'white',
      emailSubject: template.emailSubject || defaultSubject,
      emailBody: template.emailBody || defaultBody,
    });
  };

  const saveTemplateSettings = async (template: CertificateTemplate) => {
    if (!settingsDraft) return;
    try {
      const { data } = await axios.patch(`/certificate/templates/${template._id}/settings`, settingsDraft);
      setTemplates((current) => current.map((item) => item._id === template._id ? { ...item, ...data.settings } : item));
      setEditingSettingsId(null);
      setSettingsDraft(null);
      setMessage({ text: 'Name position and email message saved.', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Failed to save certificate settings.', type: 'danger' });
    }
  };

  const previewTemplate = async (template: CertificateTemplate, prepareToSend = false) => {
    try {
      const userId = template.recipients[0]?._id;
      const response = await axios.get(`/certificate/templates/${template._id}/preview`, {
        params: userId ? { userId } : undefined,
        responseType: 'blob',
      });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(response.data));
      setPreviewTemplateToSend(prepareToSend ? template : null);
    } catch (error) {
      console.error('Failed to preview certificate:', error);
      setMessage({ text: 'Failed to generate certificate preview.', type: 'danger' });
    }
  };

  const refreshDeliveries = async (templateId: string) => {
    const { data } = await axios.get(`/certificate/templates/${templateId}/deliveries`);
    setTemplates((current) => current.map((template) => template._id === templateId
      ? { ...template, deliveries: data.deliveries || [], deliveryCounts: data.counts || {} }
      : template));
  };

  const sendTemplate = async (template: CertificateTemplate) => {
    if (template.recipients.length === 0) {
      setMessage({ text: 'Assign at least one recipient to this template first.', type: 'danger' });
      return;
    }
    if (!window.confirm(`Send “${template.name}” to ${template.recipients.length} recipient(s)?`)) return;
    setSendingId(template._id);
    setMessage(null);
    try {
      const { data } = await axios.post(`/certificate/templates/${template._id}/send`);
      await refreshDeliveries(template._id);
      setMessage({ text: data.message, type: data.failed ? 'danger' : 'success' });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewTemplateToSend(null);
    } catch (error: any) {
      await refreshDeliveries(template._id).catch(() => undefined);
      setMessage({ text: error.response?.data?.message || 'Certificate sending failed. Check the backend email configuration.', type: 'danger' });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewTemplateToSend(null);
    } finally {
      setSendingId(null);
    }
  };

  const retryFailed = async (template: CertificateTemplate) => {
    const failedCount = template.deliveryCounts.failed || 0;
    if (!failedCount || !window.confirm(`Retry ${failedCount} failed certificate delivery(s) for “${template.name}”?`)) return;
    setSendingId(template._id);
    setMessage(null);
    try {
      const { data } = await axios.post(`/certificate/templates/${template._id}/retry-failed`);
      await refreshDeliveries(template._id);
      setMessage({ text: data.message, type: data.failed ? 'danger' : 'success' });
    } catch (error: any) {
      await refreshDeliveries(template._id).catch(() => undefined);
      setMessage({ text: error.response?.data?.message || 'Failed to retry certificate deliveries.', type: 'danger' });
    } finally {
      setSendingId(null);
    }
  };

  const deleteTemplate = async (template: CertificateTemplate) => {
    if (!window.confirm(`Delete the “${template.name}” certificate template?`)) return;
    try {
      await axios.delete(`/certificate/templates/${template._id}`);
      if (template.imageUrl) {
        URL.revokeObjectURL(template.imageUrl);
        templateImageUrls.current.delete(template.imageUrl);
      }
      setTemplates((current) => current.filter((item) => item._id !== template._id));
      setMessage({ text: 'Certificate template deleted.', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Failed to delete certificate template.', type: 'danger' });
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="certificate-page py-5">
      <div className="container">
        <header className="text-center text-white mb-5">
          <Envelope size={42} className="mb-2" />
          <h1 className="display-5 fw-bold">Certificate Sender</h1>
          <p className="lead opacity-75 mb-0">Upload reusable certificate designs for each event, preview them, then send.</p>
        </header>

        {message && (
          <div className={`alert alert-${message.type} alert-dismissible`} role="status">
            {message.text}
            <button className="btn-close" aria-label="Dismiss" onClick={() => setMessage(null)} />
          </div>
        )}

        {events.length === 0 ? (
          <div className="certificate-empty text-center p-5">
            <Envelope size={48} className="mb-3 opacity-75" />
            <h3>No events with registrants</h3>
            <p className="mb-0">Events with registered participants will appear here.</p>
          </div>
        ) : (
          <div className="d-grid gap-4">
            {events.map((event) => (
              <section className="certificate-event" key={event._id}>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <span className="certificate-category">{event.category}</span>
                    <h2 className="h4 fw-bold mt-2 mb-1">{event.title}</h2>
                    <div className="small text-white-50"><Calendar3 className="me-2" />{formatDate(event.date)}</div>
                  </div>
                  <button className="btn btn-outline-light" onClick={() => openEvent(event)}>
                    {selectedEvent?._id === event._id ? 'Close templates' : 'Manage certificates'}
                  </button>
                </div>

                {selectedEvent?._id === event._id && (
                  <div className="certificate-manager mt-4">
                    {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div> : (
                      <>
                        <div className="row g-4">
                          <div className="col-lg-5">
                            <div className="certificate-panel h-100">
                              <h3 className="h5 fw-bold mb-3">Add a certificate template</h3>
                              <form onSubmit={uploadTemplate}>
                                <label className="form-label" htmlFor="certificate-template-name">Template label</label>
                                <input id="certificate-template-name" className="form-control mb-3" maxLength={80} required value={templateName} onChange={(event) => setTemplateName(event.target.value)} placeholder="e.g. Mentor Certificate" />

                                <label className="form-label" htmlFor="certificate-template-file">Certificate image (PNG or JPEG, up to 5 MB)</label>
                                <input key={templateFile ? 'selected' : 'empty'} id="certificate-template-file" className="form-control mb-3" type="file" accept="image/png,image/jpeg" required onChange={(event) => {
                                  const file = event.target.files?.[0] || null;
                                  setTemplateFile(file);
                                  setTemplateImageUrl(file ? URL.createObjectURL(file) : null);
                                  setDraftPlacement(defaultPlacement);
                                }} />
                                {templateImageUrl && <div className="mb-3"><NamePlacementEditor imageUrl={templateImageUrl} placement={draftPlacement} color={draftNameColor} onChange={setDraftPlacement} /></div>}
                                <label className="form-label" htmlFor="certificate-name-color">Name font color</label>
                                <select id="certificate-name-color" className="form-select mb-3" value={draftNameColor} onChange={(event) => setDraftNameColor(event.target.value as 'white' | 'black')}>
                                  <option value="white">White</option>
                                  <option value="black">Black</option>
                                </select>
                                <label className="form-label" htmlFor="certificate-email-subject">Email subject</label>
                                <input id="certificate-email-subject" className="form-control mb-2" required maxLength={180} value={draftSubject} onChange={(event) => setDraftSubject(event.target.value)} />
                                <label className="form-label" htmlFor="certificate-email-body">Email message</label>
                                <textarea id="certificate-email-body" className="form-control mb-2" rows={5} required maxLength={10000} value={draftBody} onChange={(event) => setDraftBody(event.target.value)} />
                                <p className="small text-white-50">Use <code>{'{{name}}'}</code>, <code>{'{{eventName}}'}</code>, and <code>{'{{eventDate}}'}</code> to personalize the message.</p>

                                <div className="d-flex gap-2 mb-3">
                                  <button type="button" className={`btn btn-sm ${recipientSource === 'registered' ? 'btn-info' : 'btn-outline-info'}`} onClick={() => { setRecipientSource('registered'); setSelectedRecipients([]); }}>Registered ({registeredUsers.length})</button>
                                  <button type="button" className={`btn btn-sm ${recipientSource === 'attended' ? 'btn-info' : 'btn-outline-info'}`} onClick={() => { setRecipientSource('attended'); setSelectedRecipients([]); }}>Attended ({attendedUsers.length})</button>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="small text-white-50">Choose who gets this certificate</span>
                                  <button type="button" className="btn btn-sm btn-link text-info p-0" onClick={() => {
                                    const ids = availableRecipients.map((user) => user._id);
                                    setSelectedRecipients(ids.length > 0 && ids.every((id) => selectedRecipients.includes(id)) ? [] : ids);
                                  }}>Select all / clear</button>
                                </div>
                                <div className="certificate-recipient-list mb-3">
                                  {availableRecipients.length === 0 ? <p className="small text-white-50 mb-0">No people in this group yet.</p> : availableRecipients.map((user) => (
                                    <label className="certificate-recipient" key={user._id}>
                                      <input type="checkbox" checked={selectedRecipients.includes(user._id)} onChange={() => toggleRecipient(user._id)} />
                                      <span><strong>{user.name}</strong><small>{user.email}</small></span>
                                    </label>
                                  ))}
                                </div>
                                <button type="submit" className="btn btn-info w-100" disabled={loading || !templateFile}>
                                  {loading ? 'Saving…' : `Save template (${selectedRecipients.length} selected)`}
                                </button>
                              </form>
                            </div>
                          </div>

                          <div className="col-lg-7">
                            <div className="certificate-panel h-100">
                              <h3 className="h5 fw-bold mb-3">Saved templates</h3>
                              {templates.length === 0 ? <p className="text-white-50 mb-0">No templates saved for this event yet.</p> : (
                                <div className="d-grid gap-3">
                                  {templates.map((template) => (
                                    <article className="certificate-template-row" key={template._id}>
                                      <div className="d-flex flex-wrap justify-content-between gap-3">
                                        <div>
                                          <h4 className="h6 fw-bold mb-1">{template.name}</h4>
                                          <p className="small text-white-50 mb-1">{template.recipients.length} recipient{template.recipients.length === 1 ? '' : 's'}</p>
                                          <p className="small mb-0">{template.recipients.slice(0, 4).map((user) => user.name).join(', ')}{template.recipients.length > 4 ? `, +${template.recipients.length - 4} more` : ''}</p>
                                          <div className="d-flex flex-wrap gap-2 mt-2 small">
                                            <span className="badge bg-success">Sent {template.deliveryCounts.sent || 0}</span>
                                            <span className="badge bg-danger">Failed {template.deliveryCounts.failed || 0}</span>
                                            <span className="badge bg-secondary">Pending {template.deliveryCounts.pending || 0}</span>
                                            <span className="badge bg-warning text-dark">Sending {template.deliveryCounts.sending || 0}</span>
                                          </div>
                                        </div>
                                        <div className="d-flex align-items-start gap-2">
                                          <button className="btn btn-sm btn-outline-light" onClick={() => previewTemplate(template)} title="Preview"><Eye /></button>
                                          <button className="btn btn-sm btn-outline-info" onClick={() => startEditingSettings(template)}>Customize</button>
                                          <button className="btn btn-sm btn-info" disabled={sendingId === template._id || template.recipients.length === 0} onClick={() => previewTemplate(template, true)}>
                                            {sendingId === template._id ? <span className="spinner-border spinner-border-sm" /> : <><Send className="me-1" />Preview & Send</>}
                                          </button>
                                          {(template.deliveryCounts.failed || 0) > 0 && <button className="btn btn-sm btn-warning" disabled={sendingId === template._id} onClick={() => retryFailed(template)}>Retry failed</button>}
                                          <button className="btn btn-sm btn-outline-light" onClick={() => setHistoryOpenId((current) => current === template._id ? null : template._id)}>{historyOpenId === template._id ? 'Hide history' : 'History'}</button>
                                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTemplate(template)} title="Delete template"><Trash /></button>
                                        </div>
                                      </div>
                                      {historyOpenId === template._id && (
                                        <div className="certificate-delivery-history mt-3 pt-3 border-top border-light border-opacity-25">
                                          <h5 className="h6 fw-bold">Delivery history</h5>
                                          {template.deliveries.length === 0 ? <p className="small text-white-50 mb-0">No send attempts yet.</p> : (
                                            <div className="table-responsive">
                                              <table className="table table-sm table-dark align-middle mb-0">
                                                <thead><tr><th>Recipient</th><th>Status</th><th>Attempts</th><th>Last attempt</th><th>Sent</th><th>Details</th></tr></thead>
                                                <tbody>{template.deliveries.map((delivery) => (
                                                  <tr key={delivery._id}>
                                                    <td><strong>{delivery.recipientName}</strong><br /><small>{delivery.recipientEmail}</small></td>
                                                    <td><span className={`badge ${delivery.status === 'sent' ? 'bg-success' : delivery.status === 'failed' ? 'bg-danger' : delivery.status === 'sending' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{delivery.status}</span></td>
                                                    <td>{delivery.attempts}</td>
                                                    <td>{delivery.lastAttemptAt ? new Date(delivery.lastAttemptAt).toLocaleString() : '—'}</td>
                                                    <td>{delivery.sentAt ? new Date(delivery.sentAt).toLocaleString() : '—'}</td>
                                                    <td className="small text-warning">{delivery.lastError || '—'}</td>
                                                  </tr>
                                                ))}</tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {editingSettingsId === template._id && settingsDraft && (
                                        <div className="certificate-settings-editor mt-3 pt-3 border-top border-light border-opacity-25">
                                          {template.imageUrl && <NamePlacementEditor imageUrl={template.imageUrl} placement={settingsDraft.namePlacement} color={settingsDraft.nameColor} onChange={(namePlacement) => setSettingsDraft((current) => current ? { ...current, namePlacement } : current)} />}
                                          <label className="form-label mt-3" htmlFor={`name-color-${template._id}`}>Name font color</label>
                                          <select id={`name-color-${template._id}`} className="form-select mb-2" value={settingsDraft.nameColor} onChange={(event) => setSettingsDraft((current) => current ? { ...current, nameColor: event.target.value as 'white' | 'black' } : current)}>
                                            <option value="white">White</option>
                                            <option value="black">Black</option>
                                          </select>
                                          <label className="form-label mt-3" htmlFor={`subject-${template._id}`}>Email subject</label>
                                          <input id={`subject-${template._id}`} className="form-control mb-2" maxLength={180} value={settingsDraft.emailSubject} onChange={(event) => setSettingsDraft((current) => current ? { ...current, emailSubject: event.target.value } : current)} />
                                          <label className="form-label" htmlFor={`body-${template._id}`}>Email message</label>
                                          <textarea id={`body-${template._id}`} className="form-control mb-2" rows={5} maxLength={10000} value={settingsDraft.emailBody} onChange={(event) => setSettingsDraft((current) => current ? { ...current, emailBody: event.target.value } : current)} />
                                          <p className="small text-white-50">Available fields: <code>{'{{name}}'}</code>, <code>{'{{eventName}}'}</code>, <code>{'{{eventDate}}'}</code>.</p>
                                          <button className="btn btn-sm btn-info" onClick={() => saveTemplateSettings(template)}>Save placement and message</button>
                                        </div>
                                      )}
                                    </article>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {templates.length > 0 && <div className="small text-white-50 mt-3"><CheckCircle className="me-1" />Each preview uses the first recipient assigned to its template.</div>}
                      </>
                    )}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="certificate-preview-backdrop" role="dialog" aria-modal="true" aria-label="Certificate preview">
          <div className="certificate-preview-modal">
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
              <h2 className="h5 mb-0">Personalized certificate preview</h2>
              <button className="btn-close" aria-label="Close preview" onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setPreviewTemplateToSend(null); }} />
            </div>
            <iframe title="Certificate PDF preview" src={previewUrl} />
            {previewTemplateToSend && <div className="d-flex justify-content-end align-items-center gap-3 p-3 border-top">
              <span className="small text-muted">This preview uses {previewTemplateToSend.recipients[0]?.name || 'a sample recipient'}.</span>
              <button className="btn btn-info" disabled={sendingId === previewTemplateToSend._id} onClick={() => sendTemplate(previewTemplateToSend)}>
                {sendingId === previewTemplateToSend._id ? 'Sending…' : `Send to ${previewTemplateToSend.recipients.length}`}
              </button>
            </div>}
          </div>
        </div>
      )}

      <style>{`
        .certificate-page { min-height: 100vh; background: linear-gradient(135deg, #12152c 0%, #28265c 55%, #433276 100%); }
        .certificate-event, .certificate-empty { color: #fff; border: 1px solid rgba(255,255,255,.16); border-radius: 20px; background: rgba(255,255,255,.08); backdrop-filter: blur(12px); padding: 24px; }
        .certificate-category { border-radius: 20px; padding: 5px 12px; background: rgba(45,212,191,.18); color: #99f6e4; font-size: .8rem; }
        .certificate-panel { padding: 20px; border-radius: 16px; background: rgba(8,12,32,.5); }
        .certificate-panel .form-control { color: #fff; background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.2); }
        .certificate-panel .form-control::file-selector-button { color: #fff; background: rgba(255,255,255,.15); }
        .certificate-recipient-list { max-height: 260px; overflow: auto; border: 1px solid rgba(255,255,255,.15); border-radius: 10px; }
        .certificate-recipient { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,.08); cursor: pointer; }
        .certificate-recipient:last-child { border-bottom: 0; }
        .certificate-recipient span { display: flex; flex-direction: column; min-width: 0; }
        .certificate-recipient small { color: rgba(255,255,255,.6); overflow-wrap: anywhere; }
        .certificate-template-row { padding: 16px; border: 1px solid rgba(255,255,255,.14); border-radius: 12px; background: rgba(255,255,255,.055); }
        .certificate-placement-frame { position: relative; width: 100%; line-height: 0; user-select: none; touch-action: none; }
        .certificate-placement-frame > img { display: block; width: 100%; height: auto; border-radius: 8px; }
        .certificate-name-area { position: absolute; display: flex; align-items: center; justify-content: center; border: 2px dashed #00e5ff; background: rgba(0, 217, 255, .24); color: #fff; font: 700 clamp(9px, 2vw, 24px)/1 Arial, sans-serif; text-shadow: 0 1px 3px #000; cursor: move; touch-action: none; }
        .certificate-resize-handle { position: absolute; right: -7px; bottom: -7px; width: 16px; height: 16px; border: 2px solid #fff; border-radius: 50%; background: #06b6d4; cursor: nwse-resize; touch-action: none; }
        .certificate-preview-backdrop { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 20px; background: rgba(0,0,0,.78); }
        .certificate-preview-modal { width: min(1100px, 96vw); height: min(820px, 92vh); display: flex; flex-direction: column; color: #171717; background: #fff; border-radius: 14px; overflow: hidden; }
        .certificate-preview-modal iframe { width: 100%; flex: 1; border: 0; }
        @media (max-width: 575px) { .certificate-event { padding: 16px; } .certificate-template-row > div { flex-direction: column; } }
      `}</style>
    </div>
  );
};

export default CertificateSender;
