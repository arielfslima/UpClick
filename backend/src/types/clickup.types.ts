export interface ClickUpTask {
  id: string;
  name: string;
  description?: string;
  status: {
    status: string;
    color: string;
  };
  assignees: ClickUpAssignee[];
  time_estimate: number | null; // milliseconds
  time_spent: number | null; // milliseconds
  custom_fields?: ClickUpCustomField[];
  date_created: string;
  date_updated: string;
  date_closed: string | null;
  creator: {
    id: number;
    username: string;
    email: string;
  };
  tags: ClickUpTag[];
  priority: {
    id: string;
    priority: string;
    color: string;
  } | null;
  due_date: string | null;
  url: string;
  space: {
    id: string;
  };
}

export interface ClickUpAssignee {
  id: number;
  username: string;
  email: string;
  color: string;
  initials: string;
  profilePicture?: string;
}

export interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  type_config: any;
  date_created: string;
  hide_from_guests: boolean;
  value: any;
}

export interface ClickUpTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
  creator: number;
}

export interface ClickUpList {
  id: string;
  name: string;
  orderindex: number;
  status: any;
  priority: any;
  assignee: any;
  task_count: number;
  due_date: string | null;
  start_date: string | null;
  space: {
    id: string;
    name: string;
  };
}

export interface ClickUpSpace {
  id: string;
  name: string;
  private: boolean;
  statuses: Array<{
    status: string;
    type: string;
    orderindex: number;
    color: string;
  }>;
  multiple_assignees: boolean;
  features: {
    due_dates: {
      enabled: boolean;
      start_date: boolean;
      remap_due_dates: boolean;
      remap_closed_due_date: boolean;
    };
    time_tracking: {
      enabled: boolean;
    };
    tags: {
      enabled: boolean;
    };
    time_estimates: {
      enabled: boolean;
    };
    checklists: {
      enabled: boolean;
    };
    custom_fields: {
      enabled: boolean;
    };
    remap_dependencies: {
      enabled: boolean;
    };
    dependency_warning: {
      enabled: boolean;
    };
    portfolios: {
      enabled: boolean;
    };
  };
}

export interface ClickUpWebhookEvent {
  event: string;
  task_id: string;
  webhook_id: string;
  history_items: Array<{
    id: string;
    type: number;
    date: string;
    field: string;
    parent_id: string;
    data: any;
    source: string | null;
    user: {
      id: number;
      username: string;
      email: string;
      color: string;
      initials: string;
      profilePicture: string | null;
    };
    before: any;
    after: any;
  }>;
}
