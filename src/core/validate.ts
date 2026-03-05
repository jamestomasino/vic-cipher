import type { VicValidationResult } from "./types.js";

function normalizeSong(song: string): string {
  return song.replace(/[^A-Za-z0-9]/g, "");
}

function normalizeMessage(message: string): string {
  return message.replace(/[^A-Za-z0-9\.]/g, "");
}

function normalizeCode(code: string): string {
  return code.replace(/[^0-9]/g, "");
}

export function validateEncodeInput(song: string, message: string, mi: string, personalId: string | number, date: Date): VicValidationResult {
  const errors: string[] = [];

  if (normalizeSong(song).length < 20) {
    errors.push("Song must contain at least 20 alphanumeric characters.");
  }
  if (normalizeMessage(message).length === 0) {
    errors.push("Message must contain at least one valid character (A-Z, 0-9, .).");
  }
  if (!/^\d{5}$/.test(mi)) {
    errors.push("MI must be exactly 5 digits.");
  }

  const pid = Number(personalId);
  if (!Number.isInteger(pid) || pid < 0 || pid > 16) {
    errors.push("personalId must be an integer from 0 to 16.");
  }
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    errors.push("date must be a valid Date.");
  }

  return { ok: errors.length === 0, errors };
}

export function validateDecodeInput(song: string, code: string, personalId: string | number, date: Date): VicValidationResult {
  const errors: string[] = [];

  if (normalizeSong(song).length < 20) {
    errors.push("Song must contain at least 20 alphanumeric characters.");
  }
  if (normalizeCode(code).length === 0) {
    errors.push("Code must contain at least one numeric digit.");
  }

  const pid = Number(personalId);
  if (!Number.isInteger(pid) || pid < 0 || pid > 16) {
    errors.push("personalId must be an integer from 0 to 16.");
  }
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    errors.push("date must be a valid Date.");
  }

  return { ok: errors.length === 0, errors };
}
