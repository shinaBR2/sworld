type SEVERITY_TYPE = 'critical' | 'high' | 'medium' | 'low';

interface ErrorInfo {
  shouldAlert: boolean;
  shouldRetry: boolean;
  severity: SEVERITY_TYPE;
  userMessage: string;
}

type ErrorMap<TCodes extends Record<string, string>> = {
  [code in TCodes[keyof TCodes]]: ErrorInfo;
};

export type { ErrorInfo, ErrorMap, SEVERITY_TYPE };
