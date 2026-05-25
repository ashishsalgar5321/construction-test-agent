export interface SampleRequirement {
  icon: string
  text: string
  value: string
}

/** 25 construction / OpenProject workflow samples for Quick Select. */
export const SAMPLE_REQUIREMENTS: SampleRequirement[] = [
  {
    icon: '📦',
    text: 'Work package creation & assignment',
    value:
      'A site engineer creates a work package for a safety issue and assigns it to a contractor with a due date.',
  },
  {
    icon: '⏰',
    text: 'Due date & overdue tracking',
    value:
      'A work package with a due date should appear as overdue after the date passes and notify the project manager.',
  },
  {
    icon: '🔐',
    text: 'Role-based access control',
    value:
      'Only authorized users with the role of Site Engineer or Project Manager can update or close safety-related work packages.',
  },
  {
    icon: '📊',
    text: 'Dashboard validation',
    value:
      'The project manager dashboard should show correct counts of open, overdue, and closed work packages with proper filters.',
  },
  {
    icon: '🔄',
    text: 'Status transition flow',
    value:
      'A contractor updates a work package status from Open to In Progress and finally to Closed after completing the task.',
  },
  {
    icon: '💰',
    text: 'Budget & cost tracking',
    value:
      'A project manager logs labor and material costs against a work package and the project budget updates with remaining balance.',
  },
  {
    icon: '⏱️',
    text: 'Time logging on work packages',
    value:
      'A contractor logs 8 hours of work on an assigned work package and the time entry appears on the project timesheet.',
  },
  {
    icon: '📎',
    text: 'Document attachment upload',
    value:
      'A site engineer attaches a safety inspection PDF to a work package and the document is visible to the project team.',
  },
  {
    icon: '📅',
    text: 'Gantt chart milestone update',
    value:
      'A project manager moves a Gantt milestone date and dependent work packages shift their start dates accordingly.',
  },
  {
    icon: '📝',
    text: 'Meeting minutes creation',
    value:
      'After a site meeting, the project manager creates meeting minutes linked to related work packages and assigns follow-up actions.',
  },
  {
    icon: '🏗️',
    text: 'Multi-project switching',
    value:
      'A user with access to multiple construction projects can switch between projects and see only work packages for the selected project.',
  },
  {
    icon: '🏷️',
    text: 'Custom field validation',
    value:
      'A work package requires a custom field "Permit Number" before it can move to In Progress; saving without it shows a validation error.',
  },
  {
    icon: '💬',
    text: 'Comments & @mentions',
    value:
      'A site engineer adds a comment on a work package mentioning the contractor, and the contractor receives a notification.',
  },
  {
    icon: '🔔',
    text: 'Assignment notification',
    value:
      'When a work package is assigned to a contractor, they receive an email and in-app notification with due date and priority.',
  },
  {
    icon: '🔍',
    text: 'Search & filter work packages',
    value:
      'A project manager filters work packages by status Open, priority High, and assignee to find overdue safety items quickly.',
  },
  {
    icon: '📋',
    text: 'Bulk status update',
    value:
      'A project manager selects five work packages and bulk-updates their status from Open to In Progress in one action.',
  },
  {
    icon: '🌳',
    text: 'Parent-child work package hierarchy',
    value:
      'A parent work package "Foundation Phase" contains child tasks; closing the parent is blocked until all children are Closed.',
  },
  {
    icon: '📜',
    text: 'Version history & audit trail',
    value:
      'When a work package description is edited, the change is recorded in version history with user name and timestamp.',
  },
  {
    icon: '📤',
    text: 'Export work packages to CSV',
    value:
      'A project manager exports filtered work packages to CSV including ID, subject, status, assignee, and due date columns.',
  },
  {
    icon: '🗓️',
    text: 'Calendar view deadlines',
    value:
      'Work package due dates appear on the project calendar view; overdue items are highlighted in red for the project manager.',
  },
  {
    icon: '⚠️',
    text: 'Risk register entry',
    value:
      'A site engineer creates a risk register entry linked to a work package with probability, impact, and mitigation plan.',
  },
  {
    icon: '👷',
    text: 'Subcontractor portal access',
    value:
      'An external subcontractor logs in with limited access and can only view and update work packages assigned to their company.',
  },
  {
    icon: '📱',
    text: 'Mobile field inspection report',
    value:
      'A site engineer submits a mobile field inspection with photos; a work package is auto-created for any failed checklist item.',
  },
  {
    icon: '🔗',
    text: 'Webhook on status change',
    value:
      'When a work package status changes to Closed, a webhook fires to notify the external ERP system with work package ID and closure date.',
  },
  {
    icon: '🚫',
    text: 'Duplicate work package detection',
    value:
      'Creating a work package with the same subject and project as an existing open item shows a warning and prevents duplicate submission.',
  },
]
