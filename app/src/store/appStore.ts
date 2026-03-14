import { create } from 'zustand';
import type {
  Visit, Client, InternalAttendee, TransportBooking,
  AccommodationBooking, OfficeReadinessItem, CommunicationLog,
  ExpenseClaim, VisitTask, VisitStatus, BookingStatus, ExpenseStatus, TaskStatus, DeletedExpense
} from '../data/types';
import { MOCK_VISITS, MOCK_CLIENTS, OFFICE_READINESS_TEMPLATE } from '../data/mockData';

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

  // Visit CRUD
  addVisit: (visit: Omit<Visit, 'id' | 'visitRef' | 'createdAt' | 'updatedAt' | 'logisticsReadinessScore' | 'clientAttendees' | 'internalAttendees' | 'transportBookings' | 'accommodationBookings' | 'officeReadiness' | 'communications' | 'expenses' | 'tasks'>) => string;
  updateVisit: (id: string, changes: Partial<Visit>) => void;
  deleteVisit: (id: string) => void;
  setVisitStatus: (id: string, status: VisitStatus) => void;

  // Client Attendees
  addClientAttendee: (visitId: string, attendee: Omit<Client, 'id'>) => void;
  updateClientAttendee: (visitId: string, attendeeId: string, changes: Partial<Client>) => void;
  deleteClientAttendee: (visitId: string, attendeeId: string) => void;

  // Internal Attendees
  addInternalAttendee: (visitId: string, attendee: Omit<InternalAttendee, 'id'>) => void;
  updateInternalAttendee: (visitId: string, attendeeId: string, changes: Partial<InternalAttendee>) => void;
  deleteInternalAttendee: (visitId: string, attendeeId: string) => void;
  toggleAttendeeConfirmed: (visitId: string, attendeeId: string) => void;

  // Transport
  addTransport: (visitId: string, booking: Omit<TransportBooking, 'id' | 'visitId'>) => void;
  updateTransport: (visitId: string, bookingId: string, changes: Partial<TransportBooking>) => void;
  deleteTransport: (visitId: string, bookingId: string) => void;
  setTransportStatus: (visitId: string, bookingId: string, status: BookingStatus) => void;

  // Accommodation
  addAccommodation: (visitId: string, booking: Omit<AccommodationBooking, 'id' | 'visitId'>) => void;
  updateAccommodation: (visitId: string, bookingId: string, changes: Partial<AccommodationBooking>) => void;
  deleteAccommodation: (visitId: string, bookingId: string) => void;

  // Office Readiness
  addOfficeReadinessItem: (visitId: string, item: Omit<OfficeReadinessItem, 'id'>) => void;
  toggleOfficeReadiness: (visitId: string, itemId: string, completedBy: string) => void;
  deleteOfficeReadinessItem: (visitId: string, itemId: string) => void;
  loadOfficeTemplate: (visitId: string) => void;

  // Communications
  addCommunication: (visitId: string, comm: Omit<CommunicationLog, 'id' | 'visitId'>) => void;
  updateCommunication: (visitId: string, commId: string, changes: Partial<CommunicationLog>) => void;
  deleteCommunication: (visitId: string, commId: string) => void;

  // Expenses
  addExpense: (visitId: string, expense: Omit<ExpenseClaim, 'id' | 'visitId'>) => void;
  updateExpense: (visitId: string, expenseId: string, changes: Partial<ExpenseClaim>) => void;
  deleteExpense: (visitId: string, expenseId: string, reason: string) => void;
  reinstateExpense: (expenseId: string) => void;
  purgeDeletedExpense: (expenseId: string) => void;
  setExpenseStatus: (visitId: string, expenseId: string, status: ExpenseStatus, approvedBy?: string) => void;

  // Tasks
  addTask: (visitId: string, task: Omit<VisitTask, 'id' | 'visitId'>) => void;
  updateTask: (visitId: string, taskId: string, changes: Partial<VisitTask>) => void;
  deleteTask: (visitId: string, taskId: string) => void;
  setTaskStatus: (visitId: string, taskId: string, status: TaskStatus) => void;

  // Clients
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, changes: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

function updateVisitScore(visit: Visit): Visit {
  return { ...visit, logisticsReadinessScore: calcReadiness(visit), updatedAt: new Date().toISOString() };
}

let visitCounter = MOCK_VISITS.length + 1;

export const useAppStore = create<AppState>((set) => ({
  visits: MOCK_VISITS.map(v => ({ ...v, logisticsReadinessScore: calcReadiness(v) })),
  clients: MOCK_CLIENTS,
  deletedExpenses: [],

  addVisit: (data) => {
    const id = generateId();
    const ref = `MNL-2026-${String(visitCounter++).padStart(3, '0')}`;
    const visit: Visit = {
      ...data,
      id,
      visitRef: ref,
      clientAttendees: [],
      internalAttendees: [],
      transportBookings: [],
      accommodationBookings: [],
      officeReadiness: [],
      communications: [],
      expenses: [],
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logisticsReadinessScore: 0,
    };
    set(s => ({ visits: [...s.visits, visit] }));
    return id;
  },

  updateVisit: (id, changes) => set(s => ({
    visits: s.visits.map(v => v.id === id ? updateVisitScore({ ...v, ...changes }) : v)
  })),

  deleteVisit: (id) => set(s => ({ visits: s.visits.filter(v => v.id !== id) })),

  setVisitStatus: (id, status) => set(s => ({
    visits: s.visits.map(v => v.id === id ? updateVisitScore({ ...v, status }) : v)
  })),

  addClientAttendee: (visitId, attendee) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, clientAttendees: [...v.clientAttendees, { ...attendee, id: generateId() }] })
      : v)
  })),

  updateClientAttendee: (visitId, attendeeId, changes) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, clientAttendees: v.clientAttendees.map(a => a.id === attendeeId ? { ...a, ...changes } : a) })
      : v)
  })),

  deleteClientAttendee: (visitId, attendeeId) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, clientAttendees: v.clientAttendees.filter(a => a.id !== attendeeId) })
      : v)
  })),

  addInternalAttendee: (visitId, attendee) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, internalAttendees: [...v.internalAttendees, { ...attendee, id: generateId() }] })
      : v)
  })),

  updateInternalAttendee: (visitId, attendeeId, changes) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, internalAttendees: v.internalAttendees.map(a => a.id === attendeeId ? { ...a, ...changes } : a) })
      : v)
  })),

  deleteInternalAttendee: (visitId, attendeeId) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, internalAttendees: v.internalAttendees.filter(a => a.id !== attendeeId) })
      : v)
  })),

  toggleAttendeeConfirmed: (visitId, attendeeId) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({
          ...v,
          internalAttendees: v.internalAttendees.map(a =>
            a.id === attendeeId
              ? { ...a, attendanceConfirmed: !a.attendanceConfirmed, attendanceConfirmedAt: !a.attendanceConfirmed ? new Date().toISOString() : undefined }
              : a
          )
        })
      : v)
  })),

  addTransport: (visitId, booking) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, transportBookings: [...v.transportBookings, { ...booking, id: generateId(), visitId }] })
      : v)
  })),

  updateTransport: (visitId, bookingId, changes) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, transportBookings: v.transportBookings.map(b => b.id === bookingId ? { ...b, ...changes } : b) })
      : v)
  })),

  deleteTransport: (visitId, bookingId) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, transportBookings: v.transportBookings.filter(b => b.id !== bookingId) })
      : v)
  })),

  setTransportStatus: (visitId, bookingId, status) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, transportBookings: v.transportBookings.map(b => b.id === bookingId ? { ...b, status } : b) })
      : v)
  })),

  addAccommodation: (visitId, booking) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, accommodationBookings: [...v.accommodationBookings, { ...booking, id: generateId(), visitId }] })
      : v)
  })),

  updateAccommodation: (visitId, bookingId, changes) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, accommodationBookings: v.accommodationBookings.map(b => b.id === bookingId ? { ...b, ...changes } : b) })
      : v)
  })),

  deleteAccommodation: (visitId, bookingId) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, accommodationBookings: v.accommodationBookings.filter(b => b.id !== bookingId) })
      : v)
  })),

  addOfficeReadinessItem: (visitId, item) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, officeReadiness: [...v.officeReadiness, { ...item, id: generateId() }] })
      : v)
  })),

  toggleOfficeReadiness: (visitId, itemId, completedBy) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({
          ...v,
          officeReadiness: v.officeReadiness.map(o =>
            o.id === itemId
              ? { ...o, completed: !o.completed, completedBy: !o.completed ? completedBy : undefined, completedAt: !o.completed ? new Date().toISOString() : undefined }
              : o
          )
        })
      : v)
  })),

  deleteOfficeReadinessItem: (visitId, itemId) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, officeReadiness: v.officeReadiness.filter(o => o.id !== itemId) })
      : v)
  })),

  loadOfficeTemplate: (visitId) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({
          ...v,
          officeReadiness: [
            ...v.officeReadiness,
            ...OFFICE_READINESS_TEMPLATE
              .filter(t => !v.officeReadiness.some(o => o.item === t.item))
              .map(t => ({ ...t, id: generateId(), completed: false } as OfficeReadinessItem))
          ]
        })
      : v)
  })),

  addCommunication: (visitId, comm) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, communications: [...v.communications, { ...comm, id: generateId(), visitId }] })
      : v)
  })),

  updateCommunication: (visitId, commId, changes) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, communications: v.communications.map(c => c.id === commId ? { ...c, ...changes } : c) })
      : v)
  })),

  deleteCommunication: (visitId, commId) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, communications: v.communications.filter(c => c.id !== commId) })
      : v)
  })),

  addExpense: (visitId, expense) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, expenses: [...v.expenses, { ...expense, id: generateId(), visitId }] })
      : v)
  })),

  updateExpense: (visitId, expenseId, changes) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, expenses: v.expenses.map(e => e.id === expenseId ? { ...e, ...changes } : e) })
      : v)
  })),

  deleteExpense: (visitId, expenseId, reason) => set(s => {
    const visit = s.visits.find(v => v.id === visitId);
    const expense = visit?.expenses.find(e => e.id === expenseId);
    const deleted: DeletedExpense | null = expense && visit
      ? { ...expense, visitRef: visit.visitRef, company: visit.company, deletedAt: new Date().toISOString(), deletedReason: reason }
      : null;
    return {
      visits: s.visits.map(v => v.id === visitId
        ? updateVisitScore({ ...v, expenses: v.expenses.filter(e => e.id !== expenseId) })
        : v),
      deletedExpenses: deleted ? [...s.deletedExpenses, deleted] : s.deletedExpenses,
    };
  }),

  reinstateExpense: (expenseId) => set(s => {
    const deleted = s.deletedExpenses.find(e => e.id === expenseId);
    if (!deleted) return s;
    const { visitRef: _vr, company: _co, deletedAt: _da, deletedReason: _dr, ...expense } = deleted;
    return {
      deletedExpenses: s.deletedExpenses.filter(e => e.id !== expenseId),
      visits: s.visits.map(v => v.id === deleted.visitId
        ? updateVisitScore({ ...v, expenses: [...v.expenses, expense] })
        : v),
    };
  }),

  purgeDeletedExpense: (expenseId) => set(s => ({
    deletedExpenses: s.deletedExpenses.filter(e => e.id !== expenseId),
  })),

  setExpenseStatus: (visitId, expenseId, status, approvedBy) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({
          ...v,
          expenses: v.expenses.map(e =>
            e.id === expenseId
              ? { ...e, status, approvedBy: approvedBy || e.approvedBy, approvedAt: ['Approved', 'Rejected'].includes(status) ? new Date().toISOString() : e.approvedAt }
              : e
          )
        })
      : v)
  })),

  addTask: (visitId, task) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, tasks: [...v.tasks, { ...task, id: generateId(), visitId }] })
      : v)
  })),

  updateTask: (visitId, taskId, changes) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, tasks: v.tasks.map(t => t.id === taskId ? { ...t, ...changes } : t) })
      : v)
  })),

  deleteTask: (visitId, taskId) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, tasks: v.tasks.filter(t => t.id !== taskId) })
      : v)
  })),

  setTaskStatus: (visitId, taskId, status) => set(s => ({
    visits: s.visits.map(v => v.id === visitId
      ? updateVisitScore({ ...v, tasks: v.tasks.map(t => t.id === taskId ? { ...t, status } : t) })
      : v)
  })),

  addClient: (client) => set(s => ({
    clients: [...s.clients, { ...client, id: generateId() }]
  })),

  updateClient: (id, changes) => set(s => ({
    clients: s.clients.map(c => c.id === id ? { ...c, ...changes } : c)
  })),

  deleteClient: (id) => set(s => ({
    clients: s.clients.filter(c => c.id !== id)
  })),
}));
