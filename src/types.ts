export type GridColumns = 1 | 2 | 3 | 4;

export type Service = {
  name: string;
  url: string;
  icon?: string;
  healthUrl?: string;
  goodStatuses?: number[];
};

export type ServicesSection = {
  type: "services";
  title: string;
  columns?: GridColumns;
  refreshInterval?: number;
  services: Service[];
};

export type WidgetType = "weather" | "search" | "lobsters" | "hacker-news";

export type Widget = {
  type: WidgetType;
  title?: string;
  span?: GridColumns;
};

export type WidgetsSection = {
  type: "widgets";
  columns?: GridColumns;
  widgets: Widget[];
};

export type DashboardSection = ServicesSection | WidgetsSection;

export type DashboardConfig = {
  title?: string;
  sections: DashboardSection[];
};
