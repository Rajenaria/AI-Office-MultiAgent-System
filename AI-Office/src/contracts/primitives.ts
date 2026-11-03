import { z } from "zod";

export const ProjectIdSchema = z.uuid();
export const ReferenceIdSchema = z.string().min(1).max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
export const PositiveVersionSchema = z.int().positive();
export const GenerationSchema = z.int().nonnegative();

// Portable timestamps are explicit UTC instants with millisecond precision.
// No Date/string coercion or implicit local timezone interpretation.
export const TimestampSchema = z.iso.datetime({ precision: 3 });
export const ShortTextSchema = z.string().min(1).max(200)
  .refine((value) => value.trim() === value && /\S/.test(value), "Expected nonblank, unpadded text");

// A deliberately portable lexical representation, not filesystem authorization.
// M01-03/04 must resolve the real root and reject symlink/junction escapes.
export const ProjectRelativePathSchema = z.string().min(1).max(1024).refine((value) => {
  if (/[<>:"\\|?*%\u0000-\u001f\u007f]/.test(value)) return false;
  return value.split("/").every((part) =>
    part.length > 0 && part.length <= 255 && part !== "." && part !== ".." &&
    part.trim() === part && !part.endsWith(".") &&
    !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(part),
  );
}, "Expected a portable project-relative path with forward slashes");

export const ContentHashSchema = z.string().regex(/^[a-f0-9]{64}$/, "Expected lowercase SHA-256 hex");
