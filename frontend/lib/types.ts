export interface User {
  id: string;
  email: string;
  name: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  customDomain: string | null;
  tier: string;
}

export interface SubscriptionInfo {
  tier: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
}

export interface LimitsInfo {
  tier: string;
  maxProjects: number | null;
  currentProjects: number;
  canCreateMore: boolean;
  message: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  clientEmail: string | null;
  clientName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  files?: ProjectFile[];
  checklistItems?: ChecklistItem[];
  messages?: Message[];
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  url: string | null;
  size: number | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  fileId: string | null;
  userEmail: string | null;
  content: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  description: string | null;
  amount: string;
  status: 'pending' | 'sent' | 'overdue' | 'paid';
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

export type TaskStatus = 'todo' | 'doing' | 'blocked' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  assignedTo: string | null;
  dueDate: string | null;
  status: TaskStatus;
  lastActionBy: string | null;
  firstClientActionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSummary {
  todo: number;
  doing: number;
  blocked: number;
  done: number;
}

export type ContractStatus = 'draft' | 'sent' | 'pending' | 'signed' | 'declined';

export interface Contract {
  id: string;
  projectId: string;
  template: string;
  status: ContractStatus;
  clientEmail: string;
  fileUrl: string | null;
  signingUrl: string | null;
  sentAt: string | null;
  signedAt: string | null;
  createdAt: string;
}

export interface TaskCompletionReport {
  project_id: string;
  project_name: string;
  completion_rate: number;
}

export interface ClientResponseTimeReport {
  project_id: string;
  project_name: string;
  avg_response_time_hours: number;
}

export interface InvoiceStatusReport {
  paid: number;
  unpaid: number;
  overdue: number;
}

export interface PortalData {
  id: string;
  name: string;
  description: string | null;
  clientName: string | null;
  clientEmail: string | null;
  status: string;
  freelancer: { name: string | null; logoUrl: string | null; brandColor: string | null };
  files: ProjectFile[];
  checklistItems: ChecklistItem[];
  messages: Message[];
  payments: Payment[];
  tasks: Task[];
}
