export type VisitStatus =
  | 'Draft'
  | 'Proposed'
  | 'Confirmed'
  | 'In Planning'
  | 'Ready for Arrival'
  | 'Active'
  | 'Completed'
  | 'Closed'
  | 'Cancelled';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
export type BookingStatus = 'Pending' | 'Booked' | 'Confirmed' | 'Cancelled';
export type ExpenseStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid';
export type ExpenseCategory = 'Transport' | 'Accommodation' | 'Meals' | 'Incidentals' | 'Other';
export type AttendeeType = 'Internal' | 'Client';
export type CommStatus = 'Draft' | 'Sent' | 'Delivered' | 'Failed';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string;
  dietaryRequirements?: string;
  accessibilityRequirements?: string;
  specialRequests?: string;
  policyOverrides?: string;
}

export interface InternalAttendee {
  id: string;
  name: string;
  role: string;
  department: string;
  location: 'Manila' | 'Remote';
  email: string;
  phone: string;
  managerConfirmed: boolean;
  attendanceConfirmed: boolean;
  attendanceConfirmedAt?: string;
  travelRequired: boolean;
  accommodationRequired: boolean;
}

export interface TransportBooking {
  id: string;
  visitId: string;
  date: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  driverName: string;
  driverContact: string;
  vehicleType: string;
  vehicleReg?: string;
  status: BookingStatus;
  notes?: string;
  cost?: number;
  currency?: string;
}

export interface AccommodationBooking {
  id: string;
  visitId: string;
  guestName: string;
  hotelName: string;
  hotelAddress: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  confirmationNumber?: string;
  status: BookingStatus;
  cost?: number;
  currency?: string;
}

export interface OfficeReadinessItem {
  id: string;
  category: 'AV & Tech' | 'Hospitality' | 'Access & Facilities' | 'Communication' | 'Signage';
  item: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

export interface CommunicationLog {
  id: string;
  visitId: string;
  type: 'Initial Planning' | 'Itinerary Confirmation' | 'Day-Before Reminder' | 'Day-Of Check-In' | 'Thank-You' | 'Follow-Up' | 'Internal' | 'Ad Hoc';
  subject: string;
  recipient: string;
  sentAt?: string;
  status: CommStatus;
  channel: 'Email' | 'WhatsApp' | 'Phone' | 'Slack';
  notes?: string;
}

export interface ReceiptFile {
  name: string;
  type: string;
  dataUrl: string;
}

export interface ExpenseClaim {
  id: string;
  visitId: string;
  claimantName: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  date: string;
  receiptAttached: boolean;
  receiptFile?: ReceiptFile;
  status: ExpenseStatus;
  approvedBy?: string;
  approvedAt?: string;
  exceptionApproved?: boolean;
  exceptionReason?: string;
  policyBreach?: boolean;
}

export interface DeletedExpense extends ExpenseClaim {
  visitRef: string;
  company: string;
  deletedAt: string;
  deletedReason: string;
}

export interface VisitTask {
  id: string;
  visitId: string;
  title: string;
  description?: string;
  assignedTo: string;
  dueDate: string;
  status: TaskStatus;
  phase: 'Initiation' | 'Pre-Arrival' | 'Logistics' | 'Office Prep' | 'Onsite' | 'Post-Visit';
  priority: 'High' | 'Medium' | 'Low';
}

export interface PostVisitReview {
  id: string;
  visitId: string;
  completedBy: string;
  completedAt?: string;
  wentWell: string;
  improvements: string;
  logisticsIssues: string;
  relationshipInsights: string;
  sopUpdatesNeeded: string;
  clientSatisfactionScore?: number;
  overallRating?: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface Visit {
  id: string;
  visitRef: string;
  clientId: string;
  clientName: string;
  company: string;
  purpose: string;
  status: VisitStatus;
  arrivalDate: string;
  departureDate: string;
  officeDays: string[];
  visitLead: string;
  operationsCoordinator?: string;
  clientAttendees: Client[];
  internalAttendees: InternalAttendee[];
  transportBookings: TransportBooking[];
  accommodationBookings: AccommodationBooking[];
  officeReadiness: OfficeReadinessItem[];
  communications: CommunicationLog[];
  expenses: ExpenseClaim[];
  tasks: VisitTask[];
  postVisitReview?: PostVisitReview;
  hotelName?: string;
  hotelAddress?: string;
  flightDetails?: string;
  visitGoals?: string;
  socialActivities?: string;
  specialRequirements?: string;
  createdAt: string;
  updatedAt: string;
  logisticsReadinessScore?: number;
}
