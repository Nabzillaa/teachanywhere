import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Visit, Client, InternalAttendee, TransportBooking,
  AccommodationBooking, OfficeReadinessItem, CommunicationLog,
  ExpenseClaim, VisitTask, VisitStatus, BookingStatus, ExpenseStatus, TaskStatus, DeletedExpense
} from '../data/types';
import { MOCK_VISITS, MOCK_CLIENTS, OFFICE_READINESS_TEMPLATE } from '../data/mockData';
import { logAudit } from '../services/auditService';
import { useAuthStore } from './authStore';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function calcReadiness(visit: Visit): number {
  let score = 0;
  const max = 100;
  if (visit.clientAttendees.length > 0) score += 10;
  if (visit.flightDetails && visit.flightDetails !== 'TBC') score += 10;
  if (visit.hotelName) score += 10;
  if (visit.transportBookings.length > 0) score += 15;
  if (visit.accommodationBookings.length > 0) score += 10;
  const readinessItems = visit.officeReadiness.length;
  const doneItems = visit.officeReadiness.filter(o => o.completed).length;
  if (readinessItems > 0) score += Math.round((doneItems / readinessItems) * 20);
  else score += 0;
  const confirmedInternal = visit.internalAttendees.filter(a => a.attendanceConfirmed).length;
  const totalInternal = visit.internalAttendees.length;
  if (totalInternal > 0) score += Math.round((confirmedInternal / totalInternal) * 10);
  else score += 10;
  if (visit.communications.some(c => c.type === 'Initial Planning')) score += 5;
  if (visit.communications.some(c => c.type === 'Itinerary Confirmation')) score += 5;
  if (visit.visitGoals) score += 5;
  return Math.min(score, max);
}

interface AppState {
  visits: Visit[];
  clients: Client[];
  deletedExpenses: DeletedExpense[];

  addVisit: (visit: Omit<Visit, 'id' | 'visitRef' | 'createdAt' | 'updatedAt' | 'logisticsReadinessScore' | 'clientAttendees' | 'internalAttendees' | 'transportBookings' | 'accommodationBookings' | 'officeReadiness' | 'communications' | 'expenses' | 'tasks'>) => string;
  updateVisit: (id: string, changes: Partial<Visit>) => void;
  deleteVisit: (id: string) => void;
  setVisitStatus: (id: string, status: VisitStatus) => void;

  addClientAttendee: (visitId: string, attendee: Omit<Client, 'id'>) => void;
  updateClientAttendee: (visitId: string, attendeeId: string, changes: Partial<Client>) => void;
  deleteClientAttendee: (visitId: string, attendeeId: string) => void;

  addInternalAttendee: (visitId: string, attendee: Omit<InternalAttendee, 'id'>) => void;
  updateInternalAttendee: (visitId: string, attendeeId: string, changes: Partial<InternalAttendee>) => void;
  deleteInternalAttendee: (visitId: string, attendeeId: string) => void;
  toggleAttendeeConfirmed: (visitId: string, attendeeId: string) => void;

  addTransport: (visitId: string, booking: Omit<TransportBooking, 'id' | 'visitId'>) => void;
  updateTransport: (visitId: string, bookingId: string, changes: Partial<TransportBooking>) => void;
  deleteTransport: (visitId: string, bookingId: string) => void;
  setTransportStatus: (visitId: string, bookingId: string, status: BookingStatus) => void;

  addAccommodation: (visitId: string, booking: Omit<AccommodationBooking, 'id' | 'visitId'>) => void;
  updateAccommodation: (visitId: string, bookingId: string, changes: Partial<AccommodationBooking>) => void;
  deleteAccommodation: (visitId: string, bookingId: string) => void;

  addOfficeReadinessItem: (visitId: string, item: Omit<OfficeReadinessItem, 'id'>) => void;
  toggleOfficeReadiness: (visitId: string, itemId: string, completedBy: string) => void;
  deleteOfficeReadinessItem: (visitId: string, itemId: string) => void;
  loadOfficeTemplate: (visitId: string) => void;

  addCommunication: (visitId: string, comm: Omit<CommunicationLog, 'id' | 'visitId'>) => void;
  updateCommunication: (visitId: string, commId: string, changes: Partial<CommunicationLog>) => void;
  deleteCommunication: (visitId: string, commId: string) => void;

  addExpense: (visitId: string, expense: Omit<ExpenseClaim, 'id' | 'visitId'>) => void;
  updateExpense: (visitId: string, expenseId: string, changes: Partial<ExpenseClaim>) => void;
  deleteExpense: (visitId: string, expenseId: string, reason: string) => void;
  reinstateExpense: (expenseId: string) => void;
  purgeDeletedExpense: (expenseId: string) => void;
  setExpenseStatus: (visitId: string, expenseId: string, status: ExpenseStatus, approvedBy?: string) => void;

  addTask: (visitId: string, task: Omit<VisitTask, 'id' | 'visitId'>) => void;
  updateTask: (visitId: string, taskId: string, changes: Partial<VisitTask>) => void;
  deleteTask: (visitId: string, taskId: string) => void;
  setTaskStatus: (visitId: string, taskId: string, status: TaskStatus) => void;

  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, changes: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

function updateVisitScore(visit: Visit): Visit {
  return { ...visit, logisticsReadinessScore: calcReadiness(visit), updatedAt: new Date().toISOString() };
}

function actor() {
  return useAuthStore.getState().user;
}

function visitLabel(visit: Visit | undefined) {
  return visit ? `${visit.visitRef} — ${visit.company}` : 'Unknown visit';
}

let visitCounter = MOCK_VISITS.length + 1;

export const useAppStore = create<AppState>()(persist((set, get) => ({
  visits: MOCK_VISITS.map(v => ({ ...v, logisticsReadinessScore: calcReadiness(v) })),
  clients: MOCK_CLIENTS,
  deletedExpenses: [],

  // Visits
  addVisit: (data) => {
    const id = generateId();
    const ref = `MNL-2026-${String(visitCounter++).padStart(3, '0')}`;
    const visit: Visit = {
      ...data, id, visitRef: ref,
      clientAttendees: [], internalAttendees: [], transportBookings: [],
      accommodationBookings: [], officeReadiness: [], communications: [],
      expenses: [], tasks: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), logisticsReadinessScore: 0,
    };
    set(s => ({ visits: [...s.visits, visit] }));
    const u = actor();
    if (u) logAudit({ action: 'visit.created', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: `${ref} — ${data.company}`, details: data.purpose });
    return id;
  },

  updateVisit: (id, changes) => {
    const visit = get().visits.find(v => v.id === id);
    set(s => ({ visits: s.visits.map(v => v.id === id ? updateVisitScore({ ...v, ...changes }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'visit.updated', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: Object.keys(changes).join(', ') + ' updated' });
  },

  deleteVisit: (id) => {
    const visit = get().visits.find(v => v.id === id);
    set(s => ({ visits: s.visits.filter(v => v.id !== id) }));
    const u = actor();
    if (u) logAudit({ action: 'visit.deleted', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit) });
  },

  setVisitStatus: (id, status) => {
    const visit = get().visits.find(v => v.id === id);
    set(s => ({ visits: s.visits.map(v => v.id === id ? updateVisitScore({ ...v, status }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'visit.status_changed', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${visit?.status} → ${status}` });
  },

  // Client Attendees
  addClientAttendee: (visitId, attendee) => {
    const visit = get().visits.find(v => v.id === visitId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, clientAttendees: [...v.clientAttendees, { ...attendee, id: generateId() }] }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'attendee.client_added', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${attendee.name} (${attendee.company})` });
  },

  updateClientAttendee: (visitId, attendeeId, changes) => {
    const visit = get().visits.find(v => v.id === visitId);
    const attendee = visit?.clientAttendees.find(a => a.id === attendeeId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, clientAttendees: v.clientAttendees.map(a => a.id === attendeeId ? { ...a, ...changes } : a) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'attendee.client_updated', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: attendee?.name });
  },

  deleteClientAttendee: (visitId, attendeeId) => {
    const visit = get().visits.find(v => v.id === visitId);
    const attendee = visit?.clientAttendees.find(a => a.id === attendeeId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, clientAttendees: v.clientAttendees.filter(a => a.id !== attendeeId) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'attendee.client_deleted', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: attendee?.name });
  },

  // Internal Attendees
  addInternalAttendee: (visitId, attendee) => {
    const visit = get().visits.find(v => v.id === visitId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, internalAttendees: [...v.internalAttendees, { ...attendee, id: generateId() }] }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'attendee.internal_added', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${attendee.name} (${attendee.role})` });
  },

  updateInternalAttendee: (visitId, attendeeId, changes) => {
    const visit = get().visits.find(v => v.id === visitId);
    const attendee = visit?.internalAttendees.find(a => a.id === attendeeId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, internalAttendees: v.internalAttendees.map(a => a.id === attendeeId ? { ...a, ...changes } : a) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'attendee.internal_updated', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: attendee?.name });
  },

  deleteInternalAttendee: (visitId, attendeeId) => {
    const visit = get().visits.find(v => v.id === visitId);
    const attendee = visit?.internalAttendees.find(a => a.id === attendeeId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, internalAttendees: v.internalAttendees.filter(a => a.id !== attendeeId) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'attendee.internal_deleted', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: attendee?.name });
  },

  toggleAttendeeConfirmed: (visitId, attendeeId) => {
    const visit = get().visits.find(v => v.id === visitId);
    const attendee = visit?.internalAttendees.find(a => a.id === attendeeId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, internalAttendees: v.internalAttendees.map(a => a.id === attendeeId ? { ...a, attendanceConfirmed: !a.attendanceConfirmed, attendanceConfirmedAt: !a.attendanceConfirmed ? new Date().toISOString() : undefined } : a) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'attendee.confirmed', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${attendee?.name} — ${attendee?.attendanceConfirmed ? 'unconfirmed' : 'confirmed'}` });
  },

  // Transport
  addTransport: (visitId, booking) => {
    const visit = get().visits.find(v => v.id === visitId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, transportBookings: [...v.transportBookings, { ...booking, id: generateId(), visitId }] }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'logistics.transport_added', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${booking.date} · ${booking.pickupLocation} → ${booking.dropoffLocation}` });
  },

  updateTransport: (visitId, bookingId, changes) => {
    const visit = get().visits.find(v => v.id === visitId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, transportBookings: v.transportBookings.map(b => b.id === bookingId ? { ...b, ...changes } : b) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'logistics.transport_updated', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit) });
  },

  deleteTransport: (visitId, bookingId) => {
    const visit = get().visits.find(v => v.id === visitId);
    const booking = visit?.transportBookings.find(b => b.id === bookingId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, transportBookings: v.transportBookings.filter(b => b.id !== bookingId) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'logistics.transport_deleted', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: booking ? `${booking.date} · ${booking.pickupLocation} → ${booking.dropoffLocation}` : undefined });
  },

  setTransportStatus: (visitId, bookingId, status) => {
    const visit = get().visits.find(v => v.id === visitId);
    const booking = visit?.transportBookings.find(b => b.id === bookingId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, transportBookings: v.transportBookings.map(b => b.id === bookingId ? { ...b, status } : b) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'logistics.transport_status_changed', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${booking?.date} · ${booking?.status} → ${status}` });
  },

  // Accommodation
  addAccommodation: (visitId, booking) => {
    const visit = get().visits.find(v => v.id === visitId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, accommodationBookings: [...v.accommodationBookings, { ...booking, id: generateId(), visitId }] }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'logistics.accommodation_added', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${booking.guestName} · ${booking.hotelName}` });
  },

  updateAccommodation: (visitId, bookingId, changes) => {
    const visit = get().visits.find(v => v.id === visitId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, accommodationBookings: v.accommodationBookings.map(b => b.id === bookingId ? { ...b, ...changes } : b) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'logistics.accommodation_updated', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit) });
  },

  deleteAccommodation: (visitId, bookingId) => {
    const visit = get().visits.find(v => v.id === visitId);
    const booking = visit?.accommodationBookings.find(b => b.id === bookingId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, accommodationBookings: v.accommodationBookings.filter(b => b.id !== bookingId) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'logistics.accommodation_deleted', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: booking ? `${booking.guestName} · ${booking.hotelName}` : undefined });
  },

  // Office Readiness
  addOfficeReadinessItem: (visitId, item) => {
    const visit = get().visits.find(v => v.id === visitId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, officeReadiness: [...v.officeReadiness, { ...item, id: generateId() }] }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'office.item_added', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: item.item });
  },

  toggleOfficeReadiness: (visitId, itemId, completedBy) => {
    const visit = get().visits.find(v => v.id === visitId);
    const item = visit?.officeReadiness.find(o => o.id === itemId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, officeReadiness: v.officeReadiness.map(o => o.id === itemId ? { ...o, completed: !o.completed, completedBy: !o.completed ? completedBy : undefined, completedAt: !o.completed ? new Date().toISOString() : undefined } : o) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'office.item_toggled', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${item?.item} — ${item?.completed ? 'unchecked' : 'completed'}` });
  },

  deleteOfficeReadinessItem: (visitId, itemId) => {
    const visit = get().visits.find(v => v.id === visitId);
    const item = visit?.officeReadiness.find(o => o.id === itemId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, officeReadiness: v.officeReadiness.filter(o => o.id !== itemId) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'office.item_deleted', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: item?.item });
  },

  loadOfficeTemplate: (visitId) => {
    const visit = get().visits.find(v => v.id === visitId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, officeReadiness: [...v.officeReadiness, ...OFFICE_READINESS_TEMPLATE.filter(t => !v.officeReadiness.some(o => o.item === t.item)).map(t => ({ ...t, id: generateId(), completed: false } as OfficeReadinessItem))] }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'office.template_loaded', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit) });
  },

  // Communications
  addCommunication: (visitId, comm) => {
    const visit = get().visits.find(v => v.id === visitId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, communications: [...v.communications, { ...comm, id: generateId(), visitId }] }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'comms.added', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${comm.type} · ${comm.subject}` });
  },

  updateCommunication: (visitId, commId, changes) => {
    const visit = get().visits.find(v => v.id === visitId);
    const comm = visit?.communications.find(c => c.id === commId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, communications: v.communications.map(c => c.id === commId ? { ...c, ...changes } : c) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'comms.updated', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: comm?.subject });
  },

  deleteCommunication: (visitId, commId) => {
    const visit = get().visits.find(v => v.id === visitId);
    const comm = visit?.communications.find(c => c.id === commId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, communications: v.communications.filter(c => c.id !== commId) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'comms.deleted', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: comm?.subject });
  },

  // Expenses
  addExpense: (visitId, expense) => {
    const visit = get().visits.find(v => v.id === visitId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, expenses: [...v.expenses, { ...expense, id: generateId(), visitId }] }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'expense.added', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${expense.category} · ${expense.currency} ${expense.amount} · ${expense.description}` });
  },

  updateExpense: (visitId, expenseId, changes) => {
    const visit = get().visits.find(v => v.id === visitId);
    const expense = visit?.expenses.find(e => e.id === expenseId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, expenses: v.expenses.map(e => e.id === expenseId ? { ...e, ...changes } : e) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'expense.updated', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: expense?.description });
  },

  deleteExpense: (visitId, expenseId, reason) => {
    const visit = get().visits.find(v => v.id === visitId);
    const expense = visit?.expenses.find(e => e.id === expenseId);
    const deleted: DeletedExpense | null = expense && visit
      ? { ...expense, visitRef: visit.visitRef, company: visit.company, deletedAt: new Date().toISOString(), deletedReason: reason }
      : null;
    set(s => ({
      visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, expenses: v.expenses.filter(e => e.id !== expenseId) }) : v),
      deletedExpenses: deleted ? [...s.deletedExpenses, deleted] : s.deletedExpenses,
    }));
    const u = actor();
    if (u) logAudit({ action: 'expense.deleted', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${expense?.description} · Reason: ${reason}` });
  },

  reinstateExpense: (expenseId) => {
    const deleted = get().deletedExpenses.find(e => e.id === expenseId);
    if (!deleted) return;
    const { visitRef: _vr, company: _co, deletedAt: _da, deletedReason: _dr, ...expense } = deleted;
    set(s => ({
      deletedExpenses: s.deletedExpenses.filter(e => e.id !== expenseId),
      visits: s.visits.map(v => v.id === deleted.visitId ? updateVisitScore({ ...v, expenses: [...v.expenses, expense] }) : v),
    }));
    const u = actor();
    if (u) logAudit({ action: 'expense.reinstated', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: `${deleted.visitRef} — ${deleted.company}`, details: deleted.description });
  },

  purgeDeletedExpense: (expenseId) => set(s => ({
    deletedExpenses: s.deletedExpenses.filter(e => e.id !== expenseId),
  })),

  setExpenseStatus: (visitId, expenseId, status, approvedBy) => {
    const visit = get().visits.find(v => v.id === visitId);
    const expense = visit?.expenses.find(e => e.id === expenseId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, expenses: v.expenses.map(e => e.id === expenseId ? { ...e, status, approvedBy: approvedBy || e.approvedBy, approvedAt: ['Approved', 'Rejected'].includes(status) ? new Date().toISOString() : e.approvedAt } : e) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'expense.status_changed', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${expense?.description} · ${expense?.status} → ${status}` });
  },

  // Tasks
  addTask: (visitId, task) => {
    const visit = get().visits.find(v => v.id === visitId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, tasks: [...v.tasks, { ...task, id: generateId(), visitId }] }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'task.added', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${task.title} · Assigned to ${task.assignedTo}` });
  },

  updateTask: (visitId, taskId, changes) => {
    const visit = get().visits.find(v => v.id === visitId);
    const task = visit?.tasks.find(t => t.id === taskId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, tasks: v.tasks.map(t => t.id === taskId ? { ...t, ...changes } : t) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'task.updated', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: task?.title });
  },

  deleteTask: (visitId, taskId) => {
    const visit = get().visits.find(v => v.id === visitId);
    const task = visit?.tasks.find(t => t.id === taskId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, tasks: v.tasks.filter(t => t.id !== taskId) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'task.deleted', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: task?.title });
  },

  setTaskStatus: (visitId, taskId, status) => {
    const visit = get().visits.find(v => v.id === visitId);
    const task = visit?.tasks.find(t => t.id === taskId);
    set(s => ({ visits: s.visits.map(v => v.id === visitId ? updateVisitScore({ ...v, tasks: v.tasks.map(t => t.id === taskId ? { ...t, status } : t) }) : v) }));
    const u = actor();
    if (u) logAudit({ action: 'task.status_changed', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: visitLabel(visit), details: `${task?.title} · ${task?.status} → ${status}` });
  },

  // Clients
  addClient: (client) => {
    set(s => ({ clients: [...s.clients, { ...client, id: generateId() }] }));
    const u = actor();
    if (u) logAudit({ action: 'client.created', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: client.name, details: client.company });
  },

  updateClient: (id, changes) => {
    const client = get().clients.find(c => c.id === id);
    set(s => ({
      clients: s.clients.map(c => c.id === id ? { ...c, ...changes } : c),
      visits: s.visits.map(v => ({
        ...v,
        clientAttendees: v.clientAttendees.map(a => a.id === id ? { ...a, ...changes } : a),
      })),
    }));
    const u = actor();
    if (u) logAudit({ action: 'client.updated', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: client?.name });
  },

  deleteClient: (id) => {
    const client = get().clients.find(c => c.id === id);
    set(s => ({ clients: s.clients.filter(c => c.id !== id) }));
    const u = actor();
    if (u) logAudit({ action: 'client.deleted', actorUid: u.uid, actorName: u.name, actorEmail: u.email, target: client?.name, details: client?.company });
  },
}), { name: 'techanywhere-app-store' }));
