export interface IConfiguration {
    currency: "USD" | "GBP" | "EUR";
    tables: number[];
    printer: {
      ip: string;
      port: number;
      enabled: boolean;
    };
    theme: "light" | "dark" | "system";
    language: string;
    timezone: string;
    orderPrefix: string;
    nextOrderNumber: number;
    serviceChargeRate: number;
    users: { uname: string; password: string }[];
  }
  