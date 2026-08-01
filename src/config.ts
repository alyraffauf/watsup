import type {
  DashboardConfig,
  DashboardSection,
  GridColumns,
  Service,
  Widget,
  WidgetType,
} from "./types";

const DEFAULT_CONFIG_PATH = new URL("../config/default.toml", import.meta.url);
const VALID_COLUMNS = new Set([1, 2, 3, 4]);
const VALID_WIDGET_TYPES = new Set<WidgetType>([
  "weather",
  "search",
  "lobsters",
  "hacker-news",
]);

export async function loadDashboardConfig(): Promise<DashboardConfig> {
  const configPath = process.env.WATSUP_CONFIG_PATH ?? DEFAULT_CONFIG_PATH;
  const configFile = Bun.file(configPath);

  if (!(await configFile.exists())) {
    throw new Error(`Dashboard config not found at ${String(configPath)}`);
  }

  let value: unknown;
  try {
    value = Bun.TOML.parse(await configFile.text());
  } catch (error) {
    throw new Error(
      `Dashboard config is not valid TOML: ${getErrorMessage(error)}`,
    );
  }

  return parseDashboardConfig(value);
}

function parseDashboardConfig(value: unknown): DashboardConfig {
  const config = requireObject(value, "config");
  const sections = requireArray(config.sections, "config.sections").map(
    parseSection,
  );

  return {
    title: optionalString(config.title, "config.title"),
    sections,
  };
}

function parseSection(value: unknown, index: number): DashboardSection {
  const path = `config.sections[${index}]`;
  const section = requireObject(value, path);

  if (section.type === "services") {
    return {
      type: "services",
      title: requireString(section.title, `${path}.title`),
      columns: optionalColumns(section.columns, `${path}.columns`),
      refreshInterval: optionalPositiveNumber(
        section.refreshInterval,
        `${path}.refreshInterval`,
      ),
      services: requireArray(section.services, `${path}.services`).map(
        (service, serviceIndex) =>
          parseService(service, `${path}.services[${serviceIndex}]`),
      ),
    };
  }

  if (section.type === "widgets") {
    return {
      type: "widgets",
      columns: optionalColumns(section.columns, `${path}.columns`),
      widgets: requireArray(section.widgets, `${path}.widgets`).map(
        (widget, widgetIndex) =>
          parseWidget(widget, `${path}.widgets[${widgetIndex}]`),
      ),
    };
  }

  throw new Error(`${path}.type must be "services" or "widgets"`);
}

function parseService(value: unknown, path: string): Service {
  const service = requireObject(value, path);
  const goodStatuses = service.goodStatuses;

  return {
    name: requireString(service.name, `${path}.name`),
    url: requireHttpUrl(service.url, `${path}.url`),
    icon: optionalHttpUrl(service.icon, `${path}.icon`),
    healthUrl: optionalHttpUrl(service.healthUrl, `${path}.healthUrl`),
    goodStatuses:
      goodStatuses === undefined
        ? undefined
        : requireArray(goodStatuses, `${path}.goodStatuses`).map(
            (status, statusIndex) =>
              requireHttpStatus(status, `${path}.goodStatuses[${statusIndex}]`),
          ),
  };
}

function parseWidget(value: unknown, path: string): Widget {
  const widget = requireObject(value, path);
  if (!VALID_WIDGET_TYPES.has(widget.type as WidgetType)) {
    throw new Error(
      `${path}.type must be weather, search, lobsters, or hacker-news`,
    );
  }

  return {
    type: widget.type as WidgetType,
    title: optionalString(widget.title, `${path}.title`),
    span: optionalColumns(widget.span, `${path}.span`),
  };
}

function requireObject(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
  return value as Record<string, unknown>;
}

function requireArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
  return value;
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${path} must be a non-empty string`);
  }
  return value;
}

function optionalString(value: unknown, path: string): string | undefined {
  if (value === undefined) return undefined;
  return requireString(value, path);
}

function optionalColumns(
  value: unknown,
  path: string,
): GridColumns | undefined {
  if (value === undefined) return undefined;
  if (!VALID_COLUMNS.has(value as number)) {
    throw new Error(`${path} must be an integer from 1 through 4`);
  }
  return value as GridColumns;
}

function optionalPositiveNumber(
  value: unknown,
  path: string,
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${path} must be a positive number`);
  }
  return value;
}

function requireHttpStatus(value: unknown, path: string): number {
  if (
    !Number.isInteger(value) ||
    (value as number) < 100 ||
    (value as number) > 599
  ) {
    throw new Error(`${path} must be an HTTP status from 100 through 599`);
  }
  return value as number;
}

function requireHttpUrl(value: unknown, path: string): string {
  const url = requireString(value, path);
  if (!isHttpUrl(url)) throw new Error(`${path} must be an HTTP(S) URL`);
  return url;
}

function optionalHttpUrl(value: unknown, path: string): string | undefined {
  if (value === undefined) return undefined;
  return requireHttpUrl(value, path);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
