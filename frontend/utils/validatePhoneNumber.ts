import { parsePhoneNumberFromString } from "libphonenumber-js";

export function isValidVNPhone(raw: string) {
    const value = raw.trim();
    const phone = parsePhoneNumberFromString(value, "VN");
    return !!phone && phone.isValid();
}

export function normalizeToE164VN(raw: string) {
    const phone = parsePhoneNumberFromString(raw.trim(), "VN");
    return phone?.isValid() ? phone.number : null;
}

export function isValidVNMobile(raw: string) {
    const v = raw.replace(/\s|\.|\-/g, "");
    return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(v);
}