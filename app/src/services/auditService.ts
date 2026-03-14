import { collection, addDoc, getDocs, orderBy, query, limit, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type AuditAction =
  | 'auth.login' | 'auth.logout'
  | 'settings.user_created' | 'settings.user_deleted' | 'settings.role_changed' | 'settings.policy_updated'
  | 'visit.created' | 'visit.updated' | 'visit.deleted' | 'visit.status_changed'
  | 'attendee.client_added' | 'attendee.client_updated' | 'attendee.client_deleted'
  | 'attendee.internal_added' | 'attendee.internal_updated' | 'attendee.internal_deleted' | 'attendee.confirmed'
  | 'logistics.transport_added' | 'logistics.transport_updated' | 'logistics.transport_deleted' | 'logistics.transport_status_changed'
  | 'logistics.accommodation_added' | 'logistics.accommodation_updated' | 'logistics.accommodation_deleted'
  | 'office.item_toggled' | 'office.item_added' | 'office.item_deleted' | 'office.template_loaded'
  | 'comms.added' | 'comms.updated' | 'comms.deleted'
  | 'expense.added' | 'expense.updated' | 'expense.deleted' | 'expense.reinstated' | 'expense.status_changed'
  | 'task.added' | 'task.updated' | 'task.deleted' | 'task.status_changed'
  | 'client.created' | 'client.updated' | 'client.deleted';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actorUid: string;
  actorName: string;
  actorEmail: string;
  target?: string;
  details?: string;
  timestamp: Timestamp | null;
}

interface LogAuditParams {
  action: AuditAction;
  actorUid: string;
  actorName: string;
  actorEmail: string;
  target?: string;
  details?: string;
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      ...params,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Failed to write audit log:', err);
  }
}

export async function fetchAuditLogs(limitCount = 200): Promise<AuditLogEntry[]> {
  const snap = await getDocs(
    query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(limitCount))
  );
  return snap.docs.map(d => ({
    id: d.id,
    action: d.data().action,
    actorUid: d.data().actorUid,
    actorName: d.data().actorName,
    actorEmail: d.data().actorEmail,
    target: d.data().target,
    details: d.data().details,
    timestamp: d.data().timestamp ?? null,
  }));
}
