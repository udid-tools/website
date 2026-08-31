export type DeviceResult = {
  udid: string;
  imei: string;
  meid: string;
  product: string;
  serial: string;
  version: string;
};

export const sampleDeviceResult: DeviceResult = {
  udid: "00008101-000A1C3E1234567E",
  imei: "353456789012345",
  meid: "A100000A2BC4D6",
  product: "iPhone16,1",
  serial: "F2LXN4KDJKLF",
  version: "iOS 17.4.1 (21E236)",
};

export function hasDeviceResult(result: DeviceResult) {
  return Object.values(result).some(Boolean);
}
